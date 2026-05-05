// assets/props/market/lootSut.js — Sut Loot Prefab
// Milk carton with CanvasTexture label, gable top, realistic proportions.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootSut.js';

function makeSutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // White carton base
  ctx.fillStyle = '#f8f8ff';
  ctx.fillRect(0, 0, 128, 256);

  // Blue header band
  ctx.fillStyle = '#1a5cba';
  ctx.fillRect(0, 0, 128, 58);

  // Red accent stripe
  ctx.fillStyle = '#dd2222';
  ctx.fillRect(0, 56, 128, 8);

  // "SÜT" main text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SÜT', 64, 40);

  // Cow emoji
  ctx.fillStyle = '#1a3a6a';
  ctx.font = '34px "Segoe UI", Arial, sans-serif';
  ctx.fillText('🐄', 40, 124);

  // "Tam Yağlı" subtitle
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TAM YAĞLI', 64, 110);

  // Blue circle badge
  ctx.fillStyle = '#1a5cba';
  ctx.beginPath();
  ctx.arc(64, 165, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('1L', 64, 170);

  // Nutrition text
  ctx.fillStyle = '#888888';
  ctx.font = '8px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Kalsiyum kaynağı', 64, 200);
  ctx.fillText('%100 doğal', 64, 216);

  // Bottom bar
  ctx.fillStyle = '#dd2222';
  ctx.fillRect(0, 242, 128, 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootSut() {
  if (!cachedTexture) cachedTexture = makeSutTexture();

  const group = new THREE.Group();
  group.name = 'LootSut';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Süt';
  group.userData.lootType = 'health_small';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'health'];

  const cartonMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = boxMesh(0.22, 0.56, 0.22, cartonMat);
  body.position.y = 0.28;
  body.userData.sourceFile = SRC;
  group.add(body);

  const topFront = boxMesh(0.24, 0.07, 0.07, MAT.WHITE);
  topFront.position.set(0, 0.58, 0.07);
  topFront.rotation.x = -0.42;
  topFront.userData.sourceFile = SRC;
  group.add(topFront);

  const topBack = boxMesh(0.24, 0.07, 0.07, MAT.WHITE);
  topBack.position.set(0, 0.58, -0.07);
  topBack.rotation.x = 0.42;
  topBack.userData.sourceFile = SRC;
  group.add(topBack);

  for (const side of [-1, 1]) {
    const gable = boxMesh(0.07, 0.07, 0.24, MAT.WHITE);
    gable.position.set(side * 0.07, 0.58, 0);
    gable.rotation.z = side * 0.42;
    gable.userData.sourceFile = SRC;
    group.add(gable);
  }

  return group;
}
