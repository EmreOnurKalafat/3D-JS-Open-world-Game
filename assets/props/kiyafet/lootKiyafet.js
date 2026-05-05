// assets/props/kiyafet/lootKiyafet.js — Loot: Folded Clothing (A-grade)
// Stack of folded garments with CanvasTexture fabric patterns.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/lootKiyafet.js';

function makeFabricTex(colorHex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, size, size);

  // Thread lines (horizontal weave)
  for (let y = 0; y < size; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, y, size, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, y + 2, size, 1);
  }

  // Fold creases
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const fy = size * (0.25 + i * 0.25);
    ctx.moveTo(0, fy);
    ctx.lineTo(size, fy);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const COLORS = ['#3366aa', '#cc4444', '#339955', '#7a6a5a', '#d4a843'];
let cachedTexes = {};
function getTex(hex) { if (!cachedTexes[hex]) cachedTexes[hex] = makeFabricTex(hex); return cachedTexes[hex]; }

export function createLootKiyafet() {
  const group = new THREE.Group();
  group.name = 'LootKiyafet';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Katlanmış Kıyafet (Loot)';
  group.userData.lootType = 'clothing';

  // Stack of 3 folded garments
  for (let i = 0; i < 3; i++) {
    const col = COLORS[i % COLORS.length];
    const mat = new THREE.MeshLambertMaterial({ map: getTex(col) });
    const sy = 0.03 + i * 0.06;

    // Main folded body
    const body = boxMesh(0.38, 0.05, 0.3, mat);
    body.position.set(0, sy, 0);
    body.userData.sourceFile = SRC;
    group.add(body);

    // Sleeve hints on sides
    for (const dx of [-0.2, 0.2]) {
      const sleeve = boxMesh(0.08, 0.03, 0.2, mat);
      sleeve.position.set(dx, sy, 0);
      sleeve.userData.sourceFile = SRC;
      group.add(sleeve);
    }
  }

  // Collar hint on top garment
  const topCol = COLORS[0];
  const topMat = new THREE.MeshLambertMaterial({ map: getTex(topCol) });
  const collar = boxMesh(0.15, 0.015, 0.08, topMat);
  collar.position.set(0, 0.2, -0.13);
  collar.userData.sourceFile = SRC;
  group.add(collar);

  return group;
}
