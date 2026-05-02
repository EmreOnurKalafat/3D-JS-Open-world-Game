// assets/prefabs/complexes/hospital/modules/shell.js
// S1 — Main building shell (walls, floors, windows, trim, emblems)

import * as THREE from 'three';
import { HW, HD, FH, NS, BH, WT, ER_CX, ER_W, MN_CX, MN_W, MODULE_SRC_PREFIX } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, cyl } from './helpers.js';

const SRC = MODULE_SRC_PREFIX + '/shell.js';

export function buildShell(g, physicsBodies) {
  /* ── Ground floor slab ──────────────────────────────────── */
  wb(g, HW * 2, WT, HD * 2, 0, WT / 2, 0, M.conc, 0, physicsBodies);

  /* ── Inter-floor & roof slabs ───────────────────────────── */
  for (let f = 1; f <= NS; f++) {
    wb(g, HW * 2 + WT * 2, WT, HD * 2 + WT * 2, 0, f * FH - WT / 2, 0, M.conc, 0, physicsBodies);
  }

  /* ── Interior floor surfaces (cream tile) ──────────────── */
  for (let f = 0; f < NS; f++) {
    slab(g, HW * 2 - 0.1, HD * 2 - 0.1, 0, f * FH + WT + 0.10, 0, M.offWhite);
  }

  /* ── NORTH wall — full, no openings ─────────────────────── */
  wb(g, HW * 2 - WT * 2, BH, WT, 0, BH / 2, -(HD + WT / 2), M.wall, 0, physicsBodies);

  /* ── EAST wall — full ───────────────────────────────────── */
  wb(g, WT, BH, HD * 2 - WT * 2, HW + WT / 2, BH / 2, 0, M.wall, 0, physicsBodies);

  /* ── WEST wall — full ───────────────────────────────────── */
  wb(g, WT, BH, HD * 2 - WT * 2, -(HW + WT / 2), BH / 2, 0, M.wall, 0, physicsBodies);

  /* ── SOUTH wall — ground floor with entrance gaps ───────── */
  wb(g,  4.7, FH, WT, -11.35, FH / 2, HD + WT / 2, M.wall, 0, physicsBodies);   // A
  wb(g,  8.5, FH, WT,  -0.75, FH / 2, HD + WT / 2, M.wall, 0, physicsBodies);   // B
  wb(g,  5.2, FH, WT,  11.10, FH / 2, HD + WT / 2, M.wall, 0, physicsBodies);   // C

  /* ── SOUTH wall — upper 2 floors (full, no gaps) ────────── */
  wb(g, HW * 2 - WT * 2, FH * 2 + 0.10, WT, 0, FH + FH - 0.05, HD + WT / 2, M.wallHi, 0, physicsBodies);

  /* ── Horizontal facade trim bands ───────────────────────── */
  for (let f = 0; f <= NS; f++) {
    const ty = f * FH + 0.12;
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, HD  + WT / 2 + 0.40,  M.trim);
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, -(HD + WT / 2 + 0.40), M.trim);
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1,  HW + WT / 2 + 0.40, ty, 0, M.trim);
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1, -(HW + WT / 2 + 0.40), ty, 0, M.trim);
  }

  /* ── Window bands (glass strips per floor) ──────────────── */
  for (let f = 0; f < NS; f++) {
    const wy = f * FH + 2.1;
    const wh = 1.7;
    if (f === 0) {
      b(g,  4.2, wh, 0.04, -11.35, wy, HD + WT + 0.08, M.glass);
      b(g,  8.0, wh, 0.04,  -0.75, wy, HD + WT + 0.08, M.glass);
      b(g,  4.7, wh, 0.04,  11.10, wy, HD + WT + 0.08, M.glass);
    } else {
      b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, HD + WT + 0.08, M.glass);
    }
    b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, -(HD + WT + 0.08), M.glass);
    for (const wz of [-6.5, 0, 6.5]) {
      b(g, 0.04, wh, 3.0,  HW + WT + 0.08, wy, wz, M.glass);
      b(g, 0.04, wh, 3.0, -(HW + WT + 0.08), wy, wz, M.glass);
    }
  }

  /* ── Corner pillar accents ──────────────────────────────── */
  for (const [px, pz] of [[-(HW + WT), HD + WT], [-(HW + WT), -(HD + WT)], [HW + WT, HD + WT], [HW + WT, -(HD + WT)]]) {
    b(g, 0.6, BH + 0.6, 0.6, px, BH / 2, pz, M.conc);
  }

  /* ── Red cross emblems on south upper facade ────────────── */
  for (const cx of [-4.5, 4.5]) {
    b(g, 1.4, 4.2, 0.08, cx, FH * 2, HD + WT + 0.10, M.red);
    b(g, 4.2, 1.4, 0.08, cx, FH * 2, HD + WT + 0.10, M.red);
  }

  /* ── Entrance sign board ────────────────────────────────── */
  b(g, 5.2, 0.9, 0.16, 0, 3.4, HD + WT + 0.14, M.signBg);
  b(g, 4.2, 0.28, 0.04, 0, 3.4, HD + WT + 0.23, M.white);

  /* ── Roof parapet — 4 sides ─────────────────────────────── */
  const px = HW + WT + 0.3,  pz = HD + WT + 0.3, ph = 0.9, pt = WT;
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2,  pz, M.conc, 0, physicsBodies);
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2, -pz, M.conc, 0, physicsBodies);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2,  px, BH + ph / 2, 0, M.conc, 0, physicsBodies);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2, -px, BH + ph / 2, 0, M.conc, 0, physicsBodies);

  /* ── Interior divider walls ─────────────────────────────── */
  b(g, 8.5, FH - WT, WT, -0.75, (FH - WT) / 2 + WT, 2, M.offWhite);
  b(g, WT, FH - WT, HD * 2 - WT, -1.5, (FH - WT) / 2 + WT, 0, M.offWhite);
}
