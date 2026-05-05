// assets/props/office/sehpa.js — Coffee Table (A-grade)
// Low table with CanvasTexture wood grain top, tapered legs, lower shelf.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/sehpa.js';

function makeWoodTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#a07246';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 60; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(70,30,10,${0.08 + Math.random() * 0.15})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 15) {
      ctx.lineTo(x, y + Math.sin(x * 0.03) * 3);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeWoodTex(); return cachedTex; }

export function createSehpa() {
  const group = new THREE.Group();
  group.name = 'Sehpa';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sehpa';

  const woodMat = new THREE.MeshLambertMaterial({ map: getTex() });
  const legMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });

  // Table top
  const top = boxMesh(1.1, 0.06, 0.55, woodMat);
  top.position.set(0, 0.44, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // Lower shelf
  const shelf = boxMesh(0.9, 0.03, 0.45, woodMat);
  shelf.position.set(0, 0.2, 0);
  shelf.userData.sourceFile = SRC;
  group.add(shelf);

  // 4 tapered legs (thicker at top, thinner at bottom)
  for (const [dx, dz] of [[-0.46, -0.21], [0.46, -0.21], [-0.46, 0.21], [0.46, 0.21]]) {
    const leg = cylMesh(0.018, 0.025, 0.42, 8, legMat);
    leg.position.set(dx, 0.21, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  // Top edge trim
  for (const dz of [-0.25, 0.25]) {
    const trim = boxMesh(1.06, 0.015, 0.03, legMat);
    trim.position.set(0, 0.42, dz);
    trim.userData.sourceFile = SRC;
    group.add(trim);
  }

  return group;
}
