// assets/props/market/yazarkasa.js — Yazarkasa (Cash Register) Prefab
// Gri gövde + yeşil emissive ekran. Etkileşimli obje.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/yazarkasa.js';

export function createYazarkasa() {
  const group = new THREE.Group();
  group.name = 'Yazarkasa';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Yazarkasa';
  group.userData.interactable = true;
  group.userData.interactLabel = '[E] Kasayı Aç';

  // ── Ana gövde ──────────────────────────────────────────────
  const govde = boxMesh(0.5, 0.25, 0.35, MAT.FURNITURE_TRIM);
  govde.position.set(0, 0.2, 0);
  govde.userData.sourceFile = SRC;
  group.add(govde);

  // ── Ekran / display panel (yeşil emissive) ──────────────────
  const ekran = boxMesh(0.35, 0.08, 0.02, MAT.MONITOR_EMISSIVE);
  ekran.position.set(0, 0.35, 0.18);
  ekran.userData.sourceFile = SRC;
  group.add(ekran);

  // Yeşil ekran vurgusu
  const ekranGlow = boxMesh(0.25, 0.03, 0.005, MAT.SCREEN_DARK);
  ekranGlow.position.set(0, 0.35, 0.20);
  ekranGlow.userData.sourceFile = SRC;
  group.add(ekranGlow);

  // ── Tuş takımı ─────────────────────────────────────────────
  const tusTakimi = boxMesh(0.4, 0.03, 0.15, MAT.DARK_METAL);
  tusTakimi.position.set(0, 0.15, 0.18);
  tusTakimi.userData.sourceFile = SRC;
  group.add(tusTakimi);

  // Tuş detayları
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const tus = boxMesh(0.04, 0.01, 0.04, MAT.WHITE);
      tus.position.set(-0.12 + c * 0.08, 0.17, 0.16);
      tus.userData.sourceFile = SRC;
      group.add(tus);
    }
  }

  // ── Yazıcı / fiş çıkışı ────────────────────────────────────
  const fisYuvasi = boxMesh(0.15, 0.04, 0.08, MAT.DARK_METAL);
  fisYuvasi.position.set(0, 0.33, 0.19);
  fisYuvasi.userData.sourceFile = SRC;
  group.add(fisYuvasi);

  return group;
}
