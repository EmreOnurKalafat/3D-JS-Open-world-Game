// assets/complexes/kiyafet/modules/backroom.js — Arka depo
import { GM_W, GM_D, GM_BH, WT } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, placePrefab } from './helpers.js';
import { createKoliKutu } from '../../../props/market/koliKutu.js';
import { createRafUnitesi } from '../../../props/kiyafet/rafUnitesi.js';
import { createYanginSondurucu } from '../../../props/market/yanginSondurucu.js';

const FL = 0.30;

/** Build the backroom storage area in the northwest corner */
export function buildBackroom(g, physicsBodies) {

  // Depo alani: x = -14 … -6, z = +5 … +10 (8m × 5m)
  const divX = -6;
  const depoW = GM_W - Math.abs(divX);  // 14 - 6 = 8m
  const depoD = GM_D - 5;               // 10 - 5 = 5m
  const depoCx = -(GM_W - depoW / 2);   // -(14 - 4) = -10
  const depoCz = 5 + depoD / 2;         // 7.5

  // ── Bolme Duvari (x=-6'da, z=+5 … +10, kapi bosluklu) ──
  const doorCz = 7.5, doorHalf = 0.5;
  const wallH = GM_BH - FL;             // 5.70 — floor-to-ceiling
  const wallCy = FL + wallH / 2;        // 3.15

  // Guney segment: z = +5 … +7 (2m)
  const seg1D = doorCz - doorHalf - 5;   // 7 - 5 = 2m
  const seg1Cz = 5 + seg1D / 2;          // 6
  wb(g, WT, wallH, seg1D, divX, wallCy, seg1Cz, M.wallInt, 0, physicsBodies);

  // Kuzey segment: z = +8 … +10 (2m)
  const seg2D = 10 - (doorCz + doorHalf); // 10 - 8 = 2m
  const seg2Cz = 10 - seg2D / 2;          // 9
  wb(g, WT, wallH, seg2D, divX, wallCy, seg2Cz, M.wallInt, 0, physicsBodies);

  // ── Depo Zemini (beton) ───────────────────────
  slab(g, depoW, depoD, depoCx, 0.31, depoCz, M.floorConc);

  // ── Stok Kutulari ─────────────────────────────
  const koli1 = createKoliKutu(); placePrefab(g, koli1, -12, 0.31, 8, 0);
  const koli2 = createKoliKutu(); placePrefab(g, koli2, -12, 0.86, 8, 0);
  const koli3 = createKoliKutu(); placePrefab(g, koli3, -10, 0.31, 6, 0.3);
  const koli4 = createKoliKutu(); placePrefab(g, koli4, -10, 0.86, 6, 0.3);

  // ── Raf Unitesi (kuzey duvarinda) ─────────────
  const raf = createRafUnitesi();
  placePrefab(g, raf, -2, 0.31, 9, Math.PI / 2);

  // ── Personel Askisi (bati duvarinda, basit bar) ──
  b(g, 1.5, 0.04, 0.05, -13.5, 1.7, 8, M.metal);

  // ── Yangin Sondurucu (depo girisinde) ──────────
  const ys = createYanginSondurucu();
  placePrefab(g, ys, divX + 0.4, 1.0, 5.5, -Math.PI / 2);
}
