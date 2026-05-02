// assets/prefabs/complexes/hospital/modules/perimeter.js
// S10 — Perimeter wall & gate with lamp posts and security cameras
// Uses: createSokakLambasi, createGuvenlikKamerasi

import * as THREE from 'three';
import { HW, HD, BH, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, placePrefab } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';
import { createGuvenlikKamerasi } from '../../../props/office/guvenlikKamerasi.js';

const SRC = MODULE_SRC_PREFIX + '/perimeter.js';

export function buildPerimeter(g, physicsBodies) {
  const PH = 1.1, PT = 0.28;
  const PX = 26, PZN = -26, PZS = 26;

  // ── South gate (centre): gap x = -4 to +4 ──
  const gw = 6.0;
  wb(g, PX - gw, PH, PT, -(gw + (PX - gw) / 2), PH / 2, PZS, M.conc, 0, physicsBodies);
  wb(g, PX - gw, PH, PT,  (gw + (PX - gw) / 2), PH / 2, PZS, M.conc, 0, physicsBodies);

  // North wall
  wb(g, PX * 2, PH, PT, 0, PH / 2, PZN, M.conc, 0, physicsBodies);
  // East wall
  wb(g, PT, PH, PZS - PZN, PX, PH / 2, (PZS + PZN) / 2, M.conc, 0, physicsBodies);
  // West wall
  wb(g, PT, PH, PZS - PZN, -PX, PH / 2, (PZS + PZN) / 2, M.conc, 0, physicsBodies);

  /* ── Corner lamp posts — via SokakLambasi prefab ──────────── */
  const cornerLamps = [[PX - 1, PZN + 1], [PX - 1, PZS - 1], [-(PX - 1), PZN + 1], [-(PX - 1), PZS - 1]];
  for (const [clx, clz] of cornerLamps) {
    const lamp = createSokakLambasi();
    placePrefab(g, lamp, clx, 0, clz, 0);
  }

  /* ── Security cameras — via GuvenlikKamerasi prefab ──────── */
  const cameraPositions = [
    [ HW + 1,  HD + 0.5, 0],
    [ HW + 1, -(HD + 0.5), Math.PI],
    [-(HW + 1),  HD + 0.5, 0],
    [-(HW + 1), -(HD + 0.5), Math.PI],
  ];
  for (const [cx, cz, cry] of cameraPositions) {
    const cam = createGuvenlikKamerasi();
    placePrefab(g, cam, cx, BH - 0.22, cz, cry);
  }
}
