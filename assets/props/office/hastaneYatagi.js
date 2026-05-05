// assets/props/office/hastaneYatagi.js — Hospital Bed (A-grade)
// Adjustable bed with side rails, mattress, pillow, IV pole with monitor.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/hastaneYatagi.js';

function makeMattressTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // White mattress
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, size, size);

  // Quilted pattern
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  for (let x = 0; x < size; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Button dots at intersections
  for (let x = 16; x < size; x += 32) {
    for (let y = 16; y < size; y += 32) {
      ctx.fillStyle = '#ccc';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeScreenTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, size, size);

  // Heart rate line
  ctx.strokeStyle = '#00ff44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  for (let x = 0; x < size; x += 4) {
    const y = size * 0.5 + Math.sin(x * 0.3) * 8 + ((x % 32 < 4) ? -15 : 0);
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Numbers
  ctx.fillStyle = '#00ff44';
  ctx.font = '10px monospace';
  ctx.fillText('HR:72', 4, 14);
  ctx.fillText('BP:120', 4, 28);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedMattress = null, cachedScreen = null;
function getMattressTex() {
  if (!cachedMattress) cachedMattress = makeMattressTexture();
  return cachedMattress;
}
function getScreenTex() {
  if (!cachedScreen) cachedScreen = makeScreenTexture();
  return cachedScreen;
}

export function createHastaneYatagi() {
  const group = new THREE.Group();
  group.name = 'HastaneYatagi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Hastane Yatağı';

  const frameMat = new THREE.MeshLambertMaterial({ color: 0xddd8d0 });
  const mattressMat = new THREE.MeshLambertMaterial({ map: getMattressTex() });
  const darkMetal = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });

  // Bed frame base
  const base = boxMesh(2.0, 0.08, 0.9, darkMetal);
  base.position.set(0, 0.3, 0);
  base.userData.sourceFile = SRC;
  group.add(base);

  // Frame rails
  for (const dz of [-0.42, 0.42]) {
    const rail = boxMesh(2.0, 0.05, 0.06, frameMat);
    rail.position.set(0, 0.52, dz);
    rail.userData.sourceFile = SRC;
    group.add(rail);
  }

  // Mattress
  const mattress = boxMesh(1.9, 0.14, 0.8, mattressMat);
  mattress.position.set(0, 0.6, 0);
  mattress.userData.sourceFile = SRC;
  group.add(mattress);

  // Pillow
  const pillowMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });
  const pillow = boxMesh(0.55, 0.08, 0.5, pillowMat);
  pillow.position.set(0.7, 0.65, 0);
  pillow.userData.sourceFile = SRC;
  group.add(pillow);

  // Headboard
  const hb = boxMesh(0.05, 0.65, 0.82, frameMat);
  hb.position.set(0.88, 0.78, 0);
  hb.userData.sourceFile = SRC;
  group.add(hb);

  // Foot board
  const fb = boxMesh(0.04, 0.4, 0.82, frameMat);
  fb.position.set(-0.88, 0.5, 0);
  fb.userData.sourceFile = SRC;
  group.add(fb);

  // Side rails (fold-down type)
  for (const dz of [-0.38, 0.38]) {
    const sideRail = boxMesh(1.2, 0.04, 0.04, chromeMat);
    sideRail.position.set(0, 0.7, dz);
    sideRail.userData.sourceFile = SRC;
    group.add(sideRail);
    for (const dx of [-0.4, 0, 0.4]) {
      const vert = cylMesh(0.015, 0.015, 0.18, 8, chromeMat);
      vert.position.set(dx, 0.61, dz);
      vert.userData.sourceFile = SRC;
      group.add(vert);
    }
  }

  // 4 wheels/casters
  const wheelOffs = [[-0.8, -0.4], [-0.8, 0.4], [0.8, -0.4], [0.8, 0.4]];
  for (const [dx, dz] of wheelOffs) {
    const caster = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 8, 8), darkMetal);
    caster.rotation.x = Math.PI / 2;
    caster.position.set(dx, 0.08, dz);
    caster.userData.sourceFile = SRC;
    group.add(caster);

    const stem = cylMesh(0.02, 0.02, 0.06, 8, chromeMat);
    stem.position.set(dx, 0.06, dz);
    stem.userData.sourceFile = SRC;
    group.add(stem);
  }

  // IV pole
  const ivPole = cylMesh(0.025, 0.025, 1.3, 8, chromeMat);
  ivPole.position.set(0.9, 0.65, -0.5);
  ivPole.userData.sourceFile = SRC;
  group.add(ivPole);

  // IV bag (small box)
  const bagMat = new THREE.MeshLambertMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.7 });
  const bag = boxMesh(0.15, 0.2, 0.04, bagMat);
  bag.position.set(0.9, 1.05, -0.5);
  bag.userData.sourceFile = SRC;
  group.add(bag);

  // IV monitor
  const screenMat = new THREE.MeshLambertMaterial({ map: getScreenTex() });
  const monitor = boxMesh(0.22, 0.16, 0.06, darkMetal);
  monitor.position.set(0.9, 1.4, -0.5);
  monitor.userData.sourceFile = SRC;
  group.add(monitor);

  // Screen face
  const screen = boxMesh(0.18, 0.12, 0.005, screenMat);
  screen.position.set(0.9, 1.4, -0.53);
  screen.userData.sourceFile = SRC;
  group.add(screen);

  return group;
}
