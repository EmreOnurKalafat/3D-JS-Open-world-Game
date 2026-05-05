// assets/props/market/yanginSondurucu.js — Yangın Söndürücü Prefab
// Kırmızı tüp + siyah hortum. Vurulduğunda duman çıkarır.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/yanginSondurucu.js';

export function createYanginSondurucu() {
  const group = new THREE.Group();
  group.name = 'YanginSondurucu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Yangın Söndürücü';
  group.userData.breakable = true;

  const bodyH = 0.55, bodyR = 0.1;

  // ── Ana tüp ────────────────────────────────────────────────
  const tup = cylMesh(bodyR, bodyR, bodyH, 12, MAT.RED_EMISSIVE);
  tup.position.set(0, bodyH / 2, 0);
  tup.userData.sourceFile = SRC;
  group.add(tup);

  // ── Tüp alt / üst kapak ────────────────────────────────────
  const altKapak = cylMesh(bodyR + 0.01, bodyR + 0.01, 0.03, 12, MAT.DARK_METAL);
  altKapak.position.set(0, 0.02, 0);
  altKapak.userData.sourceFile = SRC;
  group.add(altKapak);

  const ustKapak = cylMesh(bodyR - 0.02, bodyR - 0.02, 0.04, 12, MAT.DARK_METAL);
  ustKapak.position.set(0, bodyH - 0.02, 0);
  ustKapak.userData.sourceFile = SRC;
  group.add(ustKapak);

  // ── Vana / tetik başlığı ───────────────────────────────────
  const vana = boxMesh(0.12, 0.08, 0.1, MAT.DARK_METAL);
  vana.position.set(0, bodyH + 0.03, 0);
  vana.userData.sourceFile = SRC;
  group.add(vana);

  // ── Hortum ─────────────────────────────────────────────────
  const hortum = cylMesh(0.02, 0.02, 0.35, 8, MAT.WHEEL);
  hortum.position.set(0.08, bodyH + 0.02, 0.1);
  hortum.rotation.z = 0.5;
  hortum.userData.sourceFile = SRC;
  group.add(hortum);

  // ── Nozul ──────────────────────────────────────────────────
  const nozul = boxMesh(0.04, 0.03, 0.06, MAT.DARK_METAL);
  nozul.position.set(0.13, bodyH + 0.1, 0.25);
  nozul.userData.sourceFile = SRC;
  group.add(nozul);

  // ── Duvar askı braketi ─────────────────────────────────────
  const braket = boxMesh(0.06, 0.03, 0.14, MAT.METAL);
  braket.position.set(0, bodyH + 0.12, -0.08);
  braket.userData.sourceFile = SRC;
  group.add(braket);

  return group;
}
