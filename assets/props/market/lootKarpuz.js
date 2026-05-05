// assets/props/market/lootKarpuz.js — Karpuz Loot Prefab
// Half watermelon slice with red flesh, green rind, dark seeds.

import * as THREE from 'three';
import { MAT } from '../../resources.js';

const SRC = 'assets/props/market/lootKarpuz.js';

function makeKarpuzTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Green rind base
  const grad = ctx.createRadialGradient(50, 40, 10, 64, 64, 72);
  grad.addColorStop(0, '#88dd66');
  grad.addColorStop(0.65, '#44aa33');
  grad.addColorStop(0.85, '#228822');
  grad.addColorStop(1, '#115511');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 60, 60, 0, Math.PI * 2);
  ctx.fill();

  // Dark stripes
  ctx.strokeStyle = '#115522';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const cx = 64 + Math.cos(angle) * 20;
    const cy = 60 + Math.sin(angle) * 20;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 30);
    ctx.quadraticCurveTo(cx, cy, cx + 6, cy + 28);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedTexture = null;

export function createLootKarpuz() {
  if (!cachedTexture) cachedTexture = makeKarpuzTexture();

  const group = new THREE.Group();
  group.name = 'LootKarpuz';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Karpuz';
  group.userData.lootType = 'health_large';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'fruit', 'health'];

  // Green outer sphere (half)
  const rindMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const rind = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), rindMat);
  rind.position.y = 0.01;
  rind.userData.sourceFile = SRC;
  group.add(rind);

  // Red flesh (flat top face)
  const fleshMat = new THREE.MeshLambertMaterial({ color: 0xee3333 });
  const flesh = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 16), fleshMat);
  flesh.position.y = 0.01;
  flesh.userData.sourceFile = SRC;
  group.add(flesh);

  // White rind ring between green and red
  const whiteRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.02, 6, 16),
    new THREE.MeshLambertMaterial({ color: 0xeeffee })
  );
  whiteRing.rotation.x = Math.PI / 2;
  whiteRing.position.y = 0.05;
  whiteRing.userData.sourceFile = SRC;
  group.add(whiteRing);

  // Seeds (small dark ovals)
  const seedGeo = new THREE.SphereGeometry(0.02, 6, 4);
  const seedMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const seedPositions = [
    [0.08, 0.10], [-0.06, 0.12], [0.12, 0.15],
    [-0.10, 0.08], [0.0, 0.16], [-0.14, 0.13],
    [0.16, 0.11], [-0.03, 0.07],
  ];
  for (const [sx, sz] of seedPositions) {
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.scale.set(1, 0.3, 1.8);
    seed.position.set(sx, 0.055, sz);
    seed.rotation.z = Math.random() * Math.PI;
    seed.userData.sourceFile = SRC;
    group.add(seed);
  }

  return group;
}
