// assets/props/kiyafet/askiDuvar.js — Wall-Mounted Clothing Rack (A-grade)
// Wall-mounted bar with hangers, CanvasTexture garments, and mounting brackets.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/askiDuvar.js';

function makeGarmentTex(colorHex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 1.4);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fabric fold shading
  for (let i = 0; i < 8; i++) {
    const x = i * (canvas.width / 7);
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(x - 2, 0, 3, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, 0, 2, canvas.height);
  }

  // Neckline hint
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 20, canvas.width * 0.2, Math.PI, 0);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const COLORS = ['#cc3333', '#3366aa', '#2c3e50', '#d4c8a8', '#339955'];
let cachedTexes = {};
function getGarmentTex(c) {
  if (!cachedTexes[c]) cachedTexes[c] = makeGarmentTex(c);
  return cachedTexes[c];
}

export function createAskiDuvar(w = 3) {
  const group = new THREE.Group();
  group.name = 'AskiDuvar';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Duvar Askılık (' + w + 'm)';
  group.userData.rackType = 'wall_rack';

  const barH = 1.6, barD = 0.3;
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });

  // Wall mounting plate
  const plate = boxMesh(w, 0.1, 0.02, metalMat);
  plate.position.set(0, barH, -barD);
  plate.userData.sourceFile = SRC;
  group.add(plate);

  // Main horizontal bar
  const bar = cylMesh(0.028, 0.028, w, 12, MAT.BAR_METAL);
  bar.position.set(0, barH, -(barD - 0.08));
  bar.rotation.z = Math.PI / 2;
  bar.userData.sourceFile = SRC;
  group.add(bar);

  // 3 support brackets
  for (let i = -1; i <= 1; i++) {
    const bx = i * (w / 3);
    const bracket = boxMesh(0.05, 0.06, barD - 0.06, metalMat);
    bracket.position.set(bx, barH - 0.06, -(barD / 2));
    bracket.userData.sourceFile = SRC;
    group.add(bracket);
  }

  // Hangers with garments
  const count = Math.min(5, Math.floor(w / 0.5));
  for (let i = 0; i < count; i++) {
    const ax = -w / 2 + (i + 0.5) * (w / count);
    const gz = -(barD - 0.14);

    // Hook
    const hook = cylMesh(0.008, 0.008, 0.08, 6, MAT.DARK_METAL);
    hook.position.set(ax, barH + 0.04, gz);
    hook.userData.sourceFile = SRC;
    group.add(hook);

    // Hanger body (V-shape approximated)
    const hanger = boxMesh(0.18, 0.01, 0.015, MAT.DARK_METAL);
    hanger.position.set(ax, barH - 0.02, gz);
    hanger.userData.sourceFile = SRC;
    group.add(hanger);

    // Garment
    const col = COLORS[i % COLORS.length];
    const gTex = getGarmentTex(col);
    const gMat = new THREE.MeshLambertMaterial({ map: gTex });
    const garment = boxMesh(0.16, 0.32, 0.025, gMat);
    garment.position.set(ax, barH - 0.2, gz);
    garment.userData.sourceFile = SRC;
    group.add(garment);
  }

  return group;
}
