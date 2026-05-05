// assets/complexes/supermarket/modules/entrance.js
// S2 — Entrance zone: automatic doors, turnstiles, shopping cart bay
// Placed at south wall main entrance gap.

import {
  MAIN_CX, MAIN_W, STAFF_CX, STAFF_W, SM_D, WT, SM_BH,
} from '../constants.js';
import { M } from '../materials.js';
import { b, placePrefab } from './helpers.js';
import { createKapiOtomatik } from '../../../props/market/kapiOtomatik.js';
import { createAlisverisArabasi } from '../../../props/market/alisverisArabasi.js';
import { createTurnike } from '../../../props/market/turnike.js';

export function buildEntrance(g, physicsBodies) {
  const sZ = -(SM_D + WT);  // just inside south wall

  /* ── Main automatic sliding doors ─────────────────────────── */
  const kapi = createKapiOtomatik();
  placePrefab(g, kapi, MAIN_CX, 0, sZ, 0);

  /* ── Door frame / trim columns ────────────────────────────── */
  const doorHalf = MAIN_W / 2;
  for (const side of [-1, 1]) {
    b(g, 0.3, SM_BH, 0.3,
      MAIN_CX + side * (doorHalf + 0.15), SM_BH / 2, sZ, M.darkTrim, 0, physicsBodies);
  }

  /* ── Staff side door (east end of south wall) ──────────────── */
  b(g, STAFF_W, 2.6, 0.15, STAFF_CX, 1.3, sZ, M.metal);
  // Staff door frame
  for (const side of [-1, 1]) {
    b(g, 0.15, 2.6, 0.2,
      STAFF_CX + side * (STAFF_W / 2 + 0.08), 1.3, sZ, M.darkTrim, 0, physicsBodies);
  }

  /* ── Turnstiles (3 units, just inside the main entrance) ──── */
  const turnikeZ = sZ + 3.8;  // z = -18.5
  for (let i = -1; i <= 1; i++) {
    const turnike = createTurnike();
    placePrefab(g, turnike, i * 1.1, 0, turnikeZ, 0);
  }

  /* ── Turnstile guide rails ────────────────────────────────── */
  b(g, 0.1, 1.0, 0.1, -2.0, 0.5, turnikeZ, M.metal, 0, physicsBodies);
  b(g, 0.1, 1.0, 0.1, +2.0, 0.5, turnikeZ, M.metal, 0, physicsBodies);

  /* ── Shopping cart bay (exterior, south of entrance) ──────── */
  const cartZ = sZ - 2.5;  // 2.5m outside south wall

  for (let i = 0; i < 5; i++) {
    const araba = createAlisverisArabasi();
    const ax = MAIN_CX - 3.2 + i * 1.6;
    placePrefab(g, araba, ax, 0, cartZ + 1.5, i % 2 === 0 ? 0 : 0.1);
  }

  /* ── Cart bay shelter / canopy ────────────────────────────── */
  const canopyH = 2.4;
  b(g, 9, 0.08, 3.5, MAIN_CX, canopyH, cartZ, M.darkTrim);
  // Support posts
  for (const [px, pz] of [[MAIN_CX - 3.5, cartZ - 1.0], [MAIN_CX + 3.5, cartZ - 1.0],
                           [MAIN_CX - 3.5, cartZ + 3.0], [MAIN_CX + 3.5, cartZ + 3.0]]) {
    b(g, 0.12, canopyH, 0.12, px, canopyH / 2, pz, M.metal, 0, physicsBodies);
  }

  /* ── Entrance welcome mat marker ─────────────────────────── */
  b(g, MAIN_W + 3, 0.005, 3, MAIN_CX, 0.31, sZ + 1.0, M.floorTileGrey);
}
