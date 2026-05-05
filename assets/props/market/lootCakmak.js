// assets/props/market/lootCakmak.js — Cakmak Loot Prefab
// Detailed lighter with textured body, flint wheel, gas nozzle, red button.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootCakmak.js';

function makeCakmakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Metallic gradient background
  const grad = ctx.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, '#888888');
  grad.addColorStop(0.3, '#cccccc');
  grad.addColorStop(0.5, '#e8e8e8');
  grad.addColorStop(0.7, '#cccccc');
  grad.addColorStop(1, '#888888');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 128);

  // Horizontal grip lines
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  for (let y = 20; y < 100; y += 12) {
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(56, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootCakmak() {
  if (!cachedTexture) cachedTexture = makeCakmakTexture();

  const group = new THREE.Group();
  group.name = 'LootCakmak';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çakmak';
  group.userData.lootType = 'lighter';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'lighter', 'utility'];

  const texMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = boxMesh(0.13, 0.32, 0.08, texMat);
  body.position.y = 0.16;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Flint wheel (serrated cylinder)
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.05, 10),
    MAT.DARK_METAL
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, 0.33, 0);
  wheel.userData.sourceFile = SRC;
  group.add(wheel);

  // Nozzle guard
  const guard = boxMesh(0.10, 0.04, 0.05, MAT.METAL);
  guard.position.set(0, 0.36, 0.005);
  guard.userData.sourceFile = SRC;
  group.add(guard);

  // Gas nozzle tip
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.025, 6),
    MAT.DARK_METAL
  );
  nozzle.position.set(0, 0.38, 0.01);
  nozzle.userData.sourceFile = SRC;
  group.add(nozzle);

  // Red gas button
  const btn = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.025),
    new THREE.MeshLambertMaterial({ color: 0xdd2222 })
  );
  btn.position.set(0, 0.09, 0.055);
  btn.userData.sourceFile = SRC;
  group.add(btn);

  return group;
}
