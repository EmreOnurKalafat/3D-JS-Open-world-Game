// assets/props/kiyafet/giysiAskisi.js — Clothes Hanger (A-grade)
// Wire hanger with CanvasTexture garment, metal hook, realistic fabric folds.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/giysiAskisi.js';

const COLORS = ['#cc3333', '#3366aa', '#2c3e50', '#d4c8a8', '#339955', '#222222'];

function makeGarmentTex(hex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 1.3);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shoulder/neckline shape
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.moveTo(0, 40); ctx.lineTo(size / 2, 0); ctx.lineTo(size, 40);
  ctx.fill();

  // Fold lines
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
    const fx = 10 + (i / 5) * (size - 20);
    ctx.fillRect(fx, 30, 2, canvas.height - 30);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedTexes = {};
function getTex(hex) { if (!cachedTexes[hex]) cachedTexes[hex] = makeGarmentTex(hex); return cachedTexes[hex]; }

export function createGiysiAskisi(colorIndex = 0) {
  const group = new THREE.Group();
  group.name = 'GiysiAskisi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Giysi Askısı';

  const color = COLORS[colorIndex % COLORS.length];
  const wireMat = MAT.PIPE_METAL;
  const gTex = getTex(color);
  const gMat = new THREE.MeshLambertMaterial({ map: gTex });

  // Hook (curved wire on top)
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.010, 6, 8, Math.PI),
    wireMat
  );
  hook.position.set(0, 0.14, 0);
  hook.rotation.z = Math.PI;
  hook.userData.sourceFile = SRC;
  group.add(hook);

  const hookStem = cylMesh(0.01, 0.01, 0.06, 8, wireMat);
  hookStem.position.set(0, 0.08, 0);
  hookStem.userData.sourceFile = SRC;
  group.add(hookStem);

  // Shoulder bar (angled V)
  const shoulderBar = cylMesh(0.011, 0.011, 0.2, 8, wireMat);
  shoulderBar.position.set(0, 0, 0);
  shoulderBar.rotation.z = Math.PI / 2;
  shoulderBar.userData.sourceFile = SRC;
  group.add(shoulderBar);

  // Left & Right angled arms (wire)
  for (const [dx, angle] of [[-0.06, -0.35], [0.06, 0.35]]) {
    const arm = cylMesh(0.01, 0.01, 0.16, 6, wireMat);
    arm.position.set(dx, -0.06, 0);
    arm.rotation.z = angle;
    arm.userData.sourceFile = SRC;
    group.add(arm);
  }

  // Bottom cross wire
  const crossWire = cylMesh(0.008, 0.008, 0.14, 6, wireMat);
  crossWire.position.set(0, -0.16, 0);
  crossWire.rotation.z = Math.PI / 2;
  crossWire.userData.sourceFile = SRC;
  group.add(crossWire);

  // Garment draped on hanger
  const garment = boxMesh(0.17, 0.28, 0.02, gMat);
  garment.position.set(0, -0.16, 0);
  garment.userData.sourceFile = SRC;
  group.add(garment);

  // Sleeves
  for (const dx of [-0.1, 0.1]) {
    const sleeve = boxMesh(0.06, 0.14, 0.02, gMat);
    sleeve.position.set(dx, -0.14, 0);
    sleeve.userData.sourceFile = SRC;
    group.add(sleeve);
  }

  return group;
}
