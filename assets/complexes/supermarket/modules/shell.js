// assets/complexes/supermarket/modules/shell.js
// S1 — Main building shell (floor, walls, parapet, roof)
// Big-box retail store: 40m × 50m, single storey 8m tall

import * as THREE from 'three';
import {
  SM_W, SM_D, SM_BH, WT,
  MAIN_CX, MAIN_W, STAFF_CX, STAFF_W, DOCK_CX, DOCK_W,
  MODULE_SRC_PREFIX,
} from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, cyl } from './helpers.js';

const SRC = MODULE_SRC_PREFIX + '/shell.js';

export function buildShell(g, physicsBodies) {
  const HW = SM_W, HD = SM_D, BH = SM_BH;

  /* ── Physics floor (invisible, low) ──────────────────────── */
  const pf = wb(g, HW * 2, 0.10, HD * 2, 0, 0.08, 0, M.conc, 0, physicsBodies);
  pf.visible = false;

  /* ── Interior floor — off-white tile ──────────────────────── */
  slab(g, HW * 2 - WT * 2, HD * 2 - WT * 2, 0, 0.30, 0, M.floorTile);

  /* ── NORTH wall — full, no openings ───────────────────────── */
  wb(g, HW * 2 - WT * 2, BH, WT, 0, BH / 2, +(HD + WT / 2), M.wallExt, 0, physicsBodies);

  /* ── WEST wall — full ─────────────────────────────────────── */
  wb(g, WT, BH, HD * 2 - WT * 2, -(HW + WT / 2), BH / 2, 0, M.wallExt, 0, physicsBodies);

  /* ── EAST wall — with loading-dock gap ────────────────────── */
  const dockHalf = DOCK_W / 2;
  const eWallZ = HD - WT;   // inner clear span
  // South segment of east wall
  wb(g, WT, BH, eWallZ + dockHalf, HW + WT / 2, BH / 2, (-eWallZ - dockHalf) / 2, M.wallExt, 0, physicsBodies);
  // North segment of east wall
  wb(g, WT, BH, eWallZ - dockHalf, HW + WT / 2, BH / 2, (+eWallZ + dockHalf) / 2, M.wallExt, 0, physicsBodies);

  /* ── SOUTH wall — ground floor with entrance gaps ─────────── */
  const sWallX = HW - WT;   // inner clear span from centre
  const sZ = -(HD + WT / 2);

  // Left panel: x = -sWallX … MAIN gap left edge
  const mainHalf = MAIN_W / 2;
  const leftW = sWallX - mainHalf;
  const leftCx = (-sWallX + -mainHalf) / 2;
  wb(g, leftW, BH, WT, leftCx, BH / 2, sZ, M.wallExt, 0, physicsBodies);

  // Middle panel: between MAIN and STAFF gaps
  const staffHalf = STAFF_W / 2;
  const midW = STAFF_CX - staffHalf - mainHalf;
  const midCx = (mainHalf + STAFF_CX - staffHalf) / 2;
  wb(g, midW, BH, WT, midCx, BH / 2, sZ, M.wallExt, 0, physicsBodies);

  // Right panel: x = STAFF gap right edge … +sWallX
  const rightW = sWallX - (STAFF_CX + staffHalf);
  const rightCx = (STAFF_CX + staffHalf + sWallX) / 2;
  wb(g, rightW, BH, WT, rightCx, BH / 2, sZ, M.wallExt, 0, physicsBodies);

  /* ── HIGH WINDOW STRIPS (top of all walls, 1m tall) ────────── */
  const wy = BH - 1.2;
  const wh = 0.8;
  b(g, HW * 2 - WT * 2, wh, 0.04, 0, wy, HD + WT + 0.15, M.glassFrost);
  b(g, HW * 2 - WT * 2, wh, 0.04, 0, wy, -(HD + WT + 0.15), M.glassFrost);
  b(g, 0.04, wh, HD * 2 - WT * 2, HW + WT + 0.15, wy, 0, M.glassFrost);
  b(g, 0.04, wh, HD * 2 - WT * 2, -(HW + WT + 0.15), wy, 0, M.glassFrost);

  /* ── Corner pillar accents ────────────────────────────────── */
  const cp = [[-(HW + WT), HD + WT], [-(HW + WT), -(HD + WT)],
              [ HW + WT, HD + WT], [ HW + WT, -(HD + WT)]];
  for (const [px, pz] of cp) {
    b(g, 0.6, BH + 0.6, 0.6, px, BH / 2, pz, M.conc);
  }

  /* ── Roof parapet — 4 sides ───────────────────────────────── */
  const px = HW + WT + 0.3, pz = HD + WT + 0.3, ph = 0.9, pt = WT;
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2,  pz, M.conc, 0, physicsBodies);
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2, -pz, M.conc, 0, physicsBodies);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2,  px, BH + ph / 2, 0, M.conc, 0, physicsBodies);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2, -px, BH + ph / 2, 0, M.conc, 0, physicsBodies);

  /* ── ROOF — flat slab + AC units ──────────────────────────── */
  slab(g, HW * 2 + 1.2, HD * 2 + 1.2, 0, BH + WT / 2 + 0.02, 0, M.roof);

  // AC / vent units scattered on roof
  for (const [ax, az] of [[-8, -8], [5, -6], [-4, 9], [9, 10], [-12, -14]]) {
    const ah = 1.2 + Math.random() * 1.8;
    const aw = 1.5 + Math.random() * 1.5;
    const ad = 1.0 + Math.random() * 1.0;
    b(g, aw, ah, ad, ax, BH + ah / 2 + 0.15, az, M.darkTrim);
  }

  /* ── Roof access hatch (small box with sloped top) ─────────── */
  b(g, 1.2, 0.5, 1.2, 14, BH + 0.4, 5, M.darkTrim);

  /* ── East loading dock ramp (exterior concrete wedge) ─────── */
  b(g, DOCK_W + 2, 0.5, 3, HW + WT + 3, 0.25, DOCK_CX, M.conc);

  /* ── SOUTH facade sign board (above main entrance) ─────────── */
  b(g, MAIN_W + 2, 1.2, 0.2, MAIN_CX, BH - 2.0, -(HD + WT + 0.2), M.signRed);
  b(g, MAIN_W + 1, 0.4, 0.06, MAIN_CX, BH - 2.0, -(HD + WT + 0.34), M.white);
}
