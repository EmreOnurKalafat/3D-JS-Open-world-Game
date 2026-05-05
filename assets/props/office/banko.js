// assets/props/office/banko.js — Reception Counter (A-grade)
// Granite-top counter with wood body, front panels, and brass trim.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/office/banko.js';

function makeGraniteTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Granite base
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, size, size);

  // Speckle pattern
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 120 + Math.random() * 80;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Veins
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const vy = Math.random() * size;
    ctx.moveTo(0, vy);
    for (let x = 0; x < size; x += 10) {
      ctx.lineTo(x, vy + Math.sin(x * 0.05) * 20);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTexture() {
  if (!cachedTex) cachedTex = makeGraniteTexture();
  return cachedTex;
}

export function createBanko() {
  const group = new THREE.Group();
  group.name = 'Banko';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Resepsiyon Bankosu';

  const w = 4.0, h = 1.0, d = 0.75;
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b3a2a });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xc9a94e });

  // Counter body — wood
  const body = boxMesh(w, h - 0.05, d, woodMat);
  body.position.set(0, (h - 0.05) / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Front panel inset detail
  for (let i = 0; i < 3; i++) {
    const panel = boxMesh(1.1, 0.5, 0.015, trimMat);
    panel.position.set(-1.3 + i * 1.3, 0.5, d / 2 + 0.01);
    panel.userData.sourceFile = SRC;
    group.add(panel);
  }

  // Granite countertop
  const tex = getTexture();
  const graniteMat = new THREE.MeshLambertMaterial({ map: tex });
  const top = boxMesh(w + 0.2, 0.06, d + 0.05, graniteMat);
  top.position.set(0, h - 0.03, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // Brass trim strip under countertop
  const trim = boxMesh(w, 0.015, d + 0.02, trimMat);
  trim.position.set(0, h - 0.09, 0);
  trim.userData.sourceFile = SRC;
  group.add(trim);

  // Base kick-plate
  const kick = boxMesh(w, 0.06, d, MAT.DARK_METAL);
  kick.position.set(0, 0.03, 0);
  kick.userData.sourceFile = SRC;
  group.add(kick);

  // Side decorative columns
  for (const dx of [-w / 2 + 0.05, w / 2 - 0.05]) {
    const col = boxMesh(0.06, h - 0.12, 0.06, trimMat);
    col.position.set(dx, h / 2, d / 2);
    col.userData.sourceFile = SRC;
    group.add(col);
  }

  return group;
}
