// assets/prefabs/complexes/hospital/modules/canopy.js
// S6 — Main entrance canopy (south, centre-east)

import * as THREE from 'three';
import { HD, MN_CX, MN_W, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, cyl, ptl } from './helpers.js';

const SRC = MODULE_SRC_PREFIX + '/canopy.js';

export function buildMainCanopy(g) {
  const CX = MN_CX, CZ = HD + 3.2;
  const CW = 6.5, CD = 4.5, canopyH = 3.4;

  for (const [px, pz] of [
    [CX - CW / 2 + 0.2, CZ - CD / 2 + 0.2],
    [CX + CW / 2 - 0.2, CZ - CD / 2 + 0.2],
    [CX - CW / 2 + 0.2, CZ + CD / 2 - 0.2],
    [CX + CW / 2 - 0.2, CZ + CD / 2 - 0.2],
  ]) {
    cyl(g, 0.07, 0.07, canopyH, 8, M.metal, px, canopyH / 2, pz);
  }

  b(g, CW, 0.1, CD, CX, canopyH + 0.05, CZ,
    new THREE.MeshLambertMaterial({ color: 0xaaccee, transparent: true, opacity: 0.35 }));
  b(g, CW + 0.1, 0.18, 0.12, CX, canopyH + 0.09,  CZ - CD / 2, M.metal);
  b(g, CW + 0.1, 0.18, 0.12, CX, canopyH + 0.09,  CZ + CD / 2, M.metal);
  b(g, 0.12, 0.18, CD + 0.1, CX - CW / 2, canopyH + 0.09, CZ, M.metal);
  b(g, 0.12, 0.18, CD + 0.1, CX + CW / 2, canopyH + 0.09, CZ, M.metal);
  ptl(g, 0xfff5e0, 0.5, 10, CX, canopyH - 0.3, CZ);

  b(g, MN_W + 0.2, 0.12, 0.6, MN_CX, 0.06, HD + 0.5, M.conc);
}
