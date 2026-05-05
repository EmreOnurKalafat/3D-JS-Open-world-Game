// assets/props/market/alisverisArabasi.js — Alışveriş Arabası Prefab
// Tel sepet + tekerlekli metal çerçeve. İtilebilir hareketli obje.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/alisverisArabasi.js';

export function createAlisverisArabasi() {
  const group = new THREE.Group();
  group.name = 'AlisverisArabasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Alışveriş Arabası';

  // ── Sepet gövdesi (açık üst kutu) ──────────────────────────
  const sepetAlt = boxMesh(0.7, 0.04, 1.0, MAT.METAL);
  sepetAlt.position.set(0, 0.2, 0);
  sepetAlt.userData.sourceFile = SRC;
  group.add(sepetAlt);

  // Ön panel
  const onPanel = boxMesh(0.7, 0.5, 0.04, MAT.METAL);
  onPanel.position.set(0, 0.47, 0.5);
  onPanel.userData.sourceFile = SRC;
  group.add(onPanel);

  // Arka panel (üst kısım açık — sap kısmı)
  const arkaPanel = boxMesh(0.7, 0.35, 0.04, MAT.METAL);
  arkaPanel.position.set(0, 0.4, -0.5);
  arkaPanel.userData.sourceFile = SRC;
  group.add(arkaPanel);

  // Yan paneller
  for (const side of [-1, 1]) {
    const yanPanel = boxMesh(0.04, 0.5, 1.0, MAT.METAL);
    yanPanel.position.set(side * 0.35, 0.47, 0);
    yanPanel.userData.sourceFile = SRC;
    group.add(yanPanel);
  }

  // ── Tel çubuk detayları (üst çerçeve) ──────────────────────
  const ustCerceve = boxMesh(0.7, 0.03, 1.0, MAT.METAL);
  ustCerceve.position.set(0, 0.7, 0);
  ustCerceve.userData.sourceFile = SRC;
  group.add(ustCerceve);

  // ── Sap / tutma kolu ───────────────────────────────────────
  const sap = cylMesh(0.03, 0.03, 0.7, 8, MAT.DARK_METAL);
  sap.rotation.x = Math.PI / 2;
  sap.position.set(0, 0.75, -0.55);
  sap.userData.sourceFile = SRC;
  group.add(sap);

  // ── Alt şasi ───────────────────────────────────────────────
  const sasiX = boxMesh(0.04, 0.03, 0.9, MAT.DARK_METAL);
  sasiX.position.set(0, 0.06, 0.05);
  sasiX.userData.sourceFile = SRC;
  group.add(sasiX);

  // ── 4 tekerlek ─────────────────────────────────────────────
  const tekerlekPos = [[-0.3, 0.06, -0.4], [0.3, 0.06, -0.4],
                       [-0.3, 0.06, 0.35], [0.3, 0.06, 0.35]];
  for (const [tx, ty, tz] of tekerlekPos) {
    const teker = cylMesh(0.07, 0.07, 0.04, 12, MAT.WHEEL);
    teker.rotation.x = Math.PI / 2;
    teker.position.set(tx, ty, tz);
    teker.userData.sourceFile = SRC;
    group.add(teker);
  }

  return group;
}
