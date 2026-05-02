// assets/prefabs/complexes/hospital/modules/lobby.js
// S4 — Main lobby & outpatient (ground floor, east side)
// Uses: createBeklemeSandalyasi, createSehpa, createHastaneYatagi

import * as THREE from 'three';
import { HW, HD, FH, WT, MN_CX, MN_W, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, slab, placePrefab } from './helpers.js';
import { createBeklemeSandalyasi } from '../../../props/office/beklemeSandalyasi.js';
import { createSehpa } from '../../../props/office/sehpa.js';
import { createHastaneYatagi } from '../../../props/office/hastaneYatagi.js';

const SRC = MODULE_SRC_PREFIX + '/lobby.js';

export function buildMainLobby(g) {
  slab(g, 13, 19, 7, WT + 0.09, 0, new THREE.MeshLambertMaterial({ color: 0xf4f1ec }));

  /* ── Reception desk (L-shaped, hospital-specific) ────────── */
  b(g, 5.0, 1.05, 0.80,  8, 0.92, 3.5, M.white);
  b(g, 0.80, 1.05, 2.4,  10.6, 0.92, 2.8, M.white);
  b(g, 5.2, 0.08, 0.85,  8, 1.46, 3.5, M.trim);
  b(g, 0.85, 0.08, 2.5,  10.6, 1.46, 2.8, M.trim);
  for (const [dx, dz] of [[-1.5, 0], [0, 0], [1.5, 0]]) {
    b(g, 0.42, 0.32, 0.04, 8 + dx, 1.65, 3.1 + dz, new THREE.MeshLambertMaterial({ color: 0x001800 }));
    b(g, 0.42, 0.03, 0.02, 8 + dx, 1.49, 3.1 + dz, M.trim);
  }

  /* ── 4 waiting chairs — via prefab ──────────────────────── */
  for (let i = 0; i < 4; i++) {
    const chair = createBeklemeSandalyasi();
    placePrefab(g, chair, 12, 0, -4 + i * 1.1, -Math.PI / 2);
  }

  /* ── Coffee table — via Sehpa prefab ────────────────────── */
  const sehpa = createSehpa();
  placePrefab(g, sehpa, 12, 0, -2.0, 0);

  /* ── Floor direction stripe ─────────────────────────────── */
  slab(g, 1.0, 18, 4, WT + 0.12, 0,
    new THREE.MeshLambertMaterial({ color: 0x4488cc, transparent: true, opacity: 0.4 }));

  /* ── Main entrance doors ────────────────────────────────── */
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX - MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX + MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);

  /* ── "OUTPATIENT" sign strip ────────────────────────────── */
  b(g, MN_W + 0.5, 0.35, 0.14, MN_CX, FH + 0.18, HD + WT + 0.14, M.signBg);
  b(g, MN_W - 0.3, 0.14, 0.03, MN_CX, FH + 0.18, HD + WT + 0.22, M.white);

  /* ── 2 patient rooms off east corridor ──────────────────── */
  for (let r = 0; r < 2; r++) {
    const rz = -6 + r * 7;
    b(g, WT, FH - 0.4, 4.5,  HW - 2.5, (FH - 0.4) / 2 + WT, rz, M.offWhite);
    const bed = createHastaneYatagi();
    placePrefab(g, bed, HW - 1, 0, rz, Math.PI / 2);
    b(g, 0.4, 0.5, 0.4, HW - 2.0, 0.5, rz - 1.8, M.cabinet);
  }
}
