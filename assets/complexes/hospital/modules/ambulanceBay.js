// assets/prefabs/complexes/hospital/modules/ambulanceBay.js
// S5 — Ambulance Bay (covered structure, south of ER entrance)

import * as THREE from 'three';
import { HD, ER_CX, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, ptl, placePrefab } from './helpers.js';
import { createAmbulans } from '../../../vehicles/ambulans.js';

const SRC = MODULE_SRC_PREFIX + '/ambulanceBay.js';

export function buildAmbulanceBay(g, physicsBodies) {
  const roadZ = HD + 8;
  slab(g, 7, 14, ER_CX, 0.10, roadZ, M.road);
  for (let i = 0; i < 4; i++) {
    slab(g, 0.20, 1.6, ER_CX, 0.12, roadZ - 5 + i * 3.0, M.stripeY);
  }
  b(g, 0.25, 0.16, 14, ER_CX - 3.65, 0.12, roadZ, M.curb);
  b(g, 0.25, 0.16, 14, ER_CX + 3.65, 0.12, roadZ, M.curb);

  /* ── Bay canopy ─────────────────────────────────────────── */
  const CY = roadZ - 1;
  const CW = 7.0, CD = 4.5, canopyH = 3.4;

  for (const [px, pz] of [
    [ER_CX - CW / 2 + 0.25, CY - CD / 2],
    [ER_CX + CW / 2 - 0.25, CY - CD / 2],
    [ER_CX - CW / 2 + 0.25, CY + CD / 2],
    [ER_CX + CW / 2 - 0.25, CY + CD / 2],
  ]) {
    wb(g, 0.28, canopyH, 0.28, px, canopyH / 2, pz, M.conc, 0, physicsBodies);
  }
  b(g, CW, 0.20, CD, ER_CX, canopyH + 0.10, CY, M.conc);
  b(g, CW + 0.3, 0.32, 0.18, ER_CX, canopyH + 0.16, CY - CD / 2 - 0.08, M.trim);
  b(g, CW + 0.3, 0.32, 0.18, ER_CX, canopyH + 0.16, CY + CD / 2 + 0.08, M.trim);
  b(g, 0.18, 0.32, CD + 0.3, ER_CX - CW / 2 - 0.08, canopyH + 0.16, CY, M.trim);
  b(g, 0.18, 0.32, CD + 0.3, ER_CX + CW / 2 + 0.08, canopyH + 0.16, CY, M.trim);

  b(g, CW - 0.3, 0.10, 0.14, ER_CX, canopyH - 0.04, CY - CD / 2 + 0.3, M.redEm);
  ptl(g, 0xff4444, 0.5, 10, ER_CX, canopyH - 0.2, CY);

  /* ── Ambulance — via prefab ─────────────────────────────── */
  const ambulans = createAmbulans();
  placePrefab(g, ambulans, ER_CX, 0, CY + 2.5, 0);
}
