// assets/props/market/koliKutu.js — Karton Koli Prefab
// Cardboard box with CanvasTexture markings, tape, and handling symbols.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/koliKutu.js';

function makeKoliTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const w = 256, h = 200;

  // Cardboard color
  ctx.fillStyle = '#c4956a';
  ctx.fillRect(0, 0, w, h);

  // Corrugation lines (subtle horizontal)
  ctx.strokeStyle = '#b8865a';
  ctx.lineWidth = 1;
  for (let y = 5; y < h; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Center tape strip
  ctx.fillStyle = 'rgba(230,220,200,0.7)';
  ctx.fillRect(w / 2 - 20, 0, 40, h);

  // "THIS WAY UP" arrows at top
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('↑↑', w / 2, 38);

  // "FRAGILE" text
  ctx.fillStyle = '#cc3333';
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('KIRILABİLİR', w / 2, h / 2 + 4);

  // Handles symbol
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w * 0.2, h * 0.35, 14, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.35, 14, Math.PI, 0);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createKoliKutu() {
  if (!cachedTexture) cachedTexture = makeKoliTexture();

  const group = new THREE.Group();
  group.name = 'KoliKutu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Karton Koli';

  const w = 0.7, h = 0.55, d = 0.5;
  const boxMat = new THREE.MeshLambertMaterial({ map: cachedTexture });

  // Main body with texture
  const body = boxMesh(w, h, d, boxMat);
  body.position.set(0, h / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Tape on top
  const tapeTop = boxMesh(w, 0.015, 0.09, MAT.OFF_WHITE);
  tapeTop.position.set(0, h, 0);
  tapeTop.userData.sourceFile = SRC;
  group.add(tapeTop);

  // Tape on front face
  const tapeFront = boxMesh(0.09, 0.015, d, MAT.OFF_WHITE);
  tapeFront.position.set(0, h / 2, d / 2 + 0.015);
  tapeFront.userData.sourceFile = SRC;
  group.add(tapeFront);

  // Tape on side faces
  for (const side of [-1, 1]) {
    const tapeSide = boxMesh(0.015, 0.015, d, MAT.OFF_WHITE);
    tapeSide.position.set(side * (w / 2 + 0.015), h / 2, 0);
    tapeSide.userData.sourceFile = SRC;
    group.add(tapeSide);
  }

  return group;
}
