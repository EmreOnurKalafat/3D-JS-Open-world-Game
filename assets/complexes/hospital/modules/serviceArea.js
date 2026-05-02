// assets/prefabs/complexes/hospital/modules/serviceArea.js
// S9 — North service area (generator, dumpsters, chain-link fence)
// Uses: createJenerator, createCopKonteyneri, createCitFenceRun

import * as THREE from 'three';
import { HW, HD, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { slab, placePrefab } from './helpers.js';
import { createJenerator } from '../../../props/outdoor/jenerator.js';
import { createCopKonteyneri } from '../../../props/outdoor/copKonteyneri.js';
import { createCitFenceRun } from '../../../props/outdoor/cit.js';

const SRC = MODULE_SRC_PREFIX + '/serviceArea.js';

export function buildServiceArea(g) {
  slab(g, 10, 8, 0, 0.06, -(HD + 5), M.road);

  /* ── Generator — via Jenerator prefab ───────────────────── */
  const gen = createJenerator();
  placePrefab(g, gen, -8, 0, -(HD + 4), 0);

  /* ── 2 dumpsters — via CopKonteyneri prefab ─────────────── */
  const d1 = createCopKonteyneri(0x1a5e1a);
  placePrefab(g, d1, 5, 0, -(HD + 4.5), 0);
  const d2 = createCopKonteyneri(0x5e1a1a);
  placePrefab(g, d2, 7.4, 0, -(HD + 4.5), 0);

  /* ── Chain-link fence — via CitFenceRun prefab ──────────── */
  const westFence = createCitFenceRun({
    axis: 'z', start: -20, end: -10, fixedCoord: -14.0, fenceHeight: 1.6,
  });
  placePrefab(g, westFence, 0, 0, 0, 0);

  const northFence = createCitFenceRun({
    axis: 'x', start: -14, end: -4, fixedCoord: -19.5, fenceHeight: 1.6,
  });
  placePrefab(g, northFence, 0, 0, 0, 0);
}
