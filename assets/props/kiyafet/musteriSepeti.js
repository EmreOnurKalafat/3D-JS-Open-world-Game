// assets/props/kiyafet/musteriSepeti.js — Shopping Basket (A-grade)
// Handheld basket with CanvasTexture wire grid, plastic rim, and comfortable handle.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/musteriSepeti.js';

function makeBasketGridTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Plastic base
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, size, size);

  // Grid pattern
  ctx.strokeStyle = '#505050';
  ctx.lineWidth = 1;
  for (let x = 0; x < size; x += 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
  }
  for (let y = 0; y < size; y += 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
  }

  // Plastic specular sheen
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.04)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.04)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeBasketGridTex(); return cachedTex; }

export function createMusteriSepeti() {
  const group = new THREE.Group();
  group.name = 'MusteriSepeti';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Müşteri Sepeti';

  const w = 0.5, h = 0.35, d = 0.5;
  const basketMat = new THREE.MeshLambertMaterial({ map: getTex() });
  const rimMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const handleMat = MAT.BAR_METAL;

  // Bottom
  const bottom = boxMesh(w, 0.02, d, basketMat);
  bottom.position.set(0, 0.01, 0);
  bottom.userData.sourceFile = SRC;
  group.add(bottom);

  // 4 side walls (tapered outward)
  const wallThick = 0.02;
  const sides = [
    [0, h / 2, -d / 2, w, h, wallThick],
    [0, h / 2, d / 2, w, h, wallThick],
    [-w / 2, h / 2, 0, wallThick, h, d],
    [w / 2, h / 2, 0, wallThick, h, d],
  ];
  for (const [sx, sy, sz, sw, sh, sd] of sides) {
    const wall = boxMesh(sw, sh, sd, basketMat);
    wall.position.set(sx, sy, sz);
    wall.userData.sourceFile = SRC;
    group.add(wall);
  }

  // Top rim
  const rimThick = 0.025;
  const rims = [
    [0, h, -d / 2, w, rimThick, rimThick * 2],
    [0, h, d / 2, w, rimThick, rimThick * 2],
    [-w / 2, h, 0, rimThick * 2, rimThick, d],
    [w / 2, h, 0, rimThick * 2, rimThick, d],
  ];
  for (const [rx, ry, rz, rw, rh, rd] of rims) {
    const rim = boxMesh(rw, rh, rd, rimMat);
    rim.position.set(rx, ry, rz);
    rim.userData.sourceFile = SRC;
    group.add(rim);
  }

  // Handle (U-shape above rim)
  const handleH = 0.08;
  const handleW = 0.32;
  const handleGrip = cylMesh(0.012, 0.012, handleW, 8, handleMat);
  handleGrip.position.set(0, h + handleH, -d / 2);
  handleGrip.rotation.z = Math.PI / 2;
  handleGrip.userData.sourceFile = SRC;
  group.add(handleGrip);

  // Handle posts
  for (const dx of [-handleW / 2, handleW / 2]) {
    const post = cylMesh(0.01, 0.01, handleH, 8, handleMat);
    post.position.set(dx, h + handleH / 2, -d / 2);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  // Rubber grip sleeve
  const gripMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const grip = cylMesh(0.016, 0.016, 0.12, 8, gripMat);
  grip.position.set(0, h + handleH, -d / 2);
  grip.rotation.z = Math.PI / 2;
  grip.userData.sourceFile = SRC;
  group.add(grip);

  return group;
}
