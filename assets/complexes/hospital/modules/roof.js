// assets/prefabs/complexes/hospital/modules/roof.js
// S2 — Roof details (helipad, HVAC units, water tank, antenna mast)

import * as THREE from 'three';
import { HW, HD, BH, WT, MODULE_SRC_PREFIX, hx, hz } from '../constants.js';
import { M } from '../materials.js';
import { b, slab, cyl } from './helpers.js';

const SRC = MODULE_SRC_PREFIX + '/roof.js';

export function buildRoof(g) {
  const ry = BH + WT;

  /* ── Roof surface ────────────────────────────────────────── */
  slab(g, HW * 2 - 0.2, HD * 2 - 0.2, 0, ry + 0.04, 0, M.roof);

  /* ── Helipad (circular, centre) ──────────────────────────── */
  const hpGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.06, 32);
  const hp = new THREE.Mesh(hpGeo, new THREE.MeshLambertMaterial({ color: 0x222222 }));
  hp.position.set(hx(0), ry + 0.06, hz(0));
  hp.userData.sourceFile = SRC;
  g.add(hp);

  const ringGeo = new THREE.TorusGeometry(4.2, 0.2, 8, 48);
  const ring = new THREE.Mesh(ringGeo, M.heliW);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(hx(0), ry + 0.1, hz(0));
  ring.userData.sourceFile = SRC;
  g.add(ring);

  b(g, 0.5, 0.08, 3.0,  -1.0, ry + 0.1, 0, M.heliW);
  b(g, 0.5, 0.08, 3.0,   1.0, ry + 0.1, 0, M.heliW);
  b(g, 2.5, 0.08, 0.5,   0,   ry + 0.1, 0, M.heliW);

  for (const [lx2, lz2] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) {
    cyl(g, 0.08, 0.08, 0.3, 8, M.yellowEm, lx2, ry + 0.15, lz2);
  }

  /* ── HVAC units ─────────────────────────────────────────── */
  b(g, 3.5, 1.2, 2.0, -10, ry + 0.6, -7, M.metal);
  b(g, 2.8, 1.0, 1.6,  10, ry + 0.5, -7, M.metal);
  b(g, 2.0, 0.8, 1.4,  10, ry + 0.4,  7, M.metal);
  for (let i = 0; i < 4; i++) {
    b(g, 3.6, 0.04, 0.04, -10, ry + 0.6 + i * 0.18, -6.0, M.darkTrim);
  }

  /* ── Water tank ─────────────────────────────────────────── */
  cyl(g, 1.2, 1.2, 2.4, 12, M.metal, -11, ry + 1.2,  6);
  b(g,  2.6, 0.1, 2.6,  -11, ry + 2.4, 6, M.darkTrim);

  /* ── Communications mast ────────────────────────────────── */
  cyl(g, 0.06, 0.08, 5.0, 8, M.trim, 12, ry + 2.5, -8);
  b(g, 0.8, 0.04, 0.04, 12, ry + 4.8, -8, M.metal);
  b(g, 0.35, 0.25, 0.04, 12.4, ry + 4.8, -8, M.trim);
  cyl(g, 0.1, 0.1, 0.2, 8, M.redEm, 12, ry + 5.1, -8);
}
