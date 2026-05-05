// assets/props/market/lootElma.js — Elma Loot Prefab
// Realistic apple with dimpled top/bottom, stem, leaf, red gradient texture.

import * as THREE from 'three';
import { MAT } from '../../resources.js';

const SRC = 'assets/props/market/lootElma.js';

function makeElmaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Red gradient sphere-like
  const grad = ctx.createRadialGradient(55, 45, 10, 64, 64, 64);
  grad.addColorStop(0, '#ff6644');
  grad.addColorStop(0.4, '#dd2222');
  grad.addColorStop(0.8, '#aa1111');
  grad.addColorStop(1, '#661111');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 60, 58, 0, Math.PI * 2);
  ctx.fill();

  // Light reflection highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(42, 42, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootElma() {
  if (!cachedTexture) cachedTexture = makeElmaTexture();

  const group = new THREE.Group();
  group.name = 'LootElma';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Elma';
  group.userData.lootType = 'health_small';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'fruit', 'health'];

  const appleMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), appleMat);
  body.scale.set(1, 0.92, 1);
  body.position.y = 0.15;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top dimple
  const dimple = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.055, 0.025, 8),
    MAT.DARK_WALL
  );
  dimple.position.y = 0.29;
  dimple.userData.sourceFile = SRC;
  group.add(dimple);

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.012, 0.09, 6),
    MAT.BARK
  );
  stem.position.set(0.005, 0.33, 0);
  stem.rotation.z = 0.25;
  stem.userData.sourceFile = SRC;
  group.add(stem);

  // Leaf
  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 6, 4),
    MAT.LEAF
  );
  leaf.scale.set(1, 0.15, 0.6);
  leaf.position.set(0.04, 0.33, 0.02);
  leaf.rotation.z = 0.6;
  leaf.userData.sourceFile = SRC;
  group.add(leaf);

  return group;
}
