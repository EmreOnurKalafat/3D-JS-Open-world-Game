// assets/props/market/lootMedkit.js — Medkit Loot Prefab
// First aid kit with CanvasTexture cross emblem, handle, latch, realistic.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootMedkit.js';

function makeMedkitTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 140;
  const ctx = canvas.getContext('2d');
  const w = 200, h = 140;

  // White case background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, w, h);

  // Red border
  ctx.fillStyle = '#dd2222';
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillRect(0, 0, 8, h);
  ctx.fillRect(w - 8, 0, 8, h);

  // Red cross in center
  ctx.fillStyle = '#dd0000';
  // Vertical
  ctx.fillRect(w / 2 - 14, h / 2 - 42, 28, 84);
  // Horizontal
  ctx.fillRect(w / 2 - 42, h / 2 - 14, 84, 28);

  // White inner cross (to create outlined cross effect)
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(w / 2 - 8, h / 2 - 36, 16, 72);
  ctx.fillRect(w / 2 - 36, h / 2 - 8, 72, 16);

  // "İLK YARDIM" text at top
  ctx.fillStyle = '#dd0000';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('İLK YARDIM', w / 2, h * 0.88);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootMedkit() {
  if (!cachedTexture) cachedTexture = makeMedkitTexture();

  const group = new THREE.Group();
  group.name = 'LootMedkit';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Medkit';
  group.userData.lootType = 'heal_full';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'medkit', 'heal'];

  const kitMat = new THREE.MeshLambertMaterial({ map: cachedTexture });

  // Main case
  const caseBox = boxMesh(0.42, 0.16, 0.32, kitMat);
  caseBox.position.y = 0.10;
  caseBox.userData.sourceFile = SRC;
  group.add(caseBox);

  // Red trim on edges
  for (const z of [-0.165, 0.165]) {
    const trim = boxMesh(0.44, 0.18, 0.02, MAT.RED_EMISSIVE);
    trim.position.set(0, 0.10, z);
    trim.userData.sourceFile = SRC;
    group.add(trim);
  }

  // Latch/clasp on front
  const latch = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.03, 0.03),
    MAT.METAL
  );
  latch.position.set(0, 0.12, 0.17);
  latch.userData.sourceFile = SRC;
  group.add(latch);

  // Handle on top
  const handleGeo = new THREE.TorusGeometry(0.12, 0.018, 6, 12, Math.PI);
  const handle = new THREE.Mesh(handleGeo, MAT.DARK_METAL);
  handle.position.set(0, 0.22, 0);
  handle.rotation.x = Math.PI / 2;
  handle.userData.sourceFile = SRC;
  group.add(handle);

  // Handle brackets (2)
  for (const x of [-0.10, 0.10]) {
    const bracket = boxMesh(0.03, 0.05, 0.04, MAT.METAL);
    bracket.position.set(x, 0.20, 0);
    bracket.userData.sourceFile = SRC;
    group.add(bracket);
  }

  return group;
}
