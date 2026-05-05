// assets/complexes/supermarket/modules/cashiers.js
// S3 — Cashier zone: checkout counters with registers + POS
// 4 counters in a row, between entrance turnstiles and aisles.

import {
  MAIN_CX, SM_D, WT,
} from '../constants.js';
import { M } from '../materials.js';
import { b, placePrefab } from './helpers.js';
import { createKasaBankosu } from '../../../props/market/kasaBankosu.js';
import { createYazarkasa } from '../../../props/market/yazarkasa.js';
import { createPosCihazi } from '../../../props/market/posCihazi.js';

export function buildCashiers(g, physicsBodies) {
  const sZ = -(SM_D + WT);  // south interior wall face

  // Cashier zone starts after produce stand + turnstiles
  const kasaBaseZ = sZ + 11.3;   // z = -11.0
  const kasaSpacing = 3.2;       // centre-to-centre
  const kasaCount = 4;

  /* ── 4 checkout counters ──────────────────────────────────── */
  for (let i = 0; i < kasaCount; i++) {
    const kx = -kasaSpacing * (kasaCount - 1) / 2 + i * kasaSpacing;

    // Counter
    const banko = createKasaBankosu();
    placePrefab(g, banko, kx, 0, kasaBaseZ, Math.PI);  // rotated 180° — facing south/entrance

    // Top surface: cash register (left side), POS (right side)
    const yazarkasa = createYazarkasa();
    placePrefab(g, yazarkasa, kx - 0.3, 0.66, kasaBaseZ, 0);

    const pos = createPosCihazi();
    placePrefab(g, pos, kx + 0.5, 0.66, kasaBaseZ, 0.1);

    // Divider bar / queue guide (between counters)
    if (i < kasaCount - 1) {
      const divX = kx + kasaSpacing / 2;
      b(g, 0.04, 1.0, 1.0, divX, 0.5, kasaBaseZ + 0.5, M.metal, 0, physicsBodies);
    }
  }

  /* ── Cashier back wall / supervisor desk area ──────────────── */
  const backZ = kasaBaseZ + 1.5;   // z = -9.5

  // Narrow supervisor counter behind cashiers
  b(g, 5, 1.0, 0.8, MAIN_CX, 0.5, backZ, M.cabinetW, 0, physicsBodies);

  /* ── Queue management railings ────────────────────────────── */
  const railZ = kasaBaseZ - 1.5;   // z = -12.5
  b(g, kasaSpacing * (kasaCount - 1) + 2, 0.08, 0.08, MAIN_CX, 0.9, railZ, M.metal, 0, physicsBodies);
  for (const side of [-1, 1]) {
    b(g, 0.08, 0.9, 0.08,
      MAIN_CX + side * (kasaSpacing * (kasaCount - 1) / 2 + 1), 0.45, railZ, M.metal, 0, physicsBodies);
  }

  /* ── Impulse-buy displays near checkout ────────────────────── */
  for (let i = 0; i < 3; i++) {
    const dx = -3 + i * 3;
    b(g, 0.6, 1.5, 0.4, dx, 0.75, railZ + 0.6, M.cabinetGrey, 0, null);
  }
}
