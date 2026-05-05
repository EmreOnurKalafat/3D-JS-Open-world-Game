// assets/props/kiyafet/kasaBankosu.js — Checkout Counter (A-grade)
// Stylish retail counter with CanvasTexture granite top, wood body, store branding.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/kasaBankosu.js';

function makeCounterTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.35);
  const ctx = canvas.getContext('2d');

  // White marble/granite look
  ctx.fillStyle = '#f5f0ea';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle veining
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = 'rgba(200,190,180,0.3)';
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    const sy = Math.random() * canvas.height;
    ctx.moveTo(0, sy);
    for (let x = 0; x < canvas.width; x += 10) {
      ctx.lineTo(x, sy + Math.sin(x * 0.04) * 8 + Math.cos(x * 0.07) * 4);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeBrandTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.25);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TREND', canvas.width / 4, canvas.height / 2);
  ctx.fillStyle = '#c9a84c';
  ctx.fillText('STORE', canvas.width * 0.65, canvas.height / 2);

  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.42, 8);
  ctx.lineTo(canvas.width * 0.42, canvas.height - 8);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedCounter = null, cachedBrand = null;
function getCounterTex() { if (!cachedCounter) cachedCounter = makeCounterTex(); return cachedCounter; }
function getBrandTex() { if (!cachedBrand) cachedBrand = makeBrandTex(); return cachedBrand; }

export function createKasaBankosu() {
  const group = new THREE.Group();
  group.name = 'KasaBankosu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Kasa Bankosu';
  group.userData.interactable = true;

  const w = 3.0, h = 1.0, d = 1.1;
  const bodyMat = MAT.WHITE;
  const counterMat = new THREE.MeshLambertMaterial({ map: getCounterTex() });
  const brandMat = new THREE.MeshLambertMaterial({ map: getBrandTex() });
  const woodTrimMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });

  // Main body
  const bodyH = 0.7;
  const body = boxMesh(w - 0.04, bodyH, d - 0.04, bodyMat);
  body.position.set(0, bodyH / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Countertop
  const top = boxMesh(w, 0.05, d, counterMat);
  top.position.set(0, bodyH + 0.025, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // Top overhang trim
  const overhang = boxMesh(w, 0.02, d + 0.02, woodTrimMat);
  overhang.position.set(0, bodyH - 0.01, 0);
  overhang.userData.sourceFile = SRC;
  group.add(overhang);

  // Brand plate on front
  const brand = boxMesh(2.0, 0.18, 0.015, brandMat);
  brand.position.set(0, bodyH * 0.55, d / 2 + 0.01);
  brand.userData.sourceFile = SRC;
  group.add(brand);

  // Side panels (wood)
  for (const dx of [-w / 2 + 0.02, w / 2 - 0.02]) {
    const panel = boxMesh(0.04, bodyH, d, woodTrimMat);
    panel.position.set(dx, bodyH / 2, 0);
    panel.userData.sourceFile = SRC;
    group.add(panel);
  }

  // Kick plate
  const kick = boxMesh(w, 0.05, d, MAT.DARK_METAL);
  kick.position.set(0, 0.025, 0);
  kick.userData.sourceFile = SRC;
  group.add(kick);

  return group;
}
