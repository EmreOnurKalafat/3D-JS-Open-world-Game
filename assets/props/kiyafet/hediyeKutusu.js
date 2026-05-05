// assets/props/kiyafet/hediyeKutusu.js — Hediye Kutusu Prefab
// Gift box with CanvasTexture wrapping paper, ribbon, and bow on top.

import * as THREE from 'three';
import { boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/hediyeKutusu.js';

function makeGiftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Red gift wrap base
  ctx.fillStyle = '#cc2233';
  ctx.fillRect(0, 0, 128, 128);

  // Gold polka dots
  ctx.fillStyle = '#d4a843';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.beginPath();
    ctx.arc(x, y, 3 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle stripe pattern overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 128; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createHediyeKutusu() {
  if (!cachedTexture) cachedTexture = makeGiftTexture();

  const group = new THREE.Group();
  group.name = 'HediyeKutusu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Hediye Kutusu';

  const s = 0.32;
  const giftMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4a843 });

  // Box body with gift wrap texture
  const box = boxMesh(s, s, s, giftMat);
  box.position.set(0, s / 2, 0);
  box.userData.sourceFile = SRC;
  group.add(box);

  // Gold ribbon - horizontal band
  const ribbonH = boxMesh(s + 0.03, 0.05, 0.07, goldMat);
  ribbonH.position.set(0, s / 2, 0);
  ribbonH.userData.sourceFile = SRC;
  group.add(ribbonH);

  // Gold ribbon - vertical band (front/back)
  const ribbonV = boxMesh(0.07, 0.05, s + 0.03, goldMat);
  ribbonV.position.set(0, s / 2, 0);
  ribbonV.userData.sourceFile = SRC;
  group.add(ribbonV);

  // Bow on top (layered loops)
  const bowLoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 8), goldMat);
  bowLoop1.position.set(0, s + 0.05, 0.06);
  bowLoop1.userData.sourceFile = SRC;
  group.add(bowLoop1);

  const bowLoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 8), goldMat);
  bowLoop2.position.set(0, s + 0.05, -0.06);
  bowLoop2.userData.sourceFile = SRC;
  group.add(bowLoop2);

  // Center knot
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), goldMat);
  knot.position.set(0, s + 0.05, 0);
  knot.userData.sourceFile = SRC;
  group.add(knot);

  return group;
}
