import * as THREE from 'three';

export interface ProceduralTextureSet {
  astrolabeFloor: THREE.CanvasTexture;
  sovereignMarble: THREE.CanvasTexture;
  volcanicBasalt: THREE.CanvasTexture;
  lunarQuartz: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const applySettings = (tex: THREE.CanvasTexture, repeatX = 1, repeatY = 1) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.min(8, maxAnisotropy || 1);
    tex.needsUpdate = true;
    return tex;
  };

  // 1. Astrolabe Arena Floor (Obsidian marble + 24k gold celestial dial markings)
  const astroCanvas = document.createElement('canvas');
  astroCanvas.width = 1024;
  astroCanvas.height = 1024;
  const actx = astroCanvas.getContext('2d')!;
  actx.fillStyle = '#0c0e16';
  actx.fillRect(0, 0, 1024, 1024);

  // Subtle marble veining
  for (let i = 0; i < 40; i++) {
    actx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.08)' : 'rgba(148, 163, 184, 0.05)';
    actx.lineWidth = 1 + (i % 3);
    actx.beginPath();
    let x = Math.random() * 1024;
    let y = Math.random() * 1024;
    actx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (Math.random() - 0.5) * 260;
      y += (Math.random() - 0.5) * 260;
      actx.lineTo(x, y);
    }
    actx.stroke();
  }

  // Concentric astrolabe rings & degree ticks
  const cx = 512;
  const cy = 512;
  const radii = [120, 210, 310, 405, 480];
  radii.forEach((r, idx) => {
    actx.strokeStyle = idx % 2 === 0 ? 'rgba(212, 175, 55, 0.55)' : 'rgba(245, 208, 110, 0.3)';
    actx.lineWidth = idx === 4 ? 4 : 2;
    actx.beginPath();
    actx.arc(cx, cy, r, 0, Math.PI * 2);
    actx.stroke();
  });

  // 72 horological ticks around outer rim
  for (let a = 0; a < 72; a++) {
    const angle = (a / 72) * Math.PI * 2;
    const inner = a % 6 === 0 ? 445 : 464;
    const outer = 480;
    actx.strokeStyle = a % 6 === 0 ? 'rgba(244, 211, 94, 0.85)' : 'rgba(212, 175, 55, 0.35)';
    actx.lineWidth = a % 6 === 0 ? 3 : 1.5;
    actx.beginPath();
    actx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    actx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    actx.stroke();
  }

  // 12 radial celestial spokes
  for (let s = 0; s < 12; s++) {
    const angle = (s / 12) * Math.PI * 2;
    actx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
    actx.lineWidth = 1.5;
    actx.beginPath();
    actx.moveTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
    actx.lineTo(cx + Math.cos(angle) * 405, cy + Math.sin(angle) * 405);
    actx.stroke();
  }

  const astrolabeFloor = applySettings(new THREE.CanvasTexture(astroCanvas), 1, 1);

  // 2. Sovereign White Marble + Gold Filigree
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = 512;
  marbleCanvas.height = 512;
  const mctx = marbleCanvas.getContext('2d')!;
  mctx.fillStyle = '#ede8de';
  mctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 28; i++) {
    mctx.strokeStyle = i % 4 === 0 ? 'rgba(212, 175, 55, 0.32)' : 'rgba(120, 113, 108, 0.14)';
    mctx.lineWidth = i % 4 === 0 ? 2 : 1.2;
    mctx.beginPath();
    let x = (i * 47) % 512;
    let y = 0;
    mctx.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      x += Math.sin(k + i) * 38;
      y += 64;
      mctx.lineTo(x, y);
    }
    mctx.stroke();
  }
  const sovereignMarble = applySettings(new THREE.CanvasTexture(marbleCanvas), 2, 2);

  // 3. Volcanic Basalt & Molten Gold Veins
  const basaltCanvas = document.createElement('canvas');
  basaltCanvas.width = 512;
  basaltCanvas.height = 512;
  const bctx = basaltCanvas.getContext('2d')!;
  bctx.fillStyle = '#1b1615';
  bctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 36; i++) {
    bctx.strokeStyle = i % 3 === 0 ? 'rgba(234, 88, 12, 0.55)' : 'rgba(68, 64, 60, 0.4)';
    bctx.lineWidth = i % 3 === 0 ? 2.5 : 1.5;
    bctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    bctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (Math.random() - 0.5) * 140;
      y += (Math.random() - 0.5) * 140;
      bctx.lineTo(x, y);
    }
    bctx.stroke();
  }
  const volcanicBasalt = applySettings(new THREE.CanvasTexture(basaltCanvas), 2, 2);

  // 4. Faceted Lunar Quartz
  const quartzCanvas = document.createElement('canvas');
  quartzCanvas.width = 512;
  quartzCanvas.height = 512;
  const qctx = quartzCanvas.getContext('2d')!;
  const qGrad = qctx.createLinearGradient(0, 0, 512, 512);
  qGrad.addColorStop(0, '#c7e8ff');
  qGrad.addColorStop(0.5, '#e2e8f0');
  qGrad.addColorStop(1, '#a5d8ff');
  qctx.fillStyle = qGrad;
  qctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24; i++) {
    qctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    qctx.lineWidth = 1.5;
    qctx.beginPath();
    qctx.moveTo((i * 73) % 512, 0);
    qctx.lineTo(((i * 73 + 180) % 512), 512);
    qctx.stroke();
  }
  const lunarQuartz = applySettings(new THREE.CanvasTexture(quartzCanvas), 1, 1);

  // 5. Soft Radial Contact Shadow
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d')!;
  const sGrad = sctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  sGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sctx.fillStyle = sGrad;
  sctx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);
  contactShadow.colorSpace = THREE.SRGBColorSpace;
  contactShadow.needsUpdate = true;

  return {
    astrolabeFloor,
    sovereignMarble,
    volcanicBasalt,
    lunarQuartz,
    contactShadow,
    dispose: () => {
      astrolabeFloor.dispose();
      sovereignMarble.dispose();
      volcanicBasalt.dispose();
      lunarQuartz.dispose();
      contactShadow.dispose();
    },
  };
}
