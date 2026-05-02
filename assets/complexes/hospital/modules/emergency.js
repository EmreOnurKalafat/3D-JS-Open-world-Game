// assets/prefabs/complexes/hospital/modules/emergency.js
// S3 — Emergency wing interior (ground floor, west side)
// Uses: createBanko, createHastaneYatagi prefabs

import * as THREE from 'three';
import { HW, HD, FH, WT, ER_CX, ER_W, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, slab, placePrefab } from './helpers.js';
import { createBanko } from '../../../props/office/banko.js';
import { createHastaneYatagi } from '../../../props/office/hastaneYatagi.js';

const SRC = MODULE_SRC_PREFIX + '/emergency.js';

export function buildEmergencyInterior(g) {
  slab(g, 13, 19, -7.5, WT + 0.09, 0, new THREE.MeshLambertMaterial({ color: 0xecebe6 }));

  /* ── Triage counter — via Banko prefab ──────────────────── */
  const counter = createBanko();
  placePrefab(g, counter, -8, 0, 4.5, 0);

  // Monitor on counter
  b(g, 0.48, 0.36, 0.04, -8, 1.64, 4.2, new THREE.MeshLambertMaterial({ color: 0x001800 }));
  b(g, 0.48, 0.04, 0.02, -8, 1.44, 4.2, M.trim);

  /* ── 3 emergency beds — via prefab ──────────────────────── */
  const bedPositions = [[-11, 1], [-11, -3], [-11, -7]];
  for (const [bx, bz] of bedPositions) {
    const bed = createHastaneYatagi();
    placePrefab(g, bed, bx, 0, bz, 0);
  }

  /* ── Defibrillator cabinet (west wall) ──────────────────── */
  b(g, 0.7, 1.8, 0.4, -(HW - 0.5), 0.9, -1, M.cabinet);
  b(g, 0.5, 0.06, 0.3, -(HW - 0.5), 1.5, -1, M.trim);
  b(g, 0.3, 0.22, 0.28, -(HW - 0.5), 0.9, -1, M.yellow);

  /* ── Emergency entrance doors ───────────────────────────── */
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX - ER_W / 4, FH / 2 - 0.2, HD, M.glassDk);
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX + ER_W / 4, FH / 2 - 0.2, HD, M.glassDk);

  /* ── Emergency sign above entrance ──────────────────────── */
  b(g, ER_W + 0.4, 0.4, 0.18, ER_CX, FH + 0.2, HD + WT + 0.14, M.redEm);
}
