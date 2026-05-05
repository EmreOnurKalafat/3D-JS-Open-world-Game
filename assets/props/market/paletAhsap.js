// assets/props/market/paletAhsap.js — Ahşap Palet Prefab
// Wooden pallet with CanvasTexture grain, optimized to 7 meshes.

import * as THREE from 'three';
import { boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/paletAhsap.js';

function makePaletTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Wood base with grain lines
  ctx.fillStyle = '#9b7b5e';
  ctx.fillRect(0, 0, 128, 128);

  // Wood grain streaks
  ctx.strokeStyle = '#7a5c3e';
  ctx.lineWidth = 1;
  for (let y = 0; y < 128; y += 6 + Math.random() * 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }

  // Knot
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.ellipse(40, 40, 5, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(100, 90, 4, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createPaletAhsap() {
  if (!cachedTexture) cachedTexture = makePaletTexture();

  const group = new THREE.Group();
  group.name = 'PaletAhsap';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ahşap Palet';

  const woodMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const w = 1.2, d = 1.0;

  // Top slats (5)
  for (let i = 0; i < 5; i++) {
    const slat = boxMesh(0.09, 0.04, d, woodMat);
    slat.position.set(-w / 2 + 0.1 + i * (w - 0.2) / 4, 0.13, 0);
    slat.userData.sourceFile = SRC;
    group.add(slat);
  }

  // Bottom slats (3)
  for (let i = 0; i < 3; i++) {
    const slat = boxMesh(0.09, 0.04, d, woodMat);
    slat.position.set(-w / 2 + 0.2 + i * (w - 0.4) / 2, 0.02, 0);
    slat.userData.sourceFile = SRC;
    group.add(slat);
  }

  // Support blocks (3 × 3 → 9 → reduce to rows with gaps)
  for (let i = 0; i < 3; i++) {
    const block = boxMesh(w / 3 - 0.1, 0.09, d / 3 - 0.1, woodMat);
    block.position.set(
      -w / 2 + 0.2 + i * (w - 0.4) / 2,
      0.08,
      0
    );
    block.userData.sourceFile = SRC;
    group.add(block);
  }

  return group;
}
