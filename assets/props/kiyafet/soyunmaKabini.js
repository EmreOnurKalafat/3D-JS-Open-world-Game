// assets/props/kiyafet/soyunmaKabini.js — Fitting Room (A-grade)
// Full changing room with CanvasTexture wood walls, curtain, mirror, and door.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/soyunmaKabini.js';

function makeWoodPanelTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#9b7653';
  ctx.fillRect(0, 0, size, size);

  // Vertical plank lines
  for (let x = 0; x < size; x += 32) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath(); ctx.moveTo(x + 1, 0); ctx.lineTo(x + 1, size); ctx.stroke();
  }

  // Wood grain
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(60,30,10,${0.05 + Math.random() * 0.1})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 15) {
      ctx.lineTo(x, y + Math.sin(x * 0.03) * 3);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeCurtainTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 2);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c4a882';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Curtain folds (vertical stripes)
  for (let x = 0; x < canvas.width; x += 8) {
    const alpha = 0.03 + Math.abs(Math.sin(x * 0.3)) * 0.1;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, 0, 4, canvas.height);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
    ctx.fillRect(x + 4, 0, 2, canvas.height);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeMirrorSmallTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 1.3);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#d0dce8');
  grad.addColorStop(0.4, '#e0eaf0');
  grad.addColorStop(0.6, '#c8d8e4');
  grad.addColorStop(1, '#d4e0e8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(20, 0, 30, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cacheWood = null, cacheCurtain = null, cacheMirrorS = null;
function getWoodTex() { if (!cacheWood) cacheWood = makeWoodPanelTex(); return cacheWood; }
function getCurtainTex() { if (!cacheCurtain) cacheCurtain = makeCurtainTex(); return cacheCurtain; }
function getMirrorSTex() { if (!cacheMirrorS) cacheMirrorS = makeMirrorSmallTex(); return cacheMirrorS; }

export function createSoyunmaKabini() {
  const group = new THREE.Group();
  group.name = 'SoyunmaKabini';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Soyunma Kabini';
  group.userData.interactable = true;

  const w = 1.2, h = 2.2, d = 1.2;
  const wallT = 0.03;
  const woodMat = new THREE.MeshLambertMaterial({ map: getWoodTex() });
  const curtainMat = new THREE.MeshLambertMaterial({ map: getCurtainTex() });
  const mirrorMat = new THREE.MeshLambertMaterial({ map: getMirrorSTex() });
  const metalTrim = new THREE.MeshLambertMaterial({ color: 0x5a5a5a });

  // 3 walls (back, left, right)
  const backWall = boxMesh(w, h, wallT, woodMat);
  backWall.position.set(0, h / 2, d / 2 - wallT / 2);
  backWall.userData.sourceFile = SRC;
  group.add(backWall);

  const leftWall = boxMesh(wallT, h, d, woodMat);
  leftWall.position.set(-w / 2 + wallT / 2, h / 2, 0);
  leftWall.userData.sourceFile = SRC;
  group.add(leftWall);

  const rightWall = boxMesh(wallT, h, d, woodMat);
  rightWall.position.set(w / 2 - wallT / 2, h / 2, 0);
  rightWall.userData.sourceFile = SRC;
  group.add(rightWall);

  // Interior mirror on back wall
  const mirror = boxMesh(0.4, 0.7, 0.008, mirrorMat);
  mirror.position.set(0, 1.3, d / 2 - wallT - 0.005);
  mirror.userData.sourceFile = SRC;
  group.add(mirror);

  // Mirror frame
  const mfw = 0.025;
  for (const [mx, my, mw, mh] of [
    [0, 1.65, 0.4, mfw], [0, 0.95, 0.4, mfw],
    [-0.21, 1.3, mfw, 0.7], [0.21, 1.3, mfw, 0.7]
  ]) {
    const mp = boxMesh(mw, mh, 0.01, metalTrim);
    mp.position.set(mx, my, d / 2 - wallT);
    mp.userData.sourceFile = SRC;
    group.add(mp);
  }

  // Curtain rod (above door opening)
  const rodDia = 0.02;
  const rod = cylMesh(rodDia, rodDia, w - 0.1, 8, MAT.BAR_METAL);
  rod.position.set(0, h - 0.05, -d / 2);
  rod.rotation.z = Math.PI / 2;
  rod.userData.sourceFile = SRC;
  group.add(rod);

  // Rod brackets
  for (const dx of [-0.4, 0.4]) {
    const rb = boxMesh(0.03, 0.04, 0.05, MAT.BAR_METAL);
    rb.position.set(dx, h - 0.03, -d / 2 + wallT);
    rb.userData.sourceFile = SRC;
    group.add(rb);
  }

  // Curtain (split, pushed to sides)
  for (const dx of [-0.35, 0.35]) {
    const curtain = boxMesh(0.35, h - 0.15, 0.02, curtainMat);
    curtain.position.set(dx, h / 2 - 0.05, -d / 2 + wallT);
    curtain.userData.sourceFile = SRC;
    group.add(curtain);
  }

  // Curtain rings (decorative)
  for (let i = 0; i < 5; i++) {
    const cx = -0.4 + i * 0.2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 8), MAT.DARK_METAL);
    ring.position.set(cx, h - 0.05, -d / 2);
    ring.userData.sourceFile = SRC;
    group.add(ring);
  }

  // Top trim molding
  const topTrim = boxMesh(w, 0.04, d, metalTrim);
  topTrim.position.set(0, h - 0.02, 0);
  topTrim.userData.sourceFile = SRC;
  group.add(topTrim);

  // Floor threshold
  const threshold = boxMesh(w, 0.02, 0.08, metalTrim);
  threshold.position.set(0, 0.01, -d / 2);
  threshold.userData.sourceFile = SRC;
  group.add(threshold);

  // Clothes hook on side wall
  const hook = boxMesh(0.04, 0.03, 0.06, MAT.BAR_METAL);
  hook.position.set(w / 2 - wallT - 0.01, 1.7, 0.3);
  hook.userData.sourceFile = SRC;
  group.add(hook);

  return group;
}
