import * as THREE from 'three';
import { CharacterId, WeaponForm } from '../data/imperiumLore';
import { ProceduralTextureSet } from './proceduralTextures';

export interface CharacterRig {
  id: CharacterId;
  root: THREE.Group;
  bodyPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  primaryWeaponGroup: THREE.Group;
  secondaryWeaponGroup: THREE.Group;
  diegeticNodes: THREE.Mesh[];
  diegeticMaterials: THREE.MeshStandardMaterial[];
  phoenixGroup?: THREE.Group;
  phoenixLeftWing?: THREE.Group;
  phoenixRightWing?: THREE.Group;
  backAstrolabeRings?: THREE.Mesh[];
  chakramBlades?: THREE.Mesh[];
  prostheticGears?: THREE.Mesh[];
  shawlRibbons?: THREE.Mesh[];
  updateAnimation: (
    time: number,
    dt: number,
    speedRatio: number,
    weaponForm: WeaponForm,
    attackTimer: number,
    isHeavy: boolean,
    energy: number,
    conjunctionReady: boolean
  ) => void;
}

function enableShadows(group: THREE.Object3D) {
  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

function createContactShadowMesh(shadowTex: THREE.CanvasTexture, radius = 1.15): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.02;
  return mesh;
}

export function buildCharacterRig(
  id: CharacterId,
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean
): CharacterRig {
  if (id === 'enes') return buildEnesRig(textures, isSoftwareGl);
  if (id === 'demirhan') return buildDemirhanRig(textures, isSoftwareGl);
  return buildSelinayRig(textures, isSoftwareGl);
}

/* ============================================================================
 * 1. YÜCE BAŞ MİMAR: ENES ÖZTÜRK (Sovereign Regalia + Solar Phoenix-Falcon)
 * ========================================================================== */
function buildEnesRig(textures: ProceduralTextureSet, _isSoftwareGl: boolean): CharacterRig {
  const root = new THREE.Group();
  root.add(createContactShadowMesh(textures.contactShadow, 1.2));

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    metalness: 0.94,
    roughness: 0.16,
    anisotropy: 0.75,
  });
  const marbleMat = new THREE.MeshStandardMaterial({
    map: textures.sovereignMarble,
    color: 0xf5f0e6,
    roughness: 0.42,
    metalness: 0.08,
  });
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x11131a,
    roughness: 0.22,
    metalness: 0.65,
  });
  const emeraldCapeMat = new THREE.MeshStandardMaterial({
    color: 0x0b4f45,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const solarCoreMat = new THREE.MeshStandardMaterial({
    color: 0xffd56b,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.3,
  });

  // Legs / Greaves (bottom-center grounded at y = 0)
  const legGeo = new THREE.CylinderGeometry(0.11, 0.085, 0.92, 12);
  const leftLeg = new THREE.Mesh(legGeo, marbleMat);
  leftLeg.position.set(-0.18, 0.46, 0);
  const rightLeg = new THREE.Mesh(legGeo, marbleMat);
  rightLeg.position.set(0.18, 0.46, 0);
  bodyPivot.add(leftLeg, rightLeg);

  // Gold Knee & Sabaton Accents
  const kneeGeo = new THREE.OctahedronGeometry(0.11, 0);
  const lKnee = new THREE.Mesh(kneeGeo, goldMat);
  lKnee.position.set(-0.18, 0.52, 0.08);
  const rKnee = new THREE.Mesh(kneeGeo, goldMat);
  rKnee.position.set(0.18, 0.52, 0.08);
  bodyPivot.add(lKnee, rKnee);

  // Sovereign Regalia Cuirass (Marble & Gold)
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.23, 0.84, 10);
  const torso = new THREE.Mesh(torsoGeo, marbleMat);
  torso.position.set(0, 1.32, 0);
  bodyPivot.add(torso);

  // Gold Chest Collar & Waist Belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 24), goldMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.93;
  bodyPivot.add(belt);

  // Miniature Solar System Chest Core (Diegetic Energy Indicator)
  const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), solarCoreMat);
  chestCore.position.set(0, 1.4, 0.25);
  const chestOrbitRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.016, 8, 28), goldMat);
  chestOrbitRing.position.set(0, 1.4, 0.25);
  bodyPivot.add(chestCore, chestOrbitRing);

  // Sculpted Baroque Pauldrons
  const pauldronGeo = new THREE.SphereGeometry(0.21, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const leftPauldron = new THREE.Mesh(pauldronGeo, goldMat);
  leftPauldron.position.set(-0.39, 1.66, 0);
  leftPauldron.rotation.z = 0.35;
  const rightPauldron = new THREE.Mesh(pauldronGeo, goldMat);
  rightPauldron.position.set(0.39, 1.66, 0);
  rightPauldron.rotation.z = -0.35;
  bodyPivot.add(leftPauldron, rightPauldron);

  // Head + Obsidian-Gold Astrolabe Crown
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), obsidianMat);
  head.position.set(0, 1.94, 0);
  const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.024, 8, 24), goldMat);
  crownRing.rotation.x = Math.PI / 2 - 0.18;
  crownRing.position.set(0, 2.02, 0);
  const crownCrest = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), solarCoreMat);
  crownCrest.position.set(0, 2.13, 0.14);
  bodyPivot.add(head, crownRing, crownCrest);

  // Emerald & Gold Flowing Cape
  const capeGeo = new THREE.PlaneGeometry(0.86, 1.45, 6, 8);
  capeGeo.translate(0, -0.72, 0);
  const cape = new THREE.Mesh(capeGeo, emeraldCapeMat);
  cape.position.set(0, 1.72, -0.24);
  cape.rotation.x = 0.16;
  const capeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.04), goldMat);
  capeTrim.position.set(0, 1.72, -0.24);
  bodyPivot.add(cape, capeTrim);

  // Back-Mounted Diegetic Astrolabe Rings (expand & glow when Conjunction is ready)
  const backAstrolabeRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = 0.44 + i * 0.17;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 8, 36), goldMat);
    ring.position.set(0, 1.48, -0.34 - i * 0.03);
    bodyPivot.add(ring);
    backAstrolabeRings.push(ring);
  }

  // Arms
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.39, 1.62, 0);
  const armGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.68, 10);
  armGeo.translate(0, -0.32, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, marbleMat);
  leftArmPivot.add(leftArmMesh);
  bodyPivot.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.39, 1.62, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, marbleMat);
  rightArmPivot.add(rightArmMesh);
  bodyPivot.add(rightArmPivot);

  // Weapon Form A: Celestial Chakram (6 orbiting flying gold blade rings)
  const primaryWeaponGroup = new THREE.Group();
  const chakramBlades: THREE.Mesh[] = [];
  const chakramBladeGeo = new THREE.TorusGeometry(0.24, 0.035, 8, 20);
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(chakramBladeGeo, goldMat);
    const edge = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), solarCoreMat);
    edge.position.set(0.24, 0, 0);
    blade.add(edge);
    primaryWeaponGroup.add(blade);
    chakramBlades.push(blade);
  }
  bodyPivot.add(primaryWeaponGroup);

  // Weapon Form B: Solar Lance (3m Imperial Plasma Spear)
  const secondaryWeaponGroup = new THREE.Group();
  secondaryWeaponGroup.position.set(0, -0.58, 0.12);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 2.7, 10), goldMat);
  shaft.rotation.x = Math.PI / 2;
  const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.68, 6), solarCoreMat);
  spearHead.rotation.x = Math.PI / 2;
  spearHead.position.z = 1.62;
  const guardRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), goldMat);
  guardRing.position.z = 1.24;
  secondaryWeaponGroup.add(shaft, spearHead, guardRing);
  secondaryWeaponGroup.visible = false;
  rightArmPivot.add(secondaryWeaponGroup);

  // Orbiting Armored Solar Phoenix-Falcon (Altın Anka-Doğan)
  const phoenixGroup = new THREE.Group();
  phoenixGroup.position.set(-0.95, 2.45, -0.45);
  const pBody = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.56, 8), goldMat);
  pBody.rotation.x = Math.PI / 2;
  const pCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), solarCoreMat);
  pCore.position.set(0, 0.04, 0.08);
  phoenixGroup.add(pBody, pCore);

  const wingGeo = new THREE.BoxGeometry(0.68, 0.03, 0.28);
  const phoenixLeftWing = new THREE.Group();
  phoenixLeftWing.position.set(-0.1, 0.02, 0);
  const lwMesh = new THREE.Mesh(wingGeo, goldMat);
  lwMesh.position.x = -0.34;
  phoenixLeftWing.add(lwMesh);

  const phoenixRightWing = new THREE.Group();
  phoenixRightWing.position.set(0.1, 0.02, 0);
  const rwMesh = new THREE.Mesh(wingGeo, goldMat);
  rwMesh.position.x = 0.34;
  phoenixRightWing.add(rwMesh);

  phoenixGroup.add(phoenixLeftWing, phoenixRightWing);
  root.add(phoenixGroup);

  enableShadows(root);

  return {
    id: 'enes',
    root,
    bodyPivot,
    rightArmPivot,
    leftArmPivot,
    primaryWeaponGroup,
    secondaryWeaponGroup,
    diegeticNodes: [chestCore, crownCrest],
    diegeticMaterials: [solarCoreMat],
    phoenixGroup,
    phoenixLeftWing,
    phoenixRightWing,
    backAstrolabeRings,
    chakramBlades,
    updateAnimation: (time, _dt, speedRatio, weaponForm, attackTimer, isHeavy, energy, conjunctionReady) => {
      // Diegetic energy & conjunction signaling
      solarCoreMat.emissiveIntensity = 1.1 + energy * 1.9 + (conjunctionReady ? Math.sin(time * 6) * 0.5 + 0.5 : 0);
      chestOrbitRing.rotation.z = time * 2.4;
      chestOrbitRing.rotation.x = time * 1.3;

      backAstrolabeRings.forEach((ring, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        ring.rotation.z = time * (0.7 + i * 0.35) * dir;
        const targetScale = conjunctionReady ? 1.18 + i * 0.05 : 0.95;
        ring.scale.setScalar(THREE.MathUtils.lerp(ring.scale.x, targetScale, 0.12));
      });

      // Solar Phoenix-Falcon flight & Conjunction wing spread
      phoenixGroup.position.x = -0.95 + Math.cos(time * 1.4) * 0.25;
      phoenixGroup.position.y = 2.45 + Math.sin(time * 2.2) * 0.18;
      const flapAmp = conjunctionReady ? 0.48 : 0.22;
      const baseSpread = conjunctionReady ? 0.32 : -0.15;
      phoenixLeftWing.rotation.z = baseSpread + Math.sin(time * 6.5) * flapAmp;
      phoenixRightWing.rotation.z = -baseSpread - Math.sin(time * 6.5) * flapAmp;

      // Cape & stride sway
      cape.rotation.x = 0.16 + speedRatio * 0.45 + Math.sin(time * 3.5) * 0.06;
      leftLeg.rotation.x = Math.sin(time * 9) * 0.38 * speedRatio;
      rightLeg.rotation.x = -Math.sin(time * 9) * 0.38 * speedRatio;

      // Weapon Form & Combat Swing
      const isPrimary = weaponForm === 'primary';
      primaryWeaponGroup.visible = isPrimary;
      secondaryWeaponGroup.visible = !isPrimary;

      if (attackTimer > 0) {
        const swing = Math.sin(attackTimer * Math.PI * 3.2);
        rightArmPivot.rotation.x = -1.35 + swing * (isHeavy ? 1.8 : 1.2);
        rightArmPivot.rotation.y = swing * 0.85;
        leftArmPivot.rotation.x = 0.45;
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, isPrimary ? -0.25 : -0.55, 0.16);
        rightArmPivot.rotation.y = THREE.MathUtils.lerp(rightArmPivot.rotation.y, 0, 0.16);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -Math.sin(time * 9) * 0.25 * speedRatio, 0.16);
      }

      if (isPrimary) {
        const orbitRadius = attackTimer > 0 ? (isHeavy ? 2.6 : 1.95) : 1.12;
        const spinSpeed = attackTimer > 0 ? 9.5 : 2.6;
        chakramBlades.forEach((blade, idx) => {
          const angle = time * spinSpeed + (idx / 6) * Math.PI * 2;
          blade.position.set(
            Math.cos(angle) * orbitRadius,
            1.32 + Math.sin(angle * 2 + time) * 0.22,
            Math.sin(angle) * orbitRadius
          );
          blade.rotation.x = Math.PI / 2 + Math.sin(time * 4 + idx) * 0.3;
          blade.rotation.z = time * 6;
        });
      }
    },
  };
}

/* ============================================================================
 * 2. DEMİR VE MAGMA BAŞUSTASI: DEMİRHAN (Basalt, Bronze & Twin Boiler Reactor)
 * ========================================================================== */
function buildDemirhanRig(textures: ProceduralTextureSet, _isSoftwareGl: boolean): CharacterRig {
  const root = new THREE.Group();
  root.add(createContactShadowMesh(textures.contactShadow, 1.45));

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const basaltMat = new THREE.MeshStandardMaterial({
    map: textures.volcanicBasalt,
    color: 0x26201f,
    roughness: 0.82,
    metalness: 0.18,
  });
  const bronzeMat = new THREE.MeshPhysicalMaterial({
    color: 0xb46927,
    metalness: 0.9,
    roughness: 0.28,
    anisotropy: 0.65,
  });
  const magmaMat = new THREE.MeshStandardMaterial({
    color: 0xff7b29,
    emissive: 0xea580c,
    emissiveIntensity: 2.3,
    roughness: 0.3,
    metalness: 0.2,
  });

  // Heavy Pillars for Legs (bottom-center grounded at y = 0)
  const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8);
  const leftLeg = new THREE.Mesh(legGeo, basaltMat);
  leftLeg.position.set(-0.26, 0.45, 0);
  const rightLeg = new THREE.Mesh(legGeo, basaltMat);
  rightLeg.position.set(0.26, 0.45, 0);
  bodyPivot.add(leftLeg, rightLeg);

  // Massive Volcanic Basalt & Bronze Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 1.02, 8), basaltMat);
  torso.position.set(0, 1.4, 0);
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.54, 0.58), bronzeMat);
  chestPlate.position.set(0, 1.48, 0.04);
  const magmaFissure = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), magmaMat);
  magmaFissure.position.set(0, 1.5, 0.33);
  bodyPivot.add(torso, chestPlate, magmaFissure);

  // Colossal Forged Pauldrons
  const pauldronGeo = new THREE.BoxGeometry(0.46, 0.38, 0.52);
  const lPauldron = new THREE.Mesh(pauldronGeo, bronzeMat);
  lPauldron.position.set(-0.62, 1.82, 0);
  lPauldron.rotation.z = 0.2;
  const rPauldron = new THREE.Mesh(pauldronGeo, bronzeMat);
  rPauldron.position.set(0.62, 1.82, 0);
  rPauldron.rotation.z = -0.2;
  bodyPivot.add(lPauldron, rPauldron);

  // Helmeted Head
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.34, 8), bronzeMat);
  head.position.set(0, 2.08, 0);
  const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.055, 0.08), magmaMat);
  visorSlit.position.set(0, 2.1, 0.19);
  bodyPivot.add(head, visorSlit);

  // Back-Mounted Twin-Cylinder Geothermal Boiler Reactor (Diegetic Energy Gauge)
  const boilerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.82, 12), bronzeMat);
  boilerLeft.position.set(-0.22, 1.52, -0.44);
  const boilerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.82, 12), bronzeMat);
  boilerRight.position.set(0.22, 1.52, -0.44);
  const gaugeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.58, 10), magmaMat);
  gaugeLeft.position.set(-0.22, 1.52, -0.53);
  const gaugeRight = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.58, 10), magmaMat);
  gaugeRight.position.set(0.22, 1.52, -0.53);
  bodyPivot.add(boilerLeft, boilerRight, gaugeLeft, gaugeRight);

  // Left Arm (Basalt Armor)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.62, 1.72, 0);
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.78, 8), basaltMat);
  lArm.position.y = -0.38;
  leftArmPivot.add(lArm);
  bodyPivot.add(leftArmPivot);

  // Right Arm: Exposed Gear-Driven Mechanical Prosthetic Arm
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.62, 1.72, 0);
  const rArmCore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.82, 8), bronzeMat);
  rArmCore.position.y = -0.38;
  rightArmPivot.add(rArmCore);

  const prostheticGears: THREE.Mesh[] = [];
  for (let g = 0; g < 3; g++) {
    const gear = new THREE.Mesh(new THREE.TorusGeometry(0.13 - g * 0.015, 0.025, 6, 12), bronzeMat);
    gear.rotation.y = Math.PI / 2;
    gear.position.set(0.11, -0.18 - g * 0.22, 0);
    rightArmPivot.add(gear);
    prostheticGears.push(gear);
  }
  bodyPivot.add(rightArmPivot);

  // Weapon Form A: Apocalypse Anvil (Kıyamet Örsü Warhammer)
  const primaryWeaponGroup = new THREE.Group();
  primaryWeaponGroup.position.set(0, -0.74, 0.14);
  const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 2.1, 10), bronzeMat);
  haft.rotation.x = Math.PI / 2;
  haft.position.z = 0.65;
  const anvilHead = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.52, 0.84), basaltMat);
  anvilHead.position.z = 1.62;
  const anvilGlowBand = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.55), magmaMat);
  anvilGlowBand.position.z = 1.62;
  primaryWeaponGroup.add(haft, anvilHead, anvilGlowBand);
  rightArmPivot.add(primaryWeaponGroup);

  // Weapon Form B: Dragon Cannon (Ejderha Topu Split-Barrel Siege Mortar)
  const secondaryWeaponGroup = new THREE.Group();
  secondaryWeaponGroup.position.set(0.05, 0.15, 0.25);
  const barrelTop = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.75, 10), bronzeMat);
  barrelTop.rotation.x = Math.PI / 2;
  barrelTop.position.set(0, 0.12, 0.6);
  const barrelBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.75, 10), basaltMat);
  barrelBottom.rotation.x = Math.PI / 2;
  barrelBottom.position.set(0, -0.12, 0.6);
  const muzzleCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), magmaMat);
  muzzleCore.position.set(0, 0, 1.44);
  secondaryWeaponGroup.add(barrelTop, barrelBottom, muzzleCore);
  secondaryWeaponGroup.visible = false;
  rightArmPivot.add(secondaryWeaponGroup);

  enableShadows(root);

  return {
    id: 'demirhan',
    root,
    bodyPivot,
    rightArmPivot,
    leftArmPivot,
    primaryWeaponGroup,
    secondaryWeaponGroup,
    diegeticNodes: [gaugeLeft, gaugeRight, magmaFissure],
    diegeticMaterials: [magmaMat],
    prostheticGears,
    updateAnimation: (time, _dt, speedRatio, weaponForm, attackTimer, isHeavy, energy, conjunctionReady) => {
      // Diegetic boiler pressure glow & gauge scale
      magmaMat.emissiveIntensity = 1.3 + energy * 2.2 + (conjunctionReady ? 0.7 : 0);
      const gaugeScale = 0.35 + energy * 0.75;
      gaugeLeft.scale.y = gaugeScale;
      gaugeRight.scale.y = gaugeScale;

      prostheticGears.forEach((gear, idx) => {
        gear.rotation.x = time * (idx % 2 === 0 ? 3.2 : -3.2);
      });

      leftLeg.rotation.x = Math.sin(time * 6.5) * 0.32 * speedRatio;
      rightLeg.rotation.x = -Math.sin(time * 6.5) * 0.32 * speedRatio;

      const isPrimary = weaponForm === 'primary';
      primaryWeaponGroup.visible = isPrimary;
      secondaryWeaponGroup.visible = !isPrimary;

      if (attackTimer > 0) {
        const swing = Math.sin(attackTimer * Math.PI * 2.6);
        if (isPrimary) {
          rightArmPivot.rotation.x = -1.6 + swing * (isHeavy ? 2.1 : 1.45);
        } else {
          // Recoil kickback for Dragon Cannon
          rightArmPivot.rotation.x = -1.55 - Math.abs(swing) * 0.35;
        }
        leftArmPivot.rotation.x = -0.45;
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, isPrimary ? -0.32 : -1.42, 0.14);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -Math.sin(time * 6.5) * 0.25 * speedRatio, 0.14);
      }
    },
  };
}

/* ============================================================================
 * 3. KRİSTAL VE IŞIK RAHİBESİ: SELİNAY (Silver Filigree, Quartz & Light-Whip)
 * ========================================================================== */
function buildSelinayRig(textures: ProceduralTextureSet, isSoftwareGl: boolean): CharacterRig {
  const root = new THREE.Group();
  root.add(createContactShadowMesh(textures.contactShadow, 1.0));

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const silverMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.14,
    anisotropy: 0.7,
  });
  const quartzMat = new THREE.MeshPhysicalMaterial({
    map: textures.lunarQuartz,
    color: 0xa5e4ff,
    emissive: 0x0284c7,
    emissiveIntensity: 1.1,
    roughness: 0.08,
    metalness: 0.15,
    transmission: isSoftwareGl ? 0 : 0.65,
    transparent: true,
    opacity: isSoftwareGl ? 0.78 : 0.95,
    ior: 1.55,
  });
  const shawlMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.62,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd9a441,
    metalness: 0.88,
    roughness: 0.22,
  });

  // Slender Greaves (bottom-center grounded at y = 0)
  const legGeo = new THREE.CylinderGeometry(0.085, 0.06, 0.94, 10);
  const leftLeg = new THREE.Mesh(legGeo, silverMat);
  leftLeg.position.set(-0.15, 0.47, 0);
  const rightLeg = new THREE.Mesh(legGeo, silverMat);
  rightLeg.position.set(0.15, 0.47, 0);
  bodyPivot.add(leftLeg, rightLeg);

  // Silver Filigree Corset & Quartz Chest Prism
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.8, 10), silverMat);
  torso.position.set(0, 1.32, 0);
  const chestPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), quartzMat);
  chestPrism.position.set(0, 1.4, 0.21);
  bodyPivot.add(torso, chestPrism);

  // Hand-Cut Faceted Quartz Pauldrons
  const crystalGeo = new THREE.ConeGeometry(0.16, 0.42, 5);
  const lCrystal = new THREE.Mesh(crystalGeo, quartzMat);
  lCrystal.position.set(-0.34, 1.7, 0);
  lCrystal.rotation.z = 0.65;
  const rCrystal = new THREE.Mesh(crystalGeo, quartzMat);
  rCrystal.position.set(0.34, 1.7, 0);
  rCrystal.rotation.z = -0.65;
  bodyPivot.add(lCrystal, rCrystal);

  // Head + Brass Telescopic Observation Visor
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), silverMat);
  head.position.set(0, 1.9, 0);
  const visorBar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.12), brassMat);
  visorBar.position.set(0, 1.91, 0.12);
  const visorLens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 12), quartzMat);
  visorLens.rotation.x = Math.PI / 2;
  visorLens.position.set(0.07, 1.91, 0.18);
  bodyPivot.add(head, visorBar, visorLens);

  // Translucent Iridescent Silk-Photon Shawl Ribbons
  const shawlRibbons: THREE.Mesh[] = [];
  for (let s = 0; s < 2; s++) {
    const ribGeo = new THREE.PlaneGeometry(0.26, 1.5, 4, 8);
    ribGeo.translate(0, -0.75, 0);
    const ribbon = new THREE.Mesh(ribGeo, shawlMat);
    ribbon.position.set(s === 0 ? -0.26 : 0.26, 1.66, -0.18);
    ribbon.rotation.x = 0.26;
    bodyPivot.add(ribbon);
    shawlRibbons.push(ribbon);
  }

  // Arms
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.32, 1.62, 0);
  const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.64, 10);
  armGeo.translate(0, -0.3, 0);
  leftArmPivot.add(new THREE.Mesh(armGeo, silverMat));
  bodyPivot.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 1.62, 0);
  rightArmPivot.add(new THREE.Mesh(armGeo, silverMat));
  bodyPivot.add(rightArmPivot);

  // Weapon Form A: Twin Prism Fans (Prizma Yelpazeleri)
  const primaryWeaponGroup = new THREE.Group();
  const fanGeo = new THREE.CircleGeometry(0.42, 6, 0, Math.PI * 0.75);
  const rFan = new THREE.Mesh(fanGeo, quartzMat);
  rFan.position.set(0, -0.58, 0.15);
  rFan.rotation.y = Math.PI / 2;
  const rFanRim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 6, 16, Math.PI * 0.75), silverMat);
  rFan.add(rFanRim);
  primaryWeaponGroup.add(rFan);
  rightArmPivot.add(primaryWeaponGroup);

  const leftFan = new THREE.Mesh(fanGeo, quartzMat);
  leftFan.position.set(0, -0.58, 0.15);
  leftFan.rotation.y = Math.PI / 2;
  leftArmPivot.add(leftFan);

  // Weapon Form B: Light-Whip (Işık Kırbacı)
  const secondaryWeaponGroup = new THREE.Group();
  secondaryWeaponGroup.position.set(0, -0.58, 0.15);
  const whipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.3, 0.18, 0.9),
    new THREE.Vector3(-0.25, 0.34, 1.85),
    new THREE.Vector3(0.45, 0.12, 2.75),
  ]);
  const whipMesh = new THREE.Mesh(new THREE.TubeGeometry(whipCurve, 24, 0.045, 8, false), quartzMat);
  secondaryWeaponGroup.add(whipMesh);
  secondaryWeaponGroup.visible = false;
  rightArmPivot.add(secondaryWeaponGroup);

  enableShadows(root);

  return {
    id: 'selinay',
    root,
    bodyPivot,
    rightArmPivot,
    leftArmPivot,
    primaryWeaponGroup,
    secondaryWeaponGroup,
    diegeticNodes: [chestPrism, lCrystal, rCrystal],
    diegeticMaterials: [quartzMat, shawlMat],
    shawlRibbons,
    updateAnimation: (time, _dt, speedRatio, weaponForm, attackTimer, isHeavy, energy, conjunctionReady) => {
      // Diegetic prism & shawl photon intensity
      quartzMat.emissiveIntensity = 0.65 + energy * 1.6 + (conjunctionReady ? 0.6 : 0);
      shawlMat.emissiveIntensity = 0.45 + energy * 1.1;

      shawlRibbons.forEach((rib, idx) => {
        rib.rotation.x = 0.25 + speedRatio * 0.55 + Math.sin(time * 5 + idx) * 0.15;
        rib.rotation.z = (idx === 0 ? -0.15 : 0.15) + Math.cos(time * 4 + idx) * 0.1;
      });

      leftLeg.rotation.x = Math.sin(time * 11) * 0.42 * speedRatio;
      rightLeg.rotation.x = -Math.sin(time * 11) * 0.42 * speedRatio;

      const isPrimary = weaponForm === 'primary';
      primaryWeaponGroup.visible = isPrimary;
      leftFan.visible = isPrimary;
      secondaryWeaponGroup.visible = !isPrimary;

      if (attackTimer > 0) {
        const swing = Math.sin(attackTimer * Math.PI * 4);
        rightArmPivot.rotation.x = -1.25 + swing * (isHeavy ? 1.9 : 1.3);
        rightArmPivot.rotation.y = swing * 1.1;
        leftArmPivot.rotation.x = -1.1 - swing * 1.1;
        if (!isPrimary) {
          secondaryWeaponGroup.rotation.y = swing * 0.85;
          secondaryWeaponGroup.scale.z = 1.0 + Math.abs(swing) * 0.45;
        }
      } else {
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -0.4, 0.18);
        rightArmPivot.rotation.y = THREE.MathUtils.lerp(rightArmPivot.rotation.y, 0, 0.18);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -0.35, 0.18);
      }
    },
  };
}
