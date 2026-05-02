// assets/prefabs/complexes/hospital/modules/garden.js
// S8 — Garden (east side of building)
// Uses: createAgac, createBank, createSokakLambasi

import * as THREE from 'three';
import { HW, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, slab, placePrefab } from './helpers.js';
import { createAgac } from '../../../props/outdoor/agac.js';
import { createBank } from '../../../props/office/bank.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';

const SRC = MODULE_SRC_PREFIX + '/garden.js';

export function buildGarden(g) {
  slab(g, 10, 16, HW + 5, 0.04, 0, M.grass);

  slab(g, 1.0, 10, HW + 2, 0.07, 2, M.path);
  slab(g, 6, 1.0, HW + 5, 0.10, 7, M.path);

  /* ── Trees — via Agac prefab ────────────────────────────── */
  const treePlacements = [[HW + 3, -4, 0.75], [HW + 7, 2, 0.85], [HW + 4, 6, 0.7]];
  for (const [tx, tz, ts] of treePlacements) {
    const t = createAgac(ts);
    placePrefab(g, t, tx, 0, tz, 0);
  }

  /* ── Benches — via Bank prefab ──────────────────────────── */
  const bench1 = createBank();
  placePrefab(g, bench1, HW + 2.5, 0, -2, 0);
  const bench2 = createBank();
  placePrefab(g, bench2, HW + 5.5, 0, 5, -Math.PI / 6);

  // Flower bed
  b(g, 3.5, 0.15, 2.2, HW + 7.5, 0.14, -3, new THREE.MeshLambertMaterial({ color: 0x7a5c3a }));
  slab(g, 3.1, 1.9, HW + 7.5, 0.14, -3, new THREE.MeshLambertMaterial({ color: 0x4a8830 }));

  /* ── Garden lamp — via SokakLambasi prefab ──────────────── */
  const gardenLamp = createSokakLambasi();
  placePrefab(g, gardenLamp, HW + 4, 0, 3, 0);
}
