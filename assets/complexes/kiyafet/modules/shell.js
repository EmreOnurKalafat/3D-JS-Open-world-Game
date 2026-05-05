// assets/complexes/kiyafet/modules/shell.js — Bina dis kabugu
import { GM_W, GM_D, GM_BH, WT, MAIN_W } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab } from './helpers.js';

/** Build the exterior shell: floors, 4 walls, vitrin glass, sign, parapet, roof, HVAC */
export function buildShell(g, physicsBodies) {

  // ── Fizik Zemini (gorunmez) ──────────────────
  const pf = wb(g, GM_W * 2, 0.10, GM_D * 2, 0, 0.08, 0, M.floorConc, 0, physicsBodies);
  pf.visible = false;

  // ── Ic Zemin (gorunur) ───────────────────────
  const innerW = GM_W * 2 - WT * 2;   // 27.4m ic genislik
  const innerD = GM_D * 2 - WT * 2;   // 19.4m ic derinlik

  // Giris holu: krem karo (guney 4m)
  slab(g, innerW, 4, 0, 0.30, -(GM_D - 2), M.floorTile);
  // Ana satis alani: ahsap parke (kalan derinlik)
  const woodD = innerD - 4;          // 15.4m
  slab(g, innerW, woodD, 0, 0.30, 2, M.floorWood);

  // ── 4 Dis Duvar ──────────────────────────────

  // --- Guney Duvar (on cephe) — vitrin bosluklu ---
  const wallZ = -(GM_D + WT / 2);     // -10.15
  const panelHw = (GM_W - MAIN_W / 2) / 2; // (14 - 2) / 2 = 6 → her panel 8m
  const panelW = panelHw * 2;          // 8m
  const panelCx = panelHw + MAIN_W / 2; // 6 + 2 = 8 → |center x| = 8... wait

  // Vitrin: x=-6 … +6 (12m bosluk). Sol panel: -14 … -6, Sag panel: +6 … +14
  const vitrinHalf = 6;
  const leftW = GM_W - vitrinHalf;     // 14 - 6 = 8m
  const leftCx = -(vitrinHalf + leftW / 2); // -(6 + 4) = -10
  wb(g, leftW, GM_BH, WT, leftCx, GM_BH / 2, wallZ, M.wallExt, 0, physicsBodies);

  const rightCx = vitrinHalf + leftW / 2;  // 6 + 4 = 10
  wb(g, leftW, GM_BH, WT, rightCx, GM_BH / 2, wallZ, M.wallExt, 0, physicsBodies);

  // --- Kuzey Duvar (tam, bosluksuz) ---
  const wallN = GM_D + WT / 2;           // +10.15
  const northWallW = GM_W * 2 - WT * 2;  // 27.4m
  wb(g, northWallW, GM_BH, WT, 0, GM_BH / 2, wallN, M.wallExt, 0, physicsBodies);

  // --- Bati Duvar (tam) ---
  const wallWx = -(GM_W + WT / 2);       // -14.15
  const sideWallD = GM_D * 2 - WT * 2;   // 19.4m
  wb(g, WT, GM_BH, sideWallD, wallWx, GM_BH / 2, 0, M.wallExt, 0, physicsBodies);

  // --- Dogu Duvar (personel kapisi bosluklu, z=8.5…10) ---
  const wallEx = GM_W + WT / 2;          // +14.15
  const eastGapStart = GM_D - 1.5;       // 8.5 (kapinin guney kenari)
  const southSegD = eastGapStart - (-GM_D); // 8.5 - (-10) = 18.5m
  const southSegCz = (-GM_D + eastGapStart) / 2; // (-10 + 8.5) / 2 = -0.75
  wb(g, WT, GM_BH, southSegD, wallEx, GM_BH / 2, southSegCz, M.wallExt, 0, physicsBodies);
  // Kuzey segment: kapinin ustunde bir sey yok (kapi kosede, 0m segment)

  // ── Vitrin Cami (on cephe, 12m genislik) ─────
  const vitrinH = 4.5;
  const vitrinY = vitrinH / 2;           // 2.25
  // Cam, duvar dis yuzeyine yerlestirilir
  const glassZ = -(GM_D - WT / 2 + 0.08); // -(10 - 0.15 + 0.08) = -9.93
  const glassW = vitrinHalf * 2 - 0.6;    // 12 - 0.6 = 11.4m
  b(g, glassW, vitrinH, 0.04, 0, vitrinY, glassZ, M.glass);

  // Vitrin cercevesi: alt + ust + sol + sag metal profil
  const frameD = 0.06, frameT = WT;
  // Alt profil
  b(g, glassW, 0.06, frameT, 0, 0.03, glassZ + 0.03, M.metal);
  // Ust profil
  b(g, glassW, 0.06, frameT, 0, vitrinH, glassZ + 0.03, M.metal);
  // Sol profil
  b(g, 0.06, vitrinH, frameT, -(glassW / 2), vitrinY, glassZ + 0.03, M.metal);
  // Sag profil
  b(g, 0.06, vitrinH, frameT, +(glassW / 2), vitrinY, glassZ + 0.03, M.metal);

  // ── Tabela (on cephe ustu) ───────────────────
  const signW = 12, signH = 1.0;
  const signZ = -(GM_D - WT / 2 + 0.5);  // -10.35 (duvar disina tasar)
  b(g, signW, signH, 0.3, 0, GM_BH - signH / 2 + 0.2, signZ, M.signBg);
  // Altin rengi ince serit (yazi efekti)
  b(g, 10, 0.08, 0.32, 0, GM_BH - signH / 2 + 0.4, signZ + 0.02, M.signGold);

  // ── Parapet (cati etrafi, 0.6m yukseklik) ────
  const ppH = 0.6, ppT = WT;
  const ppY = GM_BH + ppH / 2;          // 6.3
  const ppOuterW = GM_W * 2 + ppT;       // 28.3m (dis kenardan dis kenara)
  const ppOuterD = GM_D * 2 + ppT;       // 20.3m
  const ppOuterX = 0, ppOuterZ = 0;      // merkezde

  // Kuzey parapet
  wb(g, ppOuterW, ppH, ppT, 0, ppY, GM_D + ppT / 2, M.wallExt, 0, physicsBodies);
  // Guney parapet (vitrin ustunde bosluk YOK — parapet tam)
  wb(g, ppOuterW, ppH, ppT, 0, ppY, -(GM_D + ppT / 2), M.wallExt, 0, physicsBodies);
  // Bati parapet
  wb(g, ppT, ppH, ppOuterD, -(GM_W + ppT / 2), ppY, 0, M.wallExt, 0, physicsBodies);
  // Dogu parapet
  wb(g, ppT, ppH, ppOuterD, +(GM_W + ppT / 2), ppY, 0, M.wallExt, 0, physicsBodies);

  // ── Cati ──────────────────────────────────────
  const roofY = GM_BH + WT / 2 + 0.02;  // 6.17
  slab(g, GM_W * 2 + 0.6, GM_D * 2 + 0.6, 0, roofY, 0, M.floorConc);

  // ── HVAC Kutulari (cati ustunde) ──────────────
  b(g, 2.5, 1.2, 2.0, -4, roofY + 0.65, 3, M.metalDark);
  b(g, 2.0, 1.0, 1.8, 5, roofY + 0.55, -4, M.metalDark);
}
