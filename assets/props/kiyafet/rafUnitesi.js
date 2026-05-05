// assets/props/kiyafet/rafUnitesi.js — Shelf Display Unit (A-grade)
// 3-tier shelving with CanvasTexture wood shelves, metal frame, folded garments.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/rafUnitesi.js';

function makeShelfWoodTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.25);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c4a47a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 30; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = `rgba(100,60,20,${0.08 + Math.random() * 0.1})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < canvas.width; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.05) * 2);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeGarmentTex(colorHex) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, y, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const GARMENT_COLORS = ['#cc3333', '#3366aa', '#339955', '#d4c8a8', '#7a5030', '#e8a020'];
let cacheShelf = null, cacheGarm = {};
function getShelfTex() { if (!cacheShelf) cacheShelf = makeShelfWoodTex(); return cacheShelf; }
function getGarmTex(hex) { if (!cacheGarm[hex]) cacheGarm[hex] = makeGarmentTex(hex); return cacheGarm[hex]; }

export function createRafUnitesi() {
  const group = new THREE.Group();
  group.name = 'RafUnitesi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Raf Ünitesi';
  group.userData.rackType = 'shelf';

  const w = 2.0, h = 1.8, d = 0.5;
  const shelfCount = 3;
  const shelfGap = h / shelfCount;
  const shelfMat = new THREE.MeshLambertMaterial({ map: getShelfTex() });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });

  // 4 corner posts (square tube)
  const postXs = [-w / 2 + 0.03, w / 2 - 0.03];
  const postZs = [-d / 2 + 0.03, d / 2 - 0.03];
  for (const dx of postXs) {
    for (const dz of postZs) {
      const post = boxMesh(0.03, h, 0.03, metalMat);
      post.position.set(dx, h / 2, dz);
      post.userData.sourceFile = SRC;
      group.add(post);
    }
  }

  // 3 shelves
  for (let i = 0; i < shelfCount; i++) {
    const sy = (i + 0.5) * shelfGap;
    const shelf = boxMesh(w, 0.035, d, shelfMat);
    shelf.position.set(0, sy, 0);
    shelf.userData.sourceFile = SRC;
    group.add(shelf);

    // Shelf support brackets
    for (const dx of [-w / 2 + 0.06, w / 2 - 0.06]) {
      for (const dz of [-d / 2 + 0.06, d / 2 - 0.06]) {
        const bracket = boxMesh(0.04, 0.025, 0.04, metalMat);
        bracket.position.set(dx, sy - 0.03, dz);
        bracket.userData.sourceFile = SRC;
        group.add(bracket);
      }
    }

    // Folded garments on shelf
    for (let j = 0; j < 3; j++) {
      const col = GARMENT_COLORS[(i * 3 + j) % GARMENT_COLORS.length];
      const gMat = new THREE.MeshLambertMaterial({ map: getGarmTex(col) });
      const gx = -0.6 + j * 0.6;
      const garment = boxMesh(0.3, 0.04, 0.18, gMat);
      garment.position.set(gx, sy + 0.04, 0);
      garment.userData.sourceFile = SRC;
      group.add(garment);
    }
  }

  // Top cross braces
  for (const dz of postZs) {
    const brace = boxMesh(w - 0.06, 0.03, 0.03, metalMat);
    brace.position.set(0, h - 0.02, dz);
    brace.userData.sourceFile = SRC;
    group.add(brace);
  }

  return group;
}
