// assets/props/outdoor/jenerator.js — Industrial Generator (A-grade)
// Diesel generator with CanvasTexture metal body, control panel, exhaust, fuel tank.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/jenerator.js';

function makeGenMetalTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#4a5a3a';
  ctx.fillRect(0, 0, size, size);

  // Rivets
  for (let i = 0; i < 20; i++) {
    const rx = (i / 20) * size;
    ctx.fillStyle = 'rgba(30,40,20,0.3)';
    ctx.beginPath();
    ctx.arc(rx, 15, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(rx, size - 15, 2, 0, Math.PI * 2); ctx.fill();
  }

  // Wear marks
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = `rgba(80,90,60,${0.1 + Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 10 + Math.random() * 30, 4 + Math.random() * 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeControlPanelTex() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.7);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gauges
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(16, 18, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(48, 18, 10, 0, Math.PI * 2); ctx.fill();

  // Needles
  ctx.strokeStyle = '#ff3333';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(16, 18); ctx.lineTo(10, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(48, 18); ctx.lineTo(42, 14); ctx.stroke();

  // Status LEDs
  ctx.fillStyle = '#00ff00';
  ctx.beginPath(); ctx.arc(16, 36, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath(); ctx.arc(32, 36, 2, 0, Math.PI * 2); ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedMetal = null, cachedPanel = null;
function getMetalTex() { if (!cachedMetal) cachedMetal = makeGenMetalTex(); return cachedMetal; }
function getPanelTex() { if (!cachedPanel) cachedPanel = makeControlPanelTex(); return cachedPanel; }

export function createJenerator() {
  const group = new THREE.Group();
  group.name = 'Jenerator';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Jeneratör';

  const bodyMat = new THREE.MeshLambertMaterial({ map: getMetalTex() });
  const panelMat = new THREE.MeshLambertMaterial({ map: getPanelTex() });
  const darkMat = MAT.DARK_METAL;
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x3a3a2a });

  // Main body
  const body = boxMesh(2.5, 1.3, 1.5, bodyMat);
  body.position.set(0, 0.75, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Skid base frame
  for (const dz of [-0.7, 0.7]) {
    const skid = boxMesh(2.6, 0.06, 0.08, frameMat);
    skid.position.set(0, 0.05, dz);
    skid.userData.sourceFile = SRC;
    group.add(skid);
  }

  // Top cover/hatch
  const cover = boxMesh(2.5, 0.06, 1.5, darkMat);
  cover.position.set(0, 1.42, 0);
  cover.userData.sourceFile = SRC;
  group.add(cover);

  // Ventilation louvers
  for (let i = 0; i < 5; i++) {
    const louver = boxMesh(2.3, 0.04, 0.05, frameMat);
    louver.position.set(0, 0.45 + i * 0.22, 0.78);
    louver.userData.sourceFile = SRC;
    group.add(louver);
  }

  // Control panel
  const panel = boxMesh(0.4, 0.3, 0.02, panelMat);
  panel.position.set(0.6, 0.9, 0.76);
  panel.userData.sourceFile = SRC;
  group.add(panel);

  // Exhaust pipe
  const exhaust = cylMesh(0.04, 0.04, 0.6, 8, MAT.PIPE_METAL);
  exhaust.position.set(-0.8, 1.55, 0.3);
  exhaust.userData.sourceFile = SRC;
  group.add(exhaust);

  // Muffler
  const muffler = cylMesh(0.08, 0.08, 0.4, 8, darkMat);
  muffler.position.set(-0.8, 1.8, 0.3);
  muffler.rotation.z = Math.PI / 2;
  muffler.userData.sourceFile = SRC;
  group.add(muffler);

  // Fuel cap
  const cap = cylMesh(0.05, 0.05, 0.06, 8, MAT.BAR_METAL);
  cap.position.set(0.5, 1.4, 0.3);
  cap.userData.sourceFile = SRC;
  group.add(cap);

  // Lifting eyes
  for (const dx of [-1.0, 1.0]) {
    for (const dz of [-0.4, 0.4]) {
      const eye = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 6, 8), darkMat);
      eye.position.set(dx, 1.43, dz);
      eye.userData.sourceFile = SRC;
      group.add(eye);
    }
  }

  return group;
}
