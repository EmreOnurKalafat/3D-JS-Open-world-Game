// assets/props/kiyafet/buyukAyna.js — Large Wall Mirror (A-grade)
// Full-length mirror with ornate CanvasTexture frame, reflection panel, and wall mounts.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/buyukAyna.js';

function makeMirrorTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 1.6);
  const ctx = canvas.getContext('2d');

  // Mirror gradient (light blue-gray reflection)
  const grad = ctx.createLinearGradient(0, 0, size, canvas.height);
  grad.addColorStop(0, '#d8e8f0');
  grad.addColorStop(0.3, '#e8f0f8');
  grad.addColorStop(0.5, '#c8dce8');
  grad.addColorStop(0.7, '#dce8f0');
  grad.addColorStop(1, '#c0d4e0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, canvas.height);

  // Diagonal reflection streaks
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 20 + Math.random() * 30;
    const sx = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(sx - 100, 0);
    ctx.lineTo(sx + 100, canvas.height);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeFrameTex() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Gold ornate frame
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#c9a84c');
  grad.addColorStop(0.3, '#e8d48c');
  grad.addColorStop(0.5, '#b8942e');
  grad.addColorStop(0.7, '#e0c878');
  grad.addColorStop(1, '#a08030');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Ornate pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = 10 + i * 20;
    ctx.beginPath();
    for (let x = 0; x < size; x += 5) {
      ctx.lineTo(x, y + Math.sin(x * 0.3) * 3);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedMirror = null, cachedFrame = null;
function getMirrorTex() { if (!cachedMirror) cachedMirror = makeMirrorTex(); return cachedMirror; }
function getFrameTex() { if (!cachedFrame) cachedFrame = makeFrameTex(); return cachedFrame; }

export function createBuyukAyna() {
  const group = new THREE.Group();
  group.name = 'BuyukAyna';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Büyük Ayna';

  const w = 1.5, h = 2.5;
  const mirrorMat = new THREE.MeshLambertMaterial({ map: getMirrorTex() });
  const frameMat = new THREE.MeshLambertMaterial({ map: getFrameTex() });

  // Mirror panel
  const mirror = boxMesh(w, h, 0.02, mirrorMat);
  mirror.position.set(0, h / 2, 0);
  mirror.userData.sourceFile = SRC;
  group.add(mirror);

  // Frame pieces (ornate gold)
  const fw = 0.08, fd = 0.04;
  const sides = [
    [-w / 2 - fw / 2, h / 2, 0, fw, h, fd],
    [w / 2 + fw / 2, h / 2, 0, fw, h, fd],
    [0, h + fw / 2, 0, w + fw * 2, fw, fd],
    [0, -fw / 2, 0, w + fw * 2, fw, fd],
  ];
  for (const [sx, sy, sz, sw, sh, sd] of sides) {
    const piece = boxMesh(sw, sh, sd, frameMat);
    piece.position.set(sx, sy, sz);
    piece.userData.sourceFile = SRC;
    group.add(piece);
  }

  // Top decorative crown
  const crown = boxMesh(w + fw * 2, 0.04, fd + 0.02, frameMat);
  crown.position.set(0, h + fw + 0.02, 0);
  crown.userData.sourceFile = SRC;
  group.add(crown);

  // Wall mount keyhole plates
  for (const dy of [0.5, h - 0.3]) {
    const mount = boxMesh(0.08, 0.06, 0.01, MAT.DARK_METAL);
    mount.position.set(0, dy, -0.03);
    mount.userData.sourceFile = SRC;
    group.add(mount);
  }

  return group;
}
