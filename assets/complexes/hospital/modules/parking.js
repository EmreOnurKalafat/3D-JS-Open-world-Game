// assets/prefabs/complexes/hospital/modules/parking.js
// S7 — Parking lot (south of building)
// Uses: createSokakLambasi prefab

import * as THREE from 'three';
import { HD, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { slab, placePrefab } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';

const SRC = MODULE_SRC_PREFIX + '/parking.js';

export function buildParking(g) {
  const START_Z = HD + 1.5;

  slab(g, 26, 13, 0, 0.05, START_Z + 6.5, M.asphalt);
  slab(g, 7, 4.5, 0, 0.10, HD + 12.5, M.road);

  const STALL_W = 2.4, STALL_D = 4.2;
  const rowA_Z = START_Z + 1.8;
  const rowB_Z = START_Z + 8.3;

  for (let i = 0; i < 5; i++) {
    const sx = -6 + i * STALL_W;
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowA_Z, M.stripeW);
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowB_Z, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowA_Z - STALL_D / 2, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowB_Z - STALL_D / 2, M.stripeW);
  }
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowA_Z, M.stripeW);
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowB_Z, M.stripeW);

  for (let i = 0; i < 5; i++) {
    slab(g, 0.12, 1.6, -6 + i * 2.6, 0.07, rowA_Z + STALL_D / 2 + 1.0, M.stripeY);
  }

  /* ── 3 lamp posts — via SokakLambasi prefab ─────────────── */
  const lampPositions = [[-11, rowA_Z], [11, rowA_Z], [0, rowB_Z + 1.5]];
  for (const [llx, llz] of lampPositions) {
    const lamp = createSokakLambasi();
    placePrefab(g, lamp, llx, 0, llz, 0);
  }

  // Disabled bay
  slab(g, STALL_W - 0.1, STALL_D - 0.1, -6 + STALL_W / 2, 0.08, rowA_Z,
    new THREE.MeshLambertMaterial({ color: 0x1144aa, transparent: true, opacity: 0.45 }));
}
