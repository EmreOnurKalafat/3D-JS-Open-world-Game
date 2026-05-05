// assets/props/market/transpalet.js — Transpalet (Manuel Forklift) Prefab
// Sarı metal gövdeli, çatallı hidrolik taşıyıcı. Ağır siper.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/transpalet.js';

export function createTranspalet() {
  const group = new THREE.Group();
  group.name = 'Transpalet';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Transpalet';

  const catalUzunluk = 1.2, catalGenislik = 0.6;

  // ── Çatallar (2 adet, yatay) ───────────────────────────────
  for (const side of [-1, 1]) {
    const catal = boxMesh(0.06, 0.04, catalUzunluk, MAT.METAL);
    catal.position.set(side * catalGenislik / 2, 0.08, catalUzunluk / 2);
    catal.userData.sourceFile = SRC;
    group.add(catal);

    // Çatal ucu tekerleği
    const teker = cylMesh(0.04, 0.04, 0.03, 8, MAT.WHEEL);
    teker.rotation.x = Math.PI / 2;
    teker.position.set(side * catalGenislik / 2, 0.04, catalUzunluk);
    teker.userData.sourceFile = SRC;
    group.add(teker);
  }

  // ── Hidrolik gövde ─────────────────────────────────────────
  const govde = boxMesh(0.3, 0.45, 0.3, MAT.METAL);
  govde.position.set(0, 0.3, 0);
  govde.userData.sourceFile = SRC;
  group.add(govde);

  // ── Direksiyon kolu ────────────────────────────────────────
  const kol = cylMesh(0.03, 0.03, 1.3, 8, MAT.DARK_METAL);
  kol.position.set(0, 0.9, -0.2);
  kol.rotation.x = 0.3;
  kol.userData.sourceFile = SRC;
  group.add(kol);

  // ── Tekerlekler (arka, büyük) ──────────────────────────────
  for (const side of [-1, 1]) {
    const teker = cylMesh(0.1, 0.1, 0.06, 12, MAT.WHEEL);
    teker.rotation.x = Math.PI / 2;
    teker.position.set(side * 0.25, 0.12, -0.1);
    teker.userData.sourceFile = SRC;
    group.add(teker);
  }

  return group;
}
