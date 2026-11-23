import * as THREE from 'three';
import { REALMS, RealmId } from '../data/imperiumLore';
import { ProceduralTextureSet } from './proceduralTextures';

export interface RealmInstance {
  id: RealmId;
  group: THREE.Group;
  update: (time: number, dt: number) => void;
  dispose: () => void;
}

export function buildRealmEnvironment(
  realmId: RealmId,
  textures: ProceduralTextureSet
): RealmInstance {
  const spec = REALMS[realmId];
  const group = new THREE.Group();
  const animatedObjects: { mesh: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z'; mode?: 'spin' | 'pendulum' }[] = [];
  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMats.push(m);
    return m;
  };

  // Materials calibrated per realm
  const brassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: realmId === 'lunar' ? 0xcbd5e1 : 0xd4af37,
      metalness: 0.9,
      roughness: 0.22,
      anisotropy: 0.65,
    })
  );
  const darkStoneMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: realmId === 'caldera' ? textures.volcanicBasalt : textures.sovereignMarble,
      color: realmId === 'caldera' ? 0x2a1f1c : realmId === 'lunar' ? 0x16243b : 0x1a1c26,
      roughness: 0.68,
      metalness: 0.16,
    })
  );
  const glowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: spec.accentColor,
      emissive: spec.accentColor,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    })
  );

  // Main Astrolabe Arena Platform (Radius 19m, grounded at y = 0)
  const floorGeo = trackGeo(new THREE.CylinderGeometry(19.5, 20.5, 1.4, 64));
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.astrolabeFloor,
      color: realmId === 'caldera' ? 0x47281e : realmId === 'lunar' ? 0x243b55 : 0x2c2f3e,
      roughness: 0.42,
      metalness: 0.32,
    })
  );
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.7;
  floor.receiveShadow = true;
  group.add(floor);

  // Outer Beveled Brass Rim Ring (offset slightly in Y to prevent Z-fighting)
  const rimRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(19.5, 0.35, 12, 72)),
    brassMat
  );
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 0.04;
  group.add(rimRing);

  // Extended Horizon Outer Rings (preventing "void" feel)
  for (let i = 0; i < 3; i++) {
    const outerRadius = 28 + i * 11;
    const outerRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(outerRadius, 0.28 + i * 0.12, 10, 64)),
      brassMat
    );
    outerRing.rotation.x = Math.PI / 2 + (i - 1) * 0.18;
    outerRing.rotation.y = i * 0.5;
    outerRing.position.y = -2.5 + i * 1.8;
    group.add(outerRing);
    animatedObjects.push({
      mesh: outerRing,
      speed: (i % 2 === 0 ? 1 : -1) * (0.09 + i * 0.04),
      axis: 'z',
      mode: 'spin',
    });
  }

  // Realm-Specific Monumental Architecture (8 perimeter pillars / landmarks)
  if (realmId === 'bifrost') {
    // 1. Yıldızlararası Köprü: Giant suspended golden chains & floating marble pylons
    const chainGeo = trackGeo(new THREE.TorusGeometry(0.55, 0.14, 8, 16));
    for (let c = 0; c < 4; c++) {
      const side = c < 2 ? -1 : 1;
      const zOff = c % 2 === 0 ? -9 : 9;
      for (let link = 0; link < 14; link++) {
        const lMesh = new THREE.Mesh(chainGeo, brassMat);
        lMesh.position.set(side * (20 + link * 1.8), 2.5 + Math.pow(link * 0.38, 1.5), zOff);
        lMesh.rotation.y = link % 2 === 0 ? 0 : Math.PI / 2;
        group.add(lMesh);
      }
    }
    const bridgeGeo = trackGeo(new THREE.BoxGeometry(22, 0.8, 7));
    const bridgeNorth = new THREE.Mesh(bridgeGeo, darkStoneMat);
    bridgeNorth.position.set(0, -0.45, -29);
    const bridgeSouth = new THREE.Mesh(bridgeGeo, darkStoneMat);
    bridgeSouth.position.set(0, -0.45, 29);
    group.add(bridgeNorth, bridgeSouth);
  } else if (realmId === 'horology') {
    // 2. Ebedi Zaman Çarkı Sarayı: Colossal rotating clockwork gears & crystal pendulums
    const gearGeo = trackGeo(new THREE.TorusGeometry(4.2, 0.48, 8, 24));
    const spokeGeo = trackGeo(new THREE.BoxGeometry(8.2, 0.35, 0.35));
    for (let g = 0; g < 6; g++) {
      const ang = (g / 6) * Math.PI * 2;
      const gearGroup = new THREE.Group();
      gearGroup.position.set(Math.cos(ang) * 24, 5.5 + (g % 2) * 3, Math.sin(ang) * 24);
      gearGroup.lookAt(0, 5.5, 0);
      gearGroup.add(new THREE.Mesh(gearGeo, brassMat));
      gearGroup.add(new THREE.Mesh(spokeGeo, brassMat));
      const s2 = new THREE.Mesh(spokeGeo, brassMat);
      s2.rotation.z = Math.PI / 2;
      gearGroup.add(s2);
      group.add(gearGroup);
      animatedObjects.push({
        mesh: gearGroup,
        speed: g % 2 === 0 ? 0.35 : -0.35,
        axis: 'z',
        mode: 'spin',
      });
    }
    // Swinging Giant Pendulum
    const pendulumPivot = new THREE.Group();
    pendulumPivot.position.set(0, 26, -24);
    const rod = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 18, 10)), brassMat);
    rod.position.y = -9;
    const bob = new THREE.Mesh(trackGeo(new THREE.OctahedronGeometry(2.2, 0)), glowMat);
    bob.position.y = -18;
    pendulumPivot.add(rod, bob);
    group.add(pendulumPivot);
    animatedObjects.push({ mesh: pendulumPivot, speed: 1.2, axis: 'z', mode: 'pendulum' });
  } else if (realmId === 'caldera') {
    // 3. Volkanik Gözlemevi: Basalt crater spires, molten lava ring & bronze turbines
    const lavaRing = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(20.5, 42, 48)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xff5a1f,
          emissive: 0xea580c,
          emissiveIntensity: 1.5,
          roughness: 0.35,
        })
      )
    );
    lavaRing.rotation.x = -Math.PI / 2;
    lavaRing.position.y = -2.2;
    group.add(lavaRing);

    const spireGeo = trackGeo(new THREE.ConeGeometry(2.6, 14, 6));
    for (let s = 0; s < 10; s++) {
      const ang = (s / 10) * Math.PI * 2;
      const spire = new THREE.Mesh(spireGeo, darkStoneMat);
      spire.position.set(Math.cos(ang) * 28, 3.5, Math.sin(ang) * 28);
      spire.rotation.y = ang;
      group.add(spire);
    }
  } else if (realmId === 'lunar') {
    // 4. Ay Işığı Kristal Bahçeleri: Giant Quartz Trees & Silver Reflective Pool Rim
    const crystalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: textures.lunarQuartz,
        color: 0xa5e4ff,
        emissive: 0x0284c7,
        emissiveIntensity: 0.75,
        roughness: 0.12,
        metalness: 0.15,
      })
    );
    const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.45, 0.85, 8, 7));
    const crystalBranchGeo = trackGeo(new THREE.ConeGeometry(1.4, 5.2, 5));
    for (let t = 0; t < 8; t++) {
      const ang = (t / 8) * Math.PI * 2 + 0.2;
      const tree = new THREE.Group();
      tree.position.set(Math.cos(ang) * 22.5, 0, Math.sin(ang) * 22.5);
      const trunk = new THREE.Mesh(trunkGeo, brassMat);
      trunk.position.y = 4;
      const crown = new THREE.Mesh(crystalBranchGeo, crystalMat);
      crown.position.y = 9.2;
      const subA = new THREE.Mesh(crystalBranchGeo, crystalMat);
      subA.scale.setScalar(0.65);
      subA.position.set(1.2, 7.2, 0);
      subA.rotation.z = -0.55;
      const subB = new THREE.Mesh(crystalBranchGeo, crystalMat);
      subB.scale.setScalar(0.65);
      subB.position.set(-1.2, 7.4, 0.4);
      subB.rotation.z = 0.55;
      tree.add(trunk, crown, subA, subB);
      group.add(tree);
    }
  } else {
    // 5. Büyük Kavuşum Çekirdeği (Nexus): 3 Intersecting Celestial Astrolabe Arches
    for (let a = 0; a < 3; a++) {
      const arch = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(23 + a * 2.5, 0.34, 10, 72)),
        a === 1 ? glowMat : brassMat
      );
      arch.rotation.set(a * 0.65, a * 0.9, 0);
      arch.position.y = 2.0;
      group.add(arch);
      animatedObjects.push({
        mesh: arch,
        speed: (a % 2 === 0 ? 1 : -1) * 0.16,
        axis: 'y',
        mode: 'spin',
      });
    }
  }

  // InstancedMesh Atmospheric Celestial Motes / Embers / Crystals (180 instances)
  const moteCount = 180;
  const moteGeo = trackGeo(new THREE.OctahedronGeometry(0.16, 0));
  const moteMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: spec.accentColor,
      transparent: true,
      opacity: 0.78,
    })
  );
  const motes = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
  const dummy = new THREE.Object3D();
  const moteSeeds: { r: number; a: number; y: number; spd: number; sc: number }[] = [];
  for (let i = 0; i < moteCount; i++) {
    const r = 8 + Math.random() * 28;
    const a = Math.random() * Math.PI * 2;
    const y = 0.8 + Math.random() * 14;
    const spd = 0.12 + Math.random() * 0.35;
    const sc = 0.5 + Math.random() * 1.1;
    moteSeeds.push({ r, a, y, spd, sc });
    dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    motes.setMatrixAt(i, dummy.matrix);
  }
  motes.instanceMatrix.needsUpdate = true;
  motes.computeBoundingSphere();
  motes.frustumCulled = false;
  group.add(motes);

  return {
    id: realmId,
    group,
    update: (time: number) => {
      animatedObjects.forEach((item) => {
        if (item.mode === 'pendulum') {
          item.mesh.rotation.z = Math.sin(time * item.speed) * 0.36;
        } else {
          item.mesh.rotation[item.axis] += 0.008 * item.speed;
        }
      });

      for (let i = 0; i < moteCount; i++) {
        const m = moteSeeds[i];
        const ang = m.a + time * m.spd * 0.25;
        const y = m.y + Math.sin(time * m.spd * 2 + i) * 0.65;
        dummy.position.set(Math.cos(ang) * m.r, y, Math.sin(ang) * m.r);
        dummy.rotation.y = time * 1.4 + i;
        dummy.scale.setScalar(m.sc);
        dummy.updateMatrix();
        motes.setMatrixAt(i, dummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;
    },
    dispose: () => {
      disposableGeos.forEach((g) => g.dispose());
      disposableMats.forEach((m) => m.dispose());
    },
  };
}
