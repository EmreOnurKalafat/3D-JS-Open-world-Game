// assets/props/market/lootKonserve.js — Konserve Loot Prefab
// Canned food with CanvasTexture label, pull tab, metallic body.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootKonserve.js';

function makeKonserveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Green label background
  ctx.fillStyle = '#2d7d3a';
  ctx.fillRect(0, 0, 256, 160);

  // Gold top and bottom borders
  ctx.fillStyle = '#d4a843';
  ctx.fillRect(0, 0, 256, 16);
  ctx.fillRect(0, 144, 256, 16);

  // "KONSERVE" text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KONSERVE', 128, 48);

  // Vegetable illustration
  ctx.fillStyle = '#ff8833';
  ctx.beginPath();
  ctx.arc(80, 88, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#33aa44';
  ctx.beginPath();
  ctx.ellipse(128, 92, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dd3333';
  ctx.beginPath();
  ctx.arc(172, 86, 13, 0, Math.PI * 2);
  ctx.fill();

  // Leaves on top
  ctx.fillStyle = '#228833';
  ctx.beginPath();
  ctx.ellipse(108, 76, 10, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(148, 78, 9, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Net weight
  ctx.fillStyle = '#d4a843';
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('NET: 400g', 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

let cachedTexture = null;

export function createLootKonserve() {
  if (!cachedTexture) cachedTexture = makeKonserveTexture();

  const group = new THREE.Group();
  group.name = 'LootKonserve';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Konserve';
  group.userData.lootType = 'health_medium';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'canned'];

  // Can body with texture label
  const labelMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.38, 16), labelMat);
  body.position.y = 0.19;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top rim
  const topRim = cylMesh(0.135, 0.135, 0.025, 16, MAT.METAL);
  topRim.position.y = 0.39;
  topRim.userData.sourceFile = SRC;
  group.add(topRim);

  // Pull tab
  const tab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.015, 8),
    MAT.METAL
  );
  tab.position.set(0.04, 0.40, 0);
  tab.userData.sourceFile = SRC;
  group.add(tab);

  // Bottom rim
  const botRim = cylMesh(0.135, 0.135, 0.025, 16, MAT.DARK_METAL);
  botRim.position.y = 0.01;
  botRim.userData.sourceFile = SRC;
  group.add(botRim);

  return group;
}
