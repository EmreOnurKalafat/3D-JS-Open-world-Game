// assets/complexes/supermarket/modules/backroom.js
// S6 — Backroom / storage: divider wall, pallets, boxes, dock access
// Located on the east side (x: +12 → +20), separated from shopping floor.

import {
  SM_W, SM_D, WT, SM_BH,
  MAIN_CX, DOCK_CX, DOCK_W,
  MODULE_SRC_PREFIX,
} from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, placePrefab } from './helpers.js';
import { createKoliKutu } from '../../../props/market/koliKutu.js';
import { createPaletAhsap } from '../../../props/market/paletAhsap.js';
import { createTranspalet } from '../../../props/market/transpalet.js';
import { createYanginSondurucu } from '../../../props/market/yanginSondurucu.js';
import { createYagVarili } from '../../../props/market/yagVarili.js';

const SRC = MODULE_SRC_PREFIX + '/backroom.js';

export function buildBackroom(g, physicsBodies) {
  // Backroom occupies east 8m of the building (x: +12 → +20)
  const divX = SM_W - 8;      // divider wall at x = +12
  const roomW = SM_W - divX;  // 8m wide backroom
  const roomCx = (divX + SM_W) / 2;  // x = +16

  /* ── Divider wall (separates backroom from sales floor) ──── */
  // Wall runs north-south at x = divX, from z = -SM_D to z = +SM_D
  const divWallZ = SM_D - WT;   // 21.7

  // South segment: z = -divWallZ … -1.5 (door gap at z=0, 3m gap)
  wb(g, WT, SM_BH, divWallZ - 1.5, divX, SM_BH / 2, (-divWallZ - 1.5) / 2, M.wall, 0, physicsBodies);
  // North segment: z = +1.5 … +divWallZ
  wb(g, WT, SM_BH, divWallZ - 1.5, divX, SM_BH / 2, (+divWallZ + 1.5) / 2, M.wall, 0, physicsBodies);

  // Door frame for the 3m personnel passage at z=0
  for (const side of [-1, 1]) {
    b(g, 0.15, SM_BH, 0.2, divX, SM_BH / 2, side * 1.6, M.darkTrim, 0, physicsBodies);
  }

  /* ── Interior divider (office corner at north-east) ──────── */
  const offX = SM_W - 5;   // x = 15
  const offZ = SM_D - 4;   // z = 18  (office back wall near north wall)
  // Office divider running east-west from divX to offX
  wb(g, offX - divX, SM_BH, WT, (divX + offX) / 2, SM_BH / 2, offZ - 1, M.wall, 0, physicsBodies);
  // Door gap for office (at left side, near divider wall)
  b(g, 0.15, SM_BH, 0.2, divX + 0.6, SM_BH / 2, offZ - 1, M.darkTrim, 0, physicsBodies);
  b(g, 0.15, SM_BH, 0.2, divX + 1.5, SM_BH / 2, offZ - 1, M.darkTrim, 0, physicsBodies);

  /* ── Loading dock interior connection ────────────────────── */
  // The dock gap is at DOCK_CX=0 on the east wall → z=0, x=+20
  const dockInteriorZ = DOCK_CX;  // 0
  b(g, DOCK_W + 3, 0.10, 4, SM_W - 2, 0.30, dockInteriorZ, M.conc);

  /* ── Pallet stacks with boxes (2 groups) ─────────────────── */
  const stackAreas = [
    { x: divX + 2.5, z: -16 },  // x=14.5, south
    { x: divX + 2.5, z: +8  },  // x=14.5, north
  ];

  for (const area of stackAreas) {
    // Base pallet (1.2w × 0.15h × 1.0d)
    const palet = createPaletAhsap();
    placePrefab(g, palet, area.x, 0.02, area.z, 0);

    // 3 boxes on pallet (0.7w × 0.55h × 0.5d)
    for (let i = 0; i < 3; i++) {
      const koli = createKoliKutu();
      placePrefab(g, koli, area.x - 0.3 + i * 0.35, 0.14, area.z + (i % 2) * 0.3, 0.1 * i);
    }

    // Second layer (1 box)
    const koli2 = createKoliKutu();
    placePrefab(g, koli2, area.x - 0.1, 0.70, area.z + 0.15, 0.2);
  }

  /* ── Transpalet (near dock, south side) ──────────────────── */
  const transpalet = createTranspalet();
  placePrefab(g, transpalet, SM_W - 4, 0, -6, -Math.PI / 2);

  /* ── Yangın söndürücüler (2 adet, duvarda) ───────────────── */
  // On divider wall, south end
  const yg1 = createYanginSondurucu();
  placePrefab(g, yg1, divX + 0.2, 0.6, -SM_D + 4, 0);

  // On east wall, near dock (south side)
  const yg2 = createYanginSondurucu();
  placePrefab(g, yg2, SM_W - 0.3, 0.6, -3, Math.PI);

  /* ── Yağ varili (north-east corner) ──────────────────────── */
  const varil = createYagVarili();
  placePrefab(g, varil, SM_W - 2, 0, SM_D - 3, 0.4);

  /* ── Shelving unit on divider wall (east face) ───────────── */
  for (let i = 0; i < 3; i++) {
    b(g, 2, 0.04, 0.5, divX + 0.5, 1.2 + i * 0.7, -SM_D + 8 + i * 2.5, M.shelfMetal, 0, physicsBodies);
  }

  /* ── Mop sink / utility corner (south end) ────────────────── */
  b(g, 0.8, 0.9, 0.6, divX + 1.5, 0.45, -SM_D + 2, M.cabinetW, 0, physicsBodies);

  console.log('[BACKROOM] Built — divider(x=%d), office(NE), 2 pallet stacks, transpalet, extinguishers', divX);
}
