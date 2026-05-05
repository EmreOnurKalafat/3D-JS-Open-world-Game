// assets/props/market/lootMuz.js — Muz Loot Prefab
// Curved banana with yellow gradient texture, stem, and brown tip.

import * as THREE from 'three';
import { MAT } from '../../resources.js';

const SRC = 'assets/props/market/lootMuz.js';

function makeMuzTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 16, 64, 112);
  grad.addColorStop(0, '#ffee44');
  grad.addColorStop(0.3, '#ffdd00');
  grad.addColorStop(0.6, '#ffcc00');
  grad.addColorStop(1, '#ddaa00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootMuz() {
  if (!cachedTexture) cachedTexture = makeMuzTexture();

  const group = new THREE.Group();
  group.name = 'LootMuz';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Muz';
  group.userData.lootType = 'banana_trap';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'food', 'fruit', 'trap'];

  // Banana body — bent cylinder
  const bananaMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.14, 0, 0),
    new THREE.Vector3(-0.14, 0.05, 0.04),
    new THREE.Vector3(0.14, 0.05, 0.04),
    new THREE.Vector3(0.14, 0, 0)
  );
  const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.045, 8, false);
  const body = new THREE.Mesh(tubeGeo, bananaMat);
  body.position.y = 0.10;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Stem (brown)
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 0.06, 6),
    MAT.WOOD
  );
  stem.position.set(-0.16, 0.10, 0);
  stem.rotation.z = -0.3;
  stem.userData.sourceFile = SRC;
  group.add(stem);

  // Brown tip
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.025, 0.05, 6),
    MAT.BARK
  );
  tip.position.set(0.16, 0.10, 0);
  tip.rotation.z = 0.3;
  tip.userData.sourceFile = SRC;
  group.add(tip);

  return group;
}
