// assets/props/office/dolap.js — Filing Cabinet (A-grade)
// 4-drawer metal cabinet with CanvasTexture label holders, handles, and metallic finish.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/office/dolap.js';

function makeMetalTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Brushed metal
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#7a7a7a');
  grad.addColorStop(0.3, '#8a8a8a');
  grad.addColorStop(0.5, '#787878');
  grad.addColorStop(0.7, '#848484');
  grad.addColorStop(1, '#767676');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Horizontal brush lines
  for (let y = 0; y < size; y += 2) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.03})`;
    ctx.fillRect(0, y, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLabelTexture(text) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.35);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f5f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedMetalTex = null, cachedLabels = {};
function getMetalTex() {
  if (!cachedMetalTex) cachedMetalTex = makeMetalTexture();
  return cachedMetalTex;
}
function getLabelTex(text) {
  if (!cachedLabels[text]) cachedLabels[text] = makeLabelTexture(text);
  return cachedLabels[text];
}

export function createDolap() {
  const group = new THREE.Group();
  group.name = 'Dolap';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Dosya Dolabı';

  const metalTex = getMetalTex();
  const metalMat = new THREE.MeshLambertMaterial({ map: metalTex });
  const handleMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const labelTexts = ['A-D', 'E-K', 'L-R', 'S-Z'];

  // Cabinet body
  const body = boxMesh(0.9, 1.8, 0.5, metalMat);
  body.position.set(0, 0.9, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top/bottom trim
  for (const y of [0.04, 1.76]) {
    const tr = boxMesh(0.92, 0.04, 0.52, MAT.DARK_METAL);
    tr.position.set(0, y, 0);
    tr.userData.sourceFile = SRC;
    group.add(tr);
  }

  // 4 drawers
  for (let i = 0; i < 4; i++) {
    const y = 0.18 + i * 0.44;

    // Drawer front (slightly recessed)
    const face = boxMesh(0.82, 0.4, 0.015, metalMat);
    face.position.set(0, y, 0.255);
    face.userData.sourceFile = SRC;
    group.add(face);

    // Label holder
    const labelTex = getLabelTex(labelTexts[i]);
    const labelMat = new THREE.MeshLambertMaterial({ map: labelTex });
    const label = boxMesh(0.45, 0.06, 0.005, labelMat);
    label.position.set(0, y + 0.06, 0.265);
    label.userData.sourceFile = SRC;
    group.add(label);

    // Handle bar
    const handle = boxMesh(0.35, 0.025, 0.03, handleMat);
    handle.position.set(0, y - 0.04, 0.28);
    handle.userData.sourceFile = SRC;
    group.add(handle);

    // Handle standoffs
    for (const dx of [-0.14, 0.14]) {
      const so = boxMesh(0.02, 0.025, 0.02, handleMat);
      so.position.set(dx, y - 0.04, 0.265);
      so.userData.sourceFile = SRC;
      group.add(so);
    }
  }

  return group;
}
