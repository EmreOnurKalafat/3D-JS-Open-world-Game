// assets/props/kiyafet/ayakkabiKutusu.js — Ayakkabi Kutusu Prefab
// Shoebox with CanvasTexture brand label, lid, realistic proportions.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/ayakkabiKutusu.js';

function makeShoeBoxTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 180; canvas.height = 100;
  const ctx = canvas.getContext('2d');

  // White box face
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 180, 100);

  // Gray border
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 172, 92);

  // Brand area
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(40, 18, 100, 40);

  // Brand text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KICKX', 90, 32);

  // Swoosh/sport line
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(30, 48);
  ctx.quadraticCurveTo(80, 38, 140, 48);
  ctx.stroke();

  // Size label bottom right
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('42', 150, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createAyakkabiKutusu() {
  if (!cachedTexture) cachedTexture = makeShoeBoxTexture();

  const group = new THREE.Group();
  group.name = 'AyakkabiKutusu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ayakkabı Kutusu';

  const w = 0.38, h = 0.22, d = 0.30;
  const boxMat = new THREE.MeshLambertMaterial({ map: cachedTexture });

  // Box body with brand texture
  const body = boxMesh(w, h, d, boxMat);
  body.position.set(0, h / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Lid slightly larger
  const lid = boxMesh(w + 0.02, 0.035, d + 0.02, MAT.WHITE);
  lid.position.set(0, h + 0.018, 0);
  lid.userData.sourceFile = SRC;
  group.add(lid);

  // Side accent stripe
  for (const side of [-1, 1]) {
    const stripe = boxMesh(0.015, 0.03, d - 0.02, new THREE.MeshLambertMaterial({ color: 0xff4444 }));
    stripe.position.set(side * (w / 2 + 0.01), h * 0.65, 0);
    stripe.userData.sourceFile = SRC;
    group.add(stripe);
  }

  return group;
}
