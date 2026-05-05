// assets/props/market/turnike.js — Turnike Prefab
// Metal govde + 3 yatay doner cubuk. Tek yonlu gecis kontrolu.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/turnike.js';

export function createTurnike() {
  const group = new THREE.Group();
  group.name = 'Turnike';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Turnike';
  group.userData.hinged = true;

  const govdeH = 1.0;

  // ── Merkez dikme ───────────────────────────────────────────
  const direk = cylMesh(0.06, 0.06, govdeH, 12, MAT.METAL);
  direk.position.set(0, govdeH / 2, 0);
  direk.userData.sourceFile = SRC;
  group.add(direk);

  // ── 3 yatay çubuk (120° aralıklı) ──────────────────────────
  const cubukUzunluk = 0.55;
  for (let i = 0; i < 3; i++) {
    const aci = (i / 3) * Math.PI * 2;
    const cubuk = cylMesh(0.025, 0.025, cubukUzunluk, 8, MAT.METAL);
    cubuk.rotation.z = Math.PI / 2;
    cubuk.position.set(
      Math.cos(aci) * cubukUzunluk / 2,
      govdeH * 0.55,
      Math.sin(aci) * cubukUzunluk / 2,
    );
    cubuk.userData.sourceFile = SRC;
    group.add(cubuk);
  }

  // ── Taban plakasi ──────────────────────────────────────────
  const taban = boxMesh(0.25, 0.05, 0.25, MAT.DARK_METAL);
  taban.position.set(0, 0.03, 0);
  taban.userData.sourceFile = SRC;
  group.add(taban);

  // ── Yan bariyer dikmeleri ──────────────────────────────────
  for (const side of [-1, 1]) {
    const bariyer = cylMesh(0.04, 0.04, govdeH * 0.8, 8, MAT.METAL);
    bariyer.position.set(side * 0.4, govdeH * 0.4, 0);
    bariyer.userData.sourceFile = SRC;
    group.add(bariyer);

    const bTaban = boxMesh(0.12, 0.04, 0.12, MAT.DARK_METAL);
    bTaban.position.set(side * 0.4, 0.02, 0);
    bTaban.userData.sourceFile = SRC;
    group.add(bTaban);
  }

  return group;
}
