// assets/props/market/lootPil.js — Pil Loot Prefab
// Battery with CanvasTexture +/- label, metallic terminals, realistic.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootPil.js';

function makePilTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 180;
  const ctx = canvas.getContext('2d');

  // Black body
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 128, 180);

  // Copper/gold band top
  ctx.fillStyle = '#c8943e';
  ctx.fillRect(0, 18, 128, 40);

  // Brand text on copper band
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POWERMAX', 64, 38);

  // "AA" battery size
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('AA', 64, 65);

  // "+" pole symbol
  ctx.fillStyle = '#ff3333';
  ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
  ctx.fillText('+', 64, 112);

  // "-" pole symbol at bottom
  ctx.fillStyle = '#3366ff';
  ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
  ctx.fillText('−', 64, 148);

  // Green "eco" band at bottom
  ctx.fillStyle = '#338844';
  ctx.fillRect(0, 166, 128, 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootPil() {
  if (!cachedTexture) cachedTexture = makePilTexture();

  const group = new THREE.Group();
  group.name = 'LootPil';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Pil';
  group.userData.lootType = 'battery';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'battery', 'utility'];

  const pilMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.28, 16), pilMat);
  body.position.y = 0.14;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Positive terminal nub
  const posNub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.045, 8),
    MAT.METAL
  );
  posNub.position.y = 0.30;
  posNub.userData.sourceFile = SRC;
  group.add(posNub);

  // Negative terminal base
  const negBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.03, 16),
    MAT.METAL
  );
  negBase.position.y = 0.015;
  negBase.userData.sourceFile = SRC;
  group.add(negBase);

  return group;
}
