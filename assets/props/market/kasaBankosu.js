// assets/props/market/kasaBankosu.js — Kasa Bankosu Prefab
// Checkout counter with CanvasTexture top, wood body, divider panels.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/kasaBankosu.js';

function makeCounterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // White countertop
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 256, 64);

  // Speckle pattern
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(${180 + Math.random()*40},${180 + Math.random()*40},${180 + Math.random()*40},0.5)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 64, 2, 2);
  }

  // Edge highlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createKasaBankosu() {
  if (!cachedTexture) cachedTexture = makeCounterTexture();

  const group = new THREE.Group();
  group.name = 'KasaBankosu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Kasa Bankosu';
  group.userData.interactable = true;
  group.userData.interactLabel = '[E] Banko';

  const w = 2.5, d = 1.2, h = 1.05;

  // Countertop with texture
  const topMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const top = boxMesh(w + 0.1, 0.06, d + 0.1, topMat);
  top.position.set(0, h * 0.58, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // Lower body (wood)
  const body = boxMesh(w - 0.1, h * 0.52, d - 0.15, MAT.WOOD);
  body.position.set(0, h * 0.27, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Bottom frame
  const frame = boxMesh(w, 0.06, d, MAT.FURNITURE_TRIM);
  frame.position.set(0, 0.03, 0);
  frame.userData.sourceFile = SRC;
  group.add(frame);

  // Divider panel
  const divider = boxMesh(0.04, h * 0.38, d - 0.2, MAT.WOOD);
  divider.position.set(0, h * 0.28, 0);
  divider.userData.sourceFile = SRC;
  group.add(divider);

  // Side panels and feet
  for (const side of [-1, 1]) {
    const sidePanel = boxMesh(0.04, h * 0.52, d, MAT.WOOD);
    sidePanel.position.set(side * (w / 2 - 0.02), h * 0.27, 0);
    sidePanel.userData.sourceFile = SRC;
    group.add(sidePanel);

    const foot = boxMesh(0.08, 0.05, 0.08, MAT.FURNITURE_TRIM);
    foot.position.set(side * (w / 2 - 0.15), 0.025, d / 2 - 0.08);
    foot.userData.sourceFile = SRC;
    group.add(foot);
  }

  return group;
}
