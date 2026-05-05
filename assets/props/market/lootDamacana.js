// assets/props/market/lootDamacana.js — Damacana Loot Prefab
// Water jug with CanvasTexture label, translucent blue body, carry handles.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootDamacana.js';

function makeDamacanaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Blue translucent base
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, '#3388cc');
  grad.addColorStop(0.3, '#77bbee');
  grad.addColorStop(0.5, '#aaddff');
  grad.addColorStop(0.7, '#77bbee');
  grad.addColorStop(1, '#3388cc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);

  // White label band
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 70, 112, 70);

  // "SU" text
  ctx.fillStyle = '#1a5cba';
  ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SU', 64, 92);

  // "DAMACANA" small
  ctx.fillStyle = '#555555';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('DAMACANA', 64, 120);

  // Volume badge
  ctx.fillStyle = '#1a5cba';
  ctx.beginPath();
  ctx.arc(64, 185, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('19L', 64, 188);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootDamacana() {
  if (!cachedTexture) cachedTexture = makeDamacanaTexture();

  const group = new THREE.Group();
  group.name = 'LootDamacana';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Damacana';
  group.userData.lootType = 'carry_only';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'water', 'heavy'];

  const jugMat = new THREE.MeshLambertMaterial({
    map: cachedTexture,
    transparent: true,
    opacity: 0.85,
  });

  // Main jug body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.90, 16), jugMat);
  body.position.y = 0.45;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.10, 12),
    new THREE.MeshLambertMaterial({ color: 0x4499cc, transparent: true, opacity: 0.8 })
  );
  neck.position.y = 0.93;
  neck.userData.sourceFile = SRC;
  group.add(neck);

  // Cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.10, 0.06, 12),
    MAT.WHITE
  );
  cap.position.y = 0.99;
  cap.userData.sourceFile = SRC;
  group.add(cap);

  // Base ring
  const base = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.025, 8, 16),
    new THREE.MeshLambertMaterial({ color: 0x3366aa })
  );
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.02;
  base.userData.sourceFile = SRC;
  group.add(base);

  // Side handles
  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.018, 6, 8),
      MAT.METAL
    );
    handle.position.set(side * 0.29, 0.72, 0);
    handle.userData.sourceFile = SRC;
    group.add(handle);
  }

  return group;
}
