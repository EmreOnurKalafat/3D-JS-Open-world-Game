// assets/props/market/lootCips.js — Cips Loot Prefab
// Chip bag with CanvasTexture brand label, crimped top seal.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootCips.js';

function makeCipsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 300;
  const ctx = canvas.getContext('2d');
  const w = 200, h = 300;

  // Red bag base
  ctx.fillStyle = '#dc143c';
  ctx.fillRect(0, 0, w, h);

  // Yellow burst
  ctx.fillStyle = '#ffb800';
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.42, w * 0.4, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // "CIPS" text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CIPS', w / 2, h * 0.35);

  // Chip icon (simple circle shapes)
  ctx.fillStyle = '#ffdd44';
  for (let i = 0; i < 5; i++) {
    const cx = w * 0.35 + i * w * 0.1;
    const cy = h * 0.52 + Math.sin(i * 1.3) * 18;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 10, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // "PATATES" subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('PATATES', w / 2, h * 0.58);

  // Weight
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('150g', w / 2, h * 0.68);

  // Decorative lines
  ctx.strokeStyle = '#ffdd44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.78);
  ctx.lineTo(w * 0.85, h * 0.78);
  ctx.moveTo(w * 0.25, h * 0.84);
  ctx.lineTo(w * 0.75, h * 0.84);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootCips() {
  if (!cachedTexture) cachedTexture = makeCipsTexture();

  const group = new THREE.Group();
  group.name = 'LootCips';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Cips';
  group.userData.lootType = 'health_small';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'snack'];

  const bagMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const bag = boxMesh(0.36, 0.52, 0.10, bagMat);
  bag.position.y = 0.26;
  bag.userData.sourceFile = SRC;
  group.add(bag);

  // Crimped top seal
  const seal = boxMesh(0.38, 0.04, 0.12, MAT.DARK_METAL);
  seal.position.y = 0.53;
  seal.userData.sourceFile = SRC;
  group.add(seal);

  // Bottom bulge
  const bulge = boxMesh(0.36, 0.04, 0.12, MAT.DARK_METAL);
  bulge.position.y = 0.02;
  bulge.userData.sourceFile = SRC;
  group.add(bulge);

  return group;
}
