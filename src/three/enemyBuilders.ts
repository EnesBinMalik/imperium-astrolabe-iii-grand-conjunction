import * as THREE from 'three';
import { ProceduralTextureSet } from './proceduralTextures';

export interface EnemyEntity {
  id: string;
  isBoss: boolean;
  root: THREE.Group;
  hitFlashMat: THREE.MeshStandardMaterial;
  coreRing?: THREE.Mesh;
  segments?: THREE.Group[];
  hp: number;
  maxHp: number;
  basePos: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  airborne: boolean;
  hitFlashTimer: number;
  stunTimer: number;
  orbitAngle: number;
  orbitRadius: number;
}

export function buildOuroborosBoss(textures: ProceduralTextureSet): EnemyEntity {
  const root = new THREE.Group();

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x15151f,
    roughness: 0.3,
    metalness: 0.72,
  });
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    metalness: 0.92,
    roughness: 0.2,
    anisotropy: 0.7,
  });
  const chaosCoreMat = new THREE.MeshStandardMaterial({
    color: 0xff4522,
    emissive: 0xdc2626,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.2,
  });

  const segments: THREE.Group[] = [];
  const segmentCount = 12;

  for (let i = 0; i < segmentCount; i++) {
    const seg = new THREE.Group();
    const scale = i === 0 ? 1.35 : Math.max(0.42, 1.08 - i * 0.065);

    if (i === 0) {
      // Mechanical Dragon Head
      const skull = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.65, 6), obsidianMat);
      skull.rotation.x = Math.PI / 2;
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.24, 1.05), brassMat);
      jaw.position.set(0, -0.26, 0.2);
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.05, 5), brassMat);
      hornL.position.set(-0.42, 0.55, -0.35);
      hornL.rotation.set(-0.45, 0, 0.35);
      const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.05, 5), brassMat);
      hornR.position.set(0.42, 0.55, -0.35);
      hornR.rotation.set(-0.45, 0, -0.35);
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), chaosCoreMat);
      eyeL.position.set(-0.34, 0.16, 0.42);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), chaosCoreMat);
      eyeR.position.set(0.34, 0.16, 0.42);
      seg.add(skull, jaw, hornL, hornR, eyeL, eyeR);
    } else {
      // Articulated Clockwork Dorsal Ring + Obsidian Carapace
      const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.62 * scale, 1), obsidianMat);
      const ribRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.74 * scale, 0.075 * scale, 8, 18),
        brassMat
      );
      const coreNode = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 10, 10), chaosCoreMat);
      seg.add(body, ribRing, coreNode);

      if (i === 2 || i === 5) {
        // Winged Brass Blades
        const wingGeo = new THREE.BoxGeometry(2.3 * scale, 0.05, 0.65 * scale);
        const wL = new THREE.Mesh(wingGeo, brassMat);
        wL.position.set(-1.25 * scale, 0.2, 0);
        wL.rotation.z = 0.22;
        const wR = new THREE.Mesh(wingGeo, brassMat);
        wR.position.set(1.25 * scale, 0.2, 0);
        wR.rotation.z = -0.22;
        seg.add(wL, wR);
      }
    }

    seg.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    root.add(seg);
    segments.push(seg);
  }

  // Contact shadow under boss focal position
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 5.5),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.03;
  root.add(shadowPlane);

  return {
    id: 'ouroboros-boss',
    isBoss: true,
    root,
    hitFlashMat: chaosCoreMat,
    segments,
    hp: 1000,
    maxHp: 1000,
    basePos: new THREE.Vector3(0, 0, -10.5),
    pos: new THREE.Vector3(0, 0, -10.5),
    vel: new THREE.Vector3(),
    airborne: false,
    hitFlashTimer: 0,
    stunTimer: 0,
    orbitAngle: 0,
    orbitRadius: 10.5,
  };
}

export function buildClockworkSentinel(
  id: string,
  textures: ProceduralTextureSet,
  orbitAngle: number,
  orbitRadius: number
): EnemyEntity {
  const root = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1e202b,
    roughness: 0.38,
    metalness: 0.65,
  });
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc29b38,
    metalness: 0.88,
    roughness: 0.25,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.8,
    roughness: 0.25,
  });

  // Grounded bottom-center pedestal/legs at y = 0
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.85, 8), hullMat);
  pedestal.position.y = 0.425;
  const torso = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), brassMat);
  torso.position.y = 1.28;
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.055, 8, 24), brassMat);
  coreRing.position.y = 1.28;
  const eyeCore = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), coreMat);
  eyeCore.position.set(0, 1.32, 0.36);

  // Twin Halberd Blades
  const bladeGeo = new THREE.BoxGeometry(0.12, 0.95, 0.22);
  const bL = new THREE.Mesh(bladeGeo, hullMat);
  bL.position.set(-0.62, 1.32, 0.15);
  const bR = new THREE.Mesh(bladeGeo, hullMat);
  bR.position.set(0.62, 1.32, 0.15);

  root.add(pedestal, torso, coreRing, eyeCore, bL, bR);
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o !== shadow) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  const x = Math.cos(orbitAngle) * orbitRadius;
  const z = Math.sin(orbitAngle) * orbitRadius;
  root.position.set(x, 0, z);

  return {
    id,
    isBoss: false,
    root,
    hitFlashMat: coreMat,
    coreRing,
    hp: 250,
    maxHp: 250,
    basePos: new THREE.Vector3(x, 0, z),
    pos: new THREE.Vector3(x, 0, z),
    vel: new THREE.Vector3(),
    airborne: false,
    hitFlashTimer: 0,
    stunTimer: 0,
    orbitAngle,
    orbitRadius,
  };
}
