// assets/props/office/bank.js — Park Bench Prefab (A-grade)
// Wood-slat bench with armrests, cast iron sides, CanvasTexture wood grain.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/office/bank.js';

function makeWoodTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base wood color
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(0, 0, size, size);

  // Wood grain lines
  for (let i = 0; i < 80; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(60, 35, 0, ${0.1 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 4);
    }
    ctx.stroke();
  }

  // Knots
  for (let k = 0; k < 3; k++) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    const kr = 5 + Math.random() * 12;
    ctx.fillStyle = '#4a2800';
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.arc(kx, ky, kr * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTexture() {
  if (!cachedTex) cachedTex = makeWoodTexture();
  return cachedTex;
}

export function createBank() {
  const group = new THREE.Group();
  group.name = 'Bank';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Park Bankı';

  const tex = getTexture();
  const woodMat = new THREE.MeshLambertMaterial({ map: tex });

  // 3 seat slats (gap between each)
  for (let i = 0; i < 3; i++) {
    const slat = boxMesh(1.8, 0.04, 0.1, woodMat);
    slat.position.set(0, 0.44, -0.1 + i * 0.1);
    slat.userData.sourceFile = SRC;
    group.add(slat);
  }

  // 2 backrest slats
  for (let i = 0; i < 2; i++) {
    const slat = boxMesh(1.8, 0.04, 0.08, woodMat);
    slat.position.set(0, 0.62 + i * 0.1, -0.22);
    slat.userData.sourceFile = SRC;
    group.add(slat);
  }

  // Cast iron side frames (decorative)
  const ironMat = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
  for (const dx of [-0.85, 0.85]) {
    // Vertical leg/armrest support
    const leg = boxMesh(0.05, 0.48, 0.06, ironMat);
    leg.position.set(dx, 0.24, -0.02);
    leg.userData.sourceFile = SRC;
    group.add(leg);

    // Armrest top
    const armrest = boxMesh(0.06, 0.03, 0.4, woodMat);
    armrest.position.set(dx, 0.5, -0.02);
    armrest.userData.sourceFile = SRC;
    group.add(armrest);

    // Decorative scroll (simplified as curved box)
    const scroll = boxMesh(0.04, 0.15, 0.04, ironMat);
    scroll.position.set(dx, 0.32, -0.08);
    scroll.userData.sourceFile = SRC;
    group.add(scroll);

    // Base foot
    const foot = boxMesh(0.08, 0.03, 0.42, ironMat);
    foot.position.set(dx, 0.02, 0);
    foot.userData.sourceFile = SRC;
    group.add(foot);
  }

  return group;
}
