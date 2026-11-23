import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CHARACTERS,
  CHARACTER_ORDER,
  CharacterId,
  REALMS,
  RealmId,
  WeaponForm,
} from '../data/imperiumLore';
import { ImperiumAudioEngine } from '../audio/ImperiumAudioEngine';
import { createProceduralTextures } from '../three/proceduralTextures';
import { buildCharacterRig, CharacterRig } from '../three/characterBuilders';
import {
  buildClockworkSentinel,
  buildOuroborosBoss,
  EnemyEntity,
} from '../three/enemyBuilders';
import { buildRealmEnvironment, RealmInstance } from '../three/realmBuilders';

export type CombatActionType = 'attack' | 'heavy' | 'dash' | 'jump';

export interface ImperiumViewportProps {
  activeChar: CharacterId;
  activeRealm: RealmId;
  weaponForms: Record<CharacterId, WeaponForm>;
  audioEngine: ImperiumAudioEngine;
  onSwitchCharacter: (id: CharacterId) => void;
  onToggleWeaponForm: () => void;
  onCombatEvent: (event: {
    type: 'conjunction' | 'hit' | 'transform' | 'realm';
    label: string;
  }) => void;
  actionTriggerRef: React.MutableRefObject<((action: CombatActionType) => void) | null>;
}

// Module-level reusable math helpers (zero GC in animation loop)
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _toEnemy = new THREE.Vector3();

interface ShockwaveVfx {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  active: boolean;
  age: number;
  maxAge: number;
  maxScale: number;
}

export const ImperiumViewport: React.FC<ImperiumViewportProps> = ({
  activeChar,
  activeRealm,
  weaponForms,
  audioEngine,
  onSwitchCharacter,
  onToggleWeaponForm,
  onCombatEvent,
  actionTriggerRef,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Sync reactive props into mutable refs so WebGL scene never tears down on state changes
  const activeCharRef = useRef<CharacterId>(activeChar);
  const activeRealmRef = useRef<RealmId>(activeRealm);
  const weaponFormsRef = useRef<Record<CharacterId, WeaponForm>>(weaponForms);
  const callbacksRef = useRef({ onSwitchCharacter, onToggleWeaponForm, onCombatEvent });
  callbacksRef.current = { onSwitchCharacter, onToggleWeaponForm, onCombatEvent };

  // Detect character switches to trigger Conjunction Tag-Team entry burst
  const prevCharRef = useRef<CharacterId>(activeChar);
  const switchTriggerQueueRef = useRef<{ target: CharacterId } | null>(null);

  useEffect(() => {
    if (prevCharRef.current !== activeChar) {
      switchTriggerQueueRef.current = { target: activeChar };
      prevCharRef.current = activeChar;
    }
    activeCharRef.current = activeChar;
  }, [activeChar]);

  useEffect(() => {
    weaponFormsRef.current = weaponForms;
  }, [weaponForms]);

  // Realm swap ref hook
  const realmSwapFnRef = useRef<((realmId: RealmId) => void) | null>(null);
  useEffect(() => {
    if (activeRealmRef.current !== activeRealm) {
      activeRealmRef.current = activeRealm;
      realmSwapFnRef.current?.(activeRealm);
    }
  }, [activeRealm]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL cleanly from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL2 bağlamı başlatılamadı.');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D grafik bağlamı geçici olarak kesildi.');
    };
    const onContextRestored = () => {
      setWebglError(null);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // 2. Scene, Camera, Environment Reflections (PMREM RoomEnvironment)
    const scene = new THREE.Scene();
    const initialRealmSpec = REALMS[activeRealmRef.current];
    scene.background = new THREE.Color(initialRealmSpec.skyColor);
    scene.fog = new THREE.FogExp2(initialRealmSpec.fogColor, initialRealmSpec.fogDensity);

    const camera = new THREE.PerspectiveCamera(
      52,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      180
    );
    camera.position.set(0, 6.2, 13.5);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3. Balanced 3-Point Studio Lighting Rig (Key + Hemi + Rim)
    const keyLight = new THREE.DirectionalLight(
      initialRealmSpec.keyLightColor,
      initialRealmSpec.keyLightIntensity
    );
    keyLight.position.set(14, 22, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 65;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(
      initialRealmSpec.hemiSkyColor,
      initialRealmSpec.hemiGroundColor,
      1.15
    );
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(initialRealmSpec.accentColor, 1.35);
    rimLight.position.set(-14, 10, -16);
    scene.add(rimLight);

    // 4. Procedural Textures + Current Realm
    const textures = createProceduralTextures(renderer.capabilities.getMaxAnisotropy());
    let currentRealmInstance: RealmInstance = buildRealmEnvironment(activeRealmRef.current, textures);
    scene.add(currentRealmInstance.group);

    realmSwapFnRef.current = (newRealmId: RealmId) => {
      const spec = REALMS[newRealmId];
      scene.remove(currentRealmInstance.group);
      currentRealmInstance.dispose();
      currentRealmInstance = buildRealmEnvironment(newRealmId, textures);
      scene.add(currentRealmInstance.group);

      (scene.background as THREE.Color).setHex(spec.skyColor);
      scene.fog = new THREE.FogExp2(spec.fogColor, spec.fogDensity);
      keyLight.color.setHex(spec.keyLightColor);
      keyLight.intensity = spec.keyLightIntensity;
      hemiLight.color.setHex(spec.hemiSkyColor);
      hemiLight.groundColor.setHex(spec.hemiGroundColor);
      rimLight.color.setHex(spec.accentColor);
      audioEngine.playRealmShift();
      callbacksRef.current.onCombatEvent({
        type: 'realm',
        label: `${spec.name} · ${spec.subtitle}`,
      });
    };

    // 5. Build All 3 Protagonist Rigs (instant zero-latency swapping)
    const charRigs: Record<CharacterId, CharacterRig> = {
      enes: buildCharacterRig('enes', textures, isSoftwareGl),
      demirhan: buildCharacterRig('demirhan', textures, isSoftwareGl),
      selinay: buildCharacterRig('selinay', textures, isSoftwareGl),
    };
    CHARACTER_ORDER.forEach((cid) => {
      charRigs[cid].root.visible = cid === activeCharRef.current;
      scene.add(charRigs[cid].root);
    });

    // 6. Build Enemies: The Ouroboros Automaton + 3 Clockwork Sentinels
    const boss = buildOuroborosBoss(textures);
    scene.add(boss.root);
    const enemies: EnemyEntity[] = [
      boss,
      buildClockworkSentinel('sentinel-1', textures, 0.7, 8.2),
      buildClockworkSentinel('sentinel-2', textures, 2.6, 8.8),
      buildClockworkSentinel('sentinel-3', textures, 4.4, 7.6),
    ];
    enemies.forEach((e) => {
      if (!e.isBoss) scene.add(e.root);
    });

    // 7. Pooled Shockwave VFX Rings (Zero GC)
    const vfxPool: ShockwaveVfx[] = [];
    const ringGeo = new THREE.RingGeometry(0.6, 1.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      vfxPool.push({ mesh, mat, active: false, age: 0, maxAge: 0.45, maxScale: 4 });
    }

    const spawnShockwave = (
      x: number,
      y: number,
      z: number,
      colorHex: number,
      maxScale: number,
      maxAge = 0.45
    ) => {
      const slot = vfxPool.find((v) => !v.active) ?? vfxPool[0];
      slot.active = true;
      slot.age = 0;
      slot.maxAge = maxAge;
      slot.maxScale = maxScale;
      slot.mat.color.setHex(colorHex);
      slot.mat.opacity = 0.92;
      slot.mesh.position.set(x, Math.max(0.08, y), z);
      slot.mesh.scale.setScalar(0.35);
      slot.mesh.visible = true;
    };

    // Pre-compile shaders on GPU to eliminate first-swing stutter
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 8. Player Physics, Combat & Camera State
    const playerPos = new THREE.Vector3(0, 0, 5.5);
    const playerVel = new THREE.Vector3(0, 0, 0);
    let playerYaw = Math.PI; // facing arena center / boss
    let jumpCount = 0;
    let attackTimer = 0;
    let attackIsHeavy = false;
    let dashTimer = 0;
    let comboHits = 0;
    let comboResetTimer = 0;
    let slowMoTimer = 0;
    let diegeticEnergy = 0.85; // 0..1 visible on armor core / boilers / crystals
    let conjunctionCooldown = 0;

    // Camera orbital state
    let camYaw = 0;
    let camPitch = 0.36;
    let camDistance = 12.2;
    let isDragging = false;
    let dragMoved = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    // Keyboard state
    const keys: Record<string, boolean> = {};

    const performAction = (action: CombatActionType) => {
      audioEngine.unlockAndStart(activeCharRef.current);
      const cid = activeCharRef.current;
      const spec = CHARACTERS[cid];
      const form = weaponFormsRef.current[cid];
      const colorHex = cid === 'enes' ? 0xd4af37 : cid === 'demirhan' ? 0xea580c : 0x38bdf8;

      if (action === 'jump') {
        if (jumpCount < 2) {
          playerVel.y = spec.jumpForce;
          jumpCount++;
          spawnShockwave(playerPos.x, playerPos.y + 0.1, playerPos.z, colorHex, 1.8, 0.3);
        }
        return;
      }

      if (action === 'dash') {
        dashTimer = 0.22;
        const dashSpeed = cid === 'selinay' ? 25 : cid === 'enes' ? 20 : 15;
        playerVel.x = Math.sin(playerYaw) * dashSpeed;
        playerVel.z = Math.cos(playerYaw) * dashSpeed;
        spawnShockwave(playerPos.x, playerPos.y + 0.35, playerPos.z, colorHex, 2.4, 0.32);
        audioEngine.playTransform(cid, form);
        return;
      }

      if (action === 'attack' || action === 'heavy') {
        const isHeavy = action === 'heavy';
        attackTimer = isHeavy ? 0.42 : 0.28;
        attackIsHeavy = isHeavy;
        audioEngine.playAttack(cid, form, isHeavy);

        // Forward combat lunge
        playerPos.x += Math.sin(playerYaw) * (isHeavy ? 1.15 : 0.65);
        playerPos.z += Math.cos(playerYaw) * (isHeavy ? 1.15 : 0.65);

        const reach = isHeavy ? 6.2 : 4.4;
        const strikeX = playerPos.x + Math.sin(playerYaw) * (isHeavy ? 2.1 : 1.6);
        const strikeZ = playerPos.z + Math.cos(playerYaw) * (isHeavy ? 2.1 : 1.6);
        spawnShockwave(strikeX, playerPos.y + 0.4, strikeZ, colorHex, isHeavy ? 4.8 : 2.9, 0.38);

        let landedHit = false;
        enemies.forEach((enemy) => {
          _toEnemy.copy(enemy.pos).setY(0);
          const dx = _toEnemy.x - strikeX;
          const dz = _toEnemy.z - strikeZ;
          const dist = Math.hypot(dx, dz);
          const hitRadius = enemy.isBoss ? reach + 2.5 : reach;
          if (dist <= hitRadius) {
            landedHit = true;
            enemy.hitFlashTimer = 0.22;
            enemy.stunTimer = isHeavy ? 1.0 : 0.45;
            const dmg = isHeavy ? (cid === 'demirhan' ? 95 : 70) : 35;
            enemy.hp = Math.max(20, enemy.hp - dmg);
            if (enemy.hp <= 20) enemy.hp = enemy.maxHp; // Endless showcase sparring loop

            // Knockback & Aerial Juggle Physics
            if (!enemy.isBoss) {
              const push = isHeavy ? 5.5 : 2.8;
              const nx = dist > 0.01 ? dx / dist : Math.sin(playerYaw);
              const nz = dist > 0.01 ? dz / dist : Math.cos(playerYaw);
              enemy.vel.x = nx * push;
              enemy.vel.z = nz * push;

              if (cid === 'selinay' && isHeavy) {
                // Selinay launches enemies high for Tag-Team Conjunction!
                enemy.vel.y = 11.5;
                enemy.airborne = true;
              } else if (cid === 'demirhan' && enemy.airborne) {
                // Demirhan slams airborne enemies down into the floor!
                enemy.vel.y = -18;
                spawnShockwave(enemy.pos.x, 0.15, enemy.pos.z, 0xea580c, 6.2, 0.52);
              } else if (isHeavy) {
                enemy.vel.y = 6.2;
                enemy.airborne = true;
              }
            }
          }
        });

        if (landedHit) {
          comboHits++;
          comboResetTimer = 4.2;
          diegeticEnergy = Math.min(1.0, diegeticEnergy + 0.14);
          audioEngine.playHit(false);
          callbacksRef.current.onCombatEvent({
            type: 'hit',
            label: `${spec.name} · ${isHeavy ? spec.secondaryFormName : spec.primaryFormName}`,
          });
        }
      }
    };

    actionTriggerRef.current = performAction;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        performAction('jump');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        performAction('dash');
      } else if (e.code === 'KeyJ') {
        performAction('attack');
      } else if (e.code === 'KeyK') {
        performAction('heavy');
      } else if (e.code === 'KeyF') {
        audioEngine.unlockAndStart(activeCharRef.current);
        const nextForm: WeaponForm =
          weaponFormsRef.current[activeCharRef.current] === 'primary' ? 'secondary' : 'primary';
        audioEngine.playTransform(activeCharRef.current, nextForm);
        callbacksRef.current.onToggleWeaponForm();
        const cid = activeCharRef.current;
        const colorHex = cid === 'enes' ? 0xd4af37 : cid === 'demirhan' ? 0xea580c : 0x38bdf8;
        spawnShockwave(playerPos.x, playerPos.y + 1.0, playerPos.z, colorHex, 3.2, 0.36);
      } else if (e.code === 'Digit1') {
        audioEngine.unlockAndStart('enes');
        callbacksRef.current.onSwitchCharacter('enes');
      } else if (e.code === 'Digit2') {
        audioEngine.unlockAndStart('demirhan');
        callbacksRef.current.onSwitchCharacter('demirhan');
      } else if (e.code === 'Digit3') {
        audioEngine.unlockAndStart('selinay');
        callbacksRef.current.onSwitchCharacter('selinay');
      } else if (e.code === 'KeyQ' || e.code === 'KeyE') {
        const idx = CHARACTER_ORDER.indexOf(activeCharRef.current);
        const dir = e.code === 'KeyE' ? 1 : -1;
        const next = CHARACTER_ORDER[(idx + dir + CHARACTER_ORDER.length) % CHARACTER_ORDER.length];
        audioEngine.unlockAndStart(next);
        callbacksRef.current.onSwitchCharacter(next);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      audioEngine.unlockAndStart(activeCharRef.current);
      isDragging = true;
      dragMoved = false;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
      camYaw -= dx * 0.0055;
      camPitch = THREE.MathUtils.clamp(camPitch + dy * 0.0045, 0.08, 1.15);
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging && !dragMoved && e.button === 0) {
        performAction('attack');
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camDistance = THREE.MathUtils.clamp(camDistance + e.deltaY * 0.008, 6.5, 22);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Animation & Physics Loop (Paced cleanly on Software WebGL via afterDraw)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;

      const rawDt = Math.min(clock.getDelta(), 0.05);
      const timeScale = slowMoTimer > 0 ? 0.35 : 1.0;
      const dt = rawDt * timeScale;
      const elapsed = clock.elapsedTime;

      if (slowMoTimer > 0) slowMoTimer = Math.max(0, slowMoTimer - rawDt);
      if (attackTimer > 0) attackTimer = Math.max(0, attackTimer - rawDt);
      if (dashTimer > 0) dashTimer = Math.max(0, dashTimer - rawDt);
      if (conjunctionCooldown > 0) conjunctionCooldown = Math.max(0, conjunctionCooldown - rawDt);
      if (comboResetTimer > 0) {
        comboResetTimer -= rawDt;
        if (comboResetTimer <= 0) comboHits = 0;
      }

      // Regenerate diegetic energy gently
      diegeticEnergy = Math.min(1.0, diegeticEnergy + rawDt * 0.08);
      const conjunctionReady = diegeticEnergy >= 0.72 && conjunctionCooldown <= 0;

      // Handle Real-Time Tag-Team Character Switch + Conjunction Entry Burst
      if (switchTriggerQueueRef.current) {
        const nextId = switchTriggerQueueRef.current.target;
        switchTriggerQueueRef.current = null;

        CHARACTER_ORDER.forEach((cid) => {
          charRigs[cid].root.visible = cid === nextId;
        });

        const hasAirborneEnemy = enemies.some((en) => en.airborne);
        const isConjunction = (comboHits >= 1 || hasAirborneEnemy) && conjunctionReady;

        // Sky-drop entry animation
        playerPos.y = Math.max(playerPos.y, 2.4);
        playerVel.y = -11.5;

        const burstColor =
          nextId === 'enes' ? 0xd4af37 : nextId === 'demirhan' ? 0xea580c : 0x38bdf8;
        spawnShockwave(
          playerPos.x,
          0.18,
          playerPos.z,
          burstColor,
          isConjunction ? 7.8 : 4.2,
          isConjunction ? 0.65 : 0.4
        );

        audioEngine.playSwitchBurst(nextId, isConjunction);

        if (isConjunction) {
          slowMoTimer = 0.32;
          conjunctionCooldown = 1.8;
          diegeticEnergy = Math.max(0.25, diegeticEnergy - 0.45);
          comboHits += 2;
          comboResetTimer = 4.5;
          audioEngine.playHit(true);

          enemies.forEach((enemy) => {
            const dist = Math.hypot(enemy.pos.x - playerPos.x, enemy.pos.z - playerPos.z);
            if (dist < 12) {
              enemy.hitFlashTimer = 0.35;
              enemy.stunTimer = 1.4;
              if (!enemy.isBoss) {
                if (nextId === 'demirhan') {
                  enemy.vel.y = -16;
                } else if (nextId === 'selinay') {
                  enemy.vel.y = 12;
                  enemy.airborne = true;
                } else {
                  enemy.vel.y = 7.5;
                  enemy.airborne = true;
                }
              }
            }
          });

          callbacksRef.current.onCombatEvent({
            type: 'conjunction',
            label: `Büyük Kavuşum · ${CHARACTERS[nextId].name}: ${CHARACTERS[nextId].conjunctionRole}`,
          });
        }
      }

      // Active Protagonist Movement
      const activeId = activeCharRef.current;
      const charSpec = CHARACTERS[activeId];
      const activeRig = charRigs[activeId];

      let moveX = 0;
      let moveZ = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      _forward.set(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      _right.set(Math.cos(camYaw), 0, -Math.sin(camYaw));
      _moveDir.set(0, 0, 0).addScaledVector(_forward, -moveZ).addScaledVector(_right, moveX);

      let speedRatio = 0;
      if (dashTimer <= 0) {
        if (_moveDir.lengthSq() > 0.001) {
          _moveDir.normalize();
          playerVel.x = THREE.MathUtils.damp(playerVel.x, _moveDir.x * charSpec.moveSpeed, 11, dt);
          playerVel.z = THREE.MathUtils.damp(playerVel.z, _moveDir.z * charSpec.moveSpeed, 11, dt);
          const targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
          // Shortest angular delta
          let diff = targetYaw - playerYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          playerYaw += diff * Math.min(1, dt * 14);
          speedRatio = 1;
        } else {
          playerVel.x = THREE.MathUtils.damp(playerVel.x, 0, 12, dt);
          playerVel.z = THREE.MathUtils.damp(playerVel.z, 0, 12, dt);
        }
      } else {
        speedRatio = 1.4;
      }

      // Gravity & Ground Clamping (Arena Radius = 18.2m)
      playerVel.y -= 28 * charSpec.weight * dt;
      playerPos.addScaledVector(playerVel, dt);
      if (playerPos.y <= 0) {
        playerPos.y = 0;
        playerVel.y = 0;
        jumpCount = 0;
      }

      const radialDist = Math.hypot(playerPos.x, playerPos.z);
      if (radialDist > 18.0) {
        const scale = 18.0 / radialDist;
        playerPos.x *= scale;
        playerPos.z *= scale;
      }

      activeRig.root.position.copy(playerPos);
      activeRig.root.rotation.y = playerYaw;
      activeRig.updateAnimation(
        elapsed,
        dt,
        speedRatio,
        weaponFormsRef.current[activeId],
        attackTimer,
        attackIsHeavy,
        diegeticEnergy,
        conjunctionReady
      );

      // Update Realm Architecture
      currentRealmInstance.update(elapsed, dt);

      // Update Ouroboros Boss & Clockwork Sentinels
      enemies.forEach((enemy, idx) => {
        if (enemy.hitFlashTimer > 0) {
          enemy.hitFlashTimer -= rawDt;
          enemy.hitFlashMat.emissiveIntensity = 4.5;
        } else {
          enemy.hitFlashMat.emissiveIntensity = enemy.isBoss ? 2.1 : 1.6;
        }

        if (enemy.isBoss && enemy.segments) {
          // Undulating Ouroboros Automaton serpentine coil over the horizon & arena edge
          const coilSpeed = enemy.stunTimer > 0 ? 0.14 : 0.38;
          if (enemy.stunTimer > 0) enemy.stunTimer -= rawDt;
          enemy.orbitAngle += coilSpeed * dt;
          enemy.pos.set(
            Math.cos(enemy.orbitAngle) * enemy.orbitRadius,
            2.4 + Math.sin(elapsed * 1.4) * 1.1,
            Math.sin(enemy.orbitAngle) * enemy.orbitRadius
          );
          enemy.segments.forEach((seg, sIdx) => {
            const segAngle = enemy.orbitAngle - sIdx * 0.17;
            const radiusWave = enemy.orbitRadius + Math.sin(elapsed * 2 + sIdx * 0.6) * 0.85;
            seg.position.set(
              Math.cos(segAngle) * radiusWave,
              2.6 + Math.sin(elapsed * 2.2 - sIdx * 0.45) * 1.35,
              Math.sin(segAngle) * radiusWave
            );
            seg.rotation.y = -segAngle;
            seg.rotation.z = Math.sin(elapsed * 3 + sIdx * 0.5) * 0.25;
          });
        } else {
          // Sentinel Physics + Patrol
          if (enemy.stunTimer > 0) enemy.stunTimer -= rawDt;
          if (enemy.airborne || enemy.pos.y > 0.01) {
            enemy.vel.y -= 24 * dt;
            enemy.pos.addScaledVector(enemy.vel, dt);
            if (enemy.pos.y <= 0) {
              enemy.pos.y = 0;
              enemy.vel.y = 0;
              enemy.airborne = false;
            }
          } else if (enemy.stunTimer <= 0) {
            enemy.orbitAngle += (idx % 2 === 0 ? 0.25 : -0.22) * dt;
            const targetX = Math.cos(enemy.orbitAngle) * enemy.orbitRadius;
            const targetZ = Math.sin(enemy.orbitAngle) * enemy.orbitRadius;
            enemy.pos.x = THREE.MathUtils.damp(enemy.pos.x, targetX, 2.5, dt);
            enemy.pos.z = THREE.MathUtils.damp(enemy.pos.z, targetZ, 2.5, dt);
          } else {
            enemy.pos.x += enemy.vel.x * dt;
            enemy.pos.z += enemy.vel.z * dt;
            enemy.vel.x = THREE.MathUtils.damp(enemy.vel.x, 0, 5, dt);
            enemy.vel.z = THREE.MathUtils.damp(enemy.vel.z, 0, 5, dt);
          }

          const distOut = Math.hypot(enemy.pos.x, enemy.pos.z);
          if (distOut > 16.8) {
            enemy.pos.x *= 16.8 / distOut;
            enemy.pos.z *= 16.8 / distOut;
          }

          enemy.root.position.copy(enemy.pos);
          enemy.root.lookAt(playerPos.x, enemy.pos.y, playerPos.z);
          if (enemy.coreRing) {
            enemy.coreRing.rotation.z = elapsed * 2.2 + idx;
          }
        }
      });

      // Update Pooled Shockwave VFX
      vfxPool.forEach((vfx) => {
        if (!vfx.active) return;
        vfx.age += rawDt;
        const p = vfx.age / vfx.maxAge;
        if (p >= 1) {
          vfx.active = false;
          vfx.mesh.visible = false;
          return;
        }
        vfx.mesh.scale.setScalar(0.35 + p * vfx.maxScale);
        vfx.mat.opacity = (1 - p) * 0.85;
      });

      // Smooth Exponentially Damped Camera Follow
      _camTarget.set(playerPos.x, playerPos.y + 1.55, playerPos.z);
      const horizDist = Math.cos(camPitch) * camDistance;
      const vertDist = Math.sin(camPitch) * camDistance;
      _camDesired.set(
        _camTarget.x + Math.sin(camYaw) * horizDist,
        _camTarget.y + vertDist,
        _camTarget.z + Math.cos(camYaw) * horizDist
      );

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _camDesired.x, 8.5, rawDt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _camDesired.y, 8.5, rawDt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _camDesired.z, 8.5, rawDt);
      camera.lookAt(_camTarget);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      tick();
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      currentRealmInstance.dispose();
      textures.dispose();
      envTarget.dispose();
      ringGeo.dispose();
      vfxPool.forEach((v) => v.mat.dispose());
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [audioEngine, actionTriggerRef]);

  return (
    <div className="relative w-full h-full bg-[#090A0F] overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#090A0F] text-[#F4EFE6] p-8 text-center">
          <div className="max-w-md border border-[#D4AF37]/30 bg-[#12141E] p-6 rounded-xl">
            <h2 className="font-display text-xl text-[#D4AF37] mb-2">
              Imperium Astrolabe III
            </h2>
            <p className="text-sm text-[#A8B0C2]">{webglError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
