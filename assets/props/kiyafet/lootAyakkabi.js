// assets/props/kiyafet/lootAyakkabi.js — Loot: Ayakkabi Prefab
// Pair of sneaker-style shoes with soles, body, laces, and colored accents.

import * as THREE from 'three';
import { GEO, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/lootAyakkabi.js';

/** Build one shoe at origin, toe pointing +z */
function buildShoe(baseColor = 0xffffff, accentColor = 0x3366aa) {
  const shoe = new THREE.Group();

  const soleMat   = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const bodyMat   = new THREE.MeshLambertMaterial({ color: baseColor });
  const accentMat = new THREE.MeshLambertMaterial({ color: accentColor });
  const whiteMat  = new THREE.MeshLambertMaterial({ color: 0xffffff });

  // ── Sole (main + heel) ──────────────────
  const sole = boxMesh(0.28, 0.04, 0.42, soleMat);
  sole.position.set(0, 0.02, 0);
  sole.userData.sourceFile = SRC;
  shoe.add(sole);

  // Heel block (slightly raised)
  const heel = boxMesh(0.26, 0.06, 0.10, soleMat);
  heel.position.set(0, 0.04, -0.16);
  heel.userData.sourceFile = SRC;
  shoe.add(heel);

  // ── Toe cap ──────────────────────────────
  const toeCap = boxMesh(0.24, 0.05, 0.08, whiteMat);
  toeCap.position.set(0, 0.06, 0.17);
  toeCap.rotation.x = -0.15;
  toeCap.userData.sourceFile = SRC;
  shoe.add(toeCap);

  // ── Shoe body (upper) ────────────────────
  const upper = boxMesh(0.22, 0.10, 0.28, bodyMat);
  upper.position.set(0, 0.11, -0.02);
  upper.userData.sourceFile = SRC;
  shoe.add(upper);

  // ── Tongue ───────────────────────────────
  const tongue = boxMesh(0.08, 0.09, 0.06, bodyMat);
  tongue.position.set(0, 0.14, 0.03);
  tongue.rotation.x = 0.25;
  tongue.userData.sourceFile = SRC;
  shoe.add(tongue);

  // ── Heel counter ─────────────────────────
  const heelCounter = boxMesh(0.20, 0.06, 0.08, accentMat);
  heelCounter.position.set(0, 0.12, -0.14);
  heelCounter.userData.sourceFile = SRC;
  shoe.add(heelCounter);

  // ── Laces (3 small crossed bars) ─────────
  for (let z = -0.03; z <= 0.07; z += 0.05) {
    const laceBar = boxMesh(0.14, 0.02, 0.02, whiteMat);
    laceBar.position.set(0, 0.17, z);
    laceBar.userData.sourceFile = SRC;
    shoe.add(laceBar);
  }

  // ── Accent stripe (side) ─────────────────
  for (const side of [-1, 1]) {
    const stripe = boxMesh(0.03, 0.025, 0.20, accentMat);
    stripe.position.set(side * 0.11, 0.07, -0.02);
    stripe.userData.sourceFile = SRC;
    shoe.add(stripe);
  }

  // ── Collar padding ───────────────────────
  const collar = boxMesh(0.16, 0.04, 0.06, accentMat);
  collar.position.set(0, 0.17, -0.10);
  collar.rotation.x = 0.1;
  collar.userData.sourceFile = SRC;
  shoe.add(collar);

  return shoe;
}

export function createLootAyakkabi() {
  const group = new THREE.Group();
  group.name = 'LootAyakkabi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ayakkabi (Loot)';
  group.userData.lootType = 'clothing';
  group.userData.isInteractable = true;
  group.userData.tags = ['loot', 'shoes', 'clothing'];

  // Left shoe
  const left = buildShoe(0xffffff, 0x3366aa);
  left.position.set(-0.16, 0, 0);
  left.userData.sourceFile = SRC;
  group.add(left);

  // Right shoe
  const right = buildShoe(0xffffff, 0xcc3333);
  right.position.set(0.16, 0, 0);
  right.userData.sourceFile = SRC;
  group.add(right);

  return group;
}
