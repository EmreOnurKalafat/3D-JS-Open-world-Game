// assets/props/market/dondurucuCamli.js — Dondurucu (Camlı) Prefab
// Glass-lid freezer with frosted texture, product visibility, metal body.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/dondurucuCamli.js';

function makeFrozenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Frost pattern
  ctx.fillStyle = '#e8f0ff';
  ctx.fillRect(0, 0, 128, 32);
  ctx.fillStyle = 'rgba(200,220,255,0.5)';
  ctx.fillRect(8, 4, 24, 24);
  ctx.fillStyle = 'rgba(180,210,250,0.4)';
  ctx.fillRect(50, 6, 28, 20);
  ctx.fillStyle = 'rgba(190,215,250,0.45)';
  ctx.fillRect(96, 5, 22, 22);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createDondurucuCamli() {
  if (!cachedTexture) cachedTexture = makeFrozenTexture();

  const group = new THREE.Group();
  group.name = 'DondurucuCamli';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Dondurucu (Camlı)';
  group.userData.tags = ['freezer', 'appliance'];

  const w = 1.1, h = 2.15, d = 0.80;

  // Body
  const body = boxMesh(w, h, d, MAT.WHITE);
  body.position.set(0, h / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Frosted glass lid
  const glassMat = new THREE.MeshLambertMaterial({
    map: cachedTexture,
    transparent: true,
    opacity: 0.5,
  });
  const lid = boxMesh(w - 0.05, 0.04, d - 0.05, glassMat);
  lid.position.set(0, h + 0.02, -d * 0.1);
  lid.rotation.x = -0.4;
  lid.userData.sourceFile = SRC;
  group.add(lid);

  // Metal trim around body
  const topTrim = boxMesh(w + 0.04, 0.04, d + 0.04, MAT.METAL);
  topTrim.position.set(0, h, 0);
  topTrim.userData.sourceFile = SRC;
  group.add(topTrim);

  const botTrim = boxMesh(w + 0.04, 0.04, d + 0.04, MAT.METAL);
  botTrim.position.set(0, 0.02, 0);
  botTrim.userData.sourceFile = SRC;
  group.add(botTrim);

  // Handle on lid
  const handle = boxMesh(0.50, 0.025, 0.04, MAT.METAL);
  handle.position.set(0, h + 0.06, -d * 0.2);
  handle.userData.sourceFile = SRC;
  group.add(handle);

  return group;
}
