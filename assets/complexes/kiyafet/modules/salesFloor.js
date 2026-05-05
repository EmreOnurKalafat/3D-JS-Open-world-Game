// assets/complexes/kiyafet/modules/salesFloor.js — Ana satis alani
import { GM_W, GM_D, GM_BH } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, cyl, placePrefab } from './helpers.js';
import { createAskilikStand } from '../../../props/kiyafet/askilikStand.js';
import { createRafUnitesi } from '../../../props/kiyafet/rafUnitesi.js';
import { createAskiDuvar } from '../../../props/kiyafet/askiDuvar.js';

/** Build the main sales floor with clothing racks, shelves, and wall displays */
export function buildSalesFloor(g, physicsBodies) {

  // ── Askilik Standlari ─────────────────────────
  const rackDefs = [
    [-10, 7, 2.4], [4, 7, 1.8],
    [-10, 2, 1.8], [-6, -2, 2.4],
    [6, -5, 1.8], [0, -5, 1.8],
  ];
  for (const [lx, lz, w] of rackDefs) {
    const askilik = createAskilikStand(w);
    placePrefab(g, askilik, lx, 0.30, lz, 0);
  }

  // ── Raf Uniteleri + fizik proxy ───────────────
  const shelfDefs = [[6, 2], [0, -2]];
  for (const [lx, lz] of shelfDefs) {
    const raf = createRafUnitesi();
    placePrefab(g, raf, lx, 0.30, lz, 0);
    // Fizik: gorunmez kutu, rafin tam konumunda
    const proxy = wb(g, 2.0, 1.8, 0.5, lx, 1.20, lz, M.floorConc, 0, physicsBodies);
    proxy.visible = false;
  }

  // ── Aksesuar Duvari ───────────────────────────
  const askiDuvarBati = createAskiDuvar(5);
  placePrefab(g, askiDuvarBati, -(GM_W - 0.5), 0.30, 3, Math.PI / 2);

  const askiDuvarDogu = createAskiDuvar(4);
  placePrefab(g, askiDuvarDogu, +(GM_W - 0.5), 0.30, -2, -Math.PI / 2);

  // ── Orta Alan — Indirim Sepeti ─────────────────
  b(g, 2.0, 0.6, 1.2, 0, 0.64, 0, M.accent);
  b(g, 1.6, 0.06, 0.05, 0, 0.92, 0.62, M.fabricRed);
  b(g, 0.3, 0.2, 0.2, -0.3, 0.70, 0.1, M.fabricBlue);
  b(g, 0.25, 0.15, 0.2, 0.2, 0.68, -0.15, M.fabricGreen);
  b(g, 0.28, 0.18, 0.2, -0.1, 0.68, -0.25, M.fabricRed);

  // ── Dekoratif Sutun ────────────────────────────
  cyl(g, 0.2, 0.2, GM_BH - 0.5, 12, M.white, 0, 3.05, -1);
}
