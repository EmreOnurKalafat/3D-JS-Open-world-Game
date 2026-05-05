// assets/props/market/posCihazi.js — POS Cihazı Prefab
// Payment terminal with screen texture, keypad, and curly cable.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/posCihazi.js';

function makePosScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 80; canvas.height = 40;
  const ctx = canvas.getContext('2d');

  // Green screen glow
  ctx.fillStyle = '#002200';
  ctx.fillRect(0, 0, 80, 40);

  // Screen content lines
  ctx.fillStyle = '#00ff44';
  ctx.font = '8px monospace';
  ctx.fillText('TUTAR:', 4, 12);
  ctx.fillText('₺124.50', 4, 24);
  ctx.fillText('ONAYLANDI', 4, 36);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

let cachedTexture = null;

export function createPosCihazi() {
  if (!cachedTexture) cachedTexture = makePosScreenTexture();

  const group = new THREE.Group();
  group.name = 'PosCihazi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'POS Cihazı';

  // Main body
  const body = boxMesh(0.18, 0.06, 0.24, MAT.DARK_METAL);
  body.position.set(0, 0.05, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Screen with green text
  const screenMat = new THREE.MeshLambertMaterial({ map: cachedTexture, emissive: 0x001100, emissiveIntensity: 0.3 });
  const screen = boxMesh(0.13, 0.015, 0.09, screenMat);
  screen.position.set(0, 0.09, 0.04);
  screen.userData.sourceFile = SRC;
  group.add(screen);

  // Keypad area (white buttons effect)
  const keypadMat = new THREE.MeshLambertMaterial({ color: 0xf8f8f8 });
  const keypad = boxMesh(0.13, 0.008, 0.07, keypadMat);
  keypad.position.set(0, 0.08, -0.05);
  keypad.userData.sourceFile = SRC;
  group.add(keypad);

  // Cable (curly)
  const cable = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.012, 6, 8, Math.PI),
    MAT.DARK_METAL
  );
  cable.position.set(0.08, 0.04, -0.14);
  cable.rotation.y = Math.PI / 2;
  cable.userData.sourceFile = SRC;
  group.add(cable);

  return group;
}
