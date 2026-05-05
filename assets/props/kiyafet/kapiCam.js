// assets/props/kiyafet/kapiCam.js — Glass Door (A-grade)
// Single-panel glass door with aluminum frame, push bar, CanvasTexture glass and door sign.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/kapiCam.js';

function makeGlassTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 2.2);
  const ctx = canvas.getContext('2d');

  // Clear glass with slight blue tint
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(180,210,230,0.4)');
  grad.addColorStop(0.3, 'rgba(200,225,240,0.25)');
  grad.addColorStop(0.5, 'rgba(190,220,235,0.15)');
  grad.addColorStop(0.7, 'rgba(200,225,240,0.25)');
  grad.addColorStop(1, 'rgba(180,210,230,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Reflection streak
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(size * 0.3, 0, size * 0.06, canvas.height);

  // Bottom frosted strip
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSignTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.35);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a3a5c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ÇEKİNİZ', canvas.width / 2, canvas.height / 3);
  ctx.font = 'bold 18px Arial';
  ctx.fillText('PUSH', canvas.width / 2, canvas.height * 0.7);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedGlass = null, cachedSign = null;
function getGlassTex() { if (!cachedGlass) cachedGlass = makeGlassTex(); return cachedGlass; }
function getSignTex() { if (!cachedSign) cachedSign = makeSignTex(); return cachedSign; }

export function createKapiCam() {
  const group = new THREE.Group();
  group.name = 'KapiCam';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Cam Kapı';
  group.userData.interactable = true;

  const w = 1.2, h = 2.8, d = 0.08;
  const glassMat = new THREE.MeshLambertMaterial({ map: getGlassTex(), transparent: true });
  const aluMat = new THREE.MeshLambertMaterial({ color: 0x9a9a9a });

  // Glass panel
  const glass = boxMesh(w - 0.2, h - 0.2, d - 0.04, glassMat);
  glass.position.set(0, h / 2, 0);
  glass.userData.sourceFile = SRC;
  group.add(glass);

  // Door sign
  const signMat = new THREE.MeshLambertMaterial({ map: getSignTex() });
  const sign = boxMesh(0.3, 0.06, 0.003, signMat);
  sign.position.set(0, 1.3, d / 2 - 0.01);
  sign.userData.sourceFile = SRC;
  group.add(sign);

  // Frame
  const fw = 0.07;
  const pieces = [
    [-w / 2 + fw / 2, h / 2, 0, fw, h, d],
    [w / 2 - fw / 2, h / 2, 0, fw, h, d],
    [0, h - fw / 2, 0, w, fw, d],
    [0, fw / 2, 0, w, fw, d],
  ];
  for (const [sx, sy, sz, sw, sh, sd] of pieces) {
    const frame = boxMesh(sw, sh, sd, aluMat);
    frame.position.set(sx, sy, sz);
    frame.userData.sourceFile = SRC;
    group.add(frame);
  }

  // Push bar
  const bar = cylMesh(0.022, 0.022, 0.75, 12, MAT.BAR_METAL);
  bar.position.set(w / 2 - 0.12, h * 0.5, 0.04);
  bar.rotation.z = Math.PI / 2;
  bar.userData.sourceFile = SRC;
  group.add(bar);

  // Bar brackets
  for (const dy of [-0.2, 0.2]) {
    const bracket = boxMesh(0.04, 0.03, 0.06, MAT.BAR_METAL);
    bracket.position.set(w / 2 - 0.12, h * 0.5 + dy, 0.04);
    bracket.userData.sourceFile = SRC;
    group.add(bracket);
  }

  // Hinges
  for (const hy of [0.3, h - 0.5]) {
    const hinge = boxMesh(0.03, 0.08, 0.02, MAT.DARK_METAL);
    hinge.position.set(w / 2 - fw, hy, d / 2 - 0.01);
    hinge.userData.sourceFile = SRC;
    group.add(hinge);
  }

  return group;
}
