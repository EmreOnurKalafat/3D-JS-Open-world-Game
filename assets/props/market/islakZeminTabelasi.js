// assets/props/market/islakZeminTabelasi.js — Islak Zemin Tabelasi Prefab
// A-frame warning sign with CanvasTexture hazard symbol, yellow.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/islakZeminTabelasi.js';

function makeWarningTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 260;
  const ctx = canvas.getContext('2d');
  const w = 200, h = 260;

  // Yellow background
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, 0, w, h);

  // Black border
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Warning triangle (black outline with yellow inside)
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.moveTo(w / 2, 30);
  ctx.lineTo(w - 25, h - 50);
  ctx.lineTo(25, h - 50);
  ctx.closePath();
  ctx.fill();

  // Inner yellow triangle
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(w / 2, 48);
  ctx.lineTo(w - 42, h - 58);
  ctx.lineTo(42, h - 58);
  ctx.closePath();
  ctx.fill();

  // Exclamation mark "!"
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(w / 2, h - 100, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w / 2 - 8, h - 140, 16, 35);

  // "DIKKAT" text at bottom
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DİKKAT', w / 2, h - 22);

  // Slipping figure stick icon (simple)
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(w / 2, 105, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, 115);
  ctx.lineTo(w / 2 - 12, 138);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, 122);
  ctx.lineTo(w / 2 + 14, 145);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2 - 6, 128);
  ctx.lineTo(w / 2 - 22, 115);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, 115);
  ctx.lineTo(w / 2 + 16, 105);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createIslakZeminTabelasi() {
  if (!cachedTexture) cachedTexture = makeWarningTexture();

  const group = new THREE.Group();
  group.name = 'IslakZeminTabelasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Islak Zemin Tabelası';

  const signMat = new THREE.MeshLambertMaterial({ map: cachedTexture });

  // Left board with warning texture
  const leftBoard = boxMesh(0.48, 0.68, 0.04, signMat);
  leftBoard.position.set(-0.12, 0.46, 0);
  leftBoard.rotation.z = 0.20;
  leftBoard.userData.sourceFile = SRC;
  group.add(leftBoard);

  // Right board with warning texture
  const rightBoard = boxMesh(0.48, 0.68, 0.04, signMat);
  rightBoard.position.set(0.12, 0.46, 0);
  rightBoard.rotation.z = -0.20;
  rightBoard.userData.sourceFile = SRC;
  group.add(rightBoard);

  // Top hinge pin
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8),
    MAT.DARK_METAL
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.80, 0);
  hinge.userData.sourceFile = SRC;
  group.add(hinge);

  // Feet
  for (const side of [-1, 1]) {
    const foot = boxMesh(0.06, 0.035, 0.20, MAT.DARK_METAL);
    foot.position.set(side * 0.14, 0.03, side * 0.06);
    foot.rotation.z = side * 0.20;
    foot.userData.sourceFile = SRC;
    group.add(foot);
  }

  return group;
}
