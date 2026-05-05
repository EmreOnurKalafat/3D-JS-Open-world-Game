// assets/complexes/kiyafet/modules/lighting.js — Ic/dis mekan aydinlatmasi (optimize)
import { GM_W, GM_D, GM_BH } from '../constants.js';
import { ptl } from './helpers.js';

/** Add essential interior + exterior lighting only */
export function buildLighting(g) {

  // ── Vitrin Spotlari (mankenlerin uzerinde, 3 adet) ──
  const vitrinZ = -(GM_D - 1.5);
  ptl(g, 0xfff8ee, 0.4, 8, -4, 5.5, vitrinZ);
  ptl(g, 0xfff8ee, 0.4, 8,  0, 5.5, vitrinZ);
  ptl(g, 0xfff8ee, 0.4, 8, +4, 5.5, vitrinZ);

  // ── Kasa Alani Spot ────────────────────────────
  ptl(g, 0xfff8ee, 0.35, 8, 0, 5.5, 7.5);

  // ── Tabela Arkasi Wall-Wash ────────────────────
  ptl(g, 0xffdd88, 0.5, 8, 0, GM_BH - 0.5, -(GM_D + 0.5));

  // ── Vitrin Alti LED Serit (tek merkezi isik) ───
  ptl(g, 0xccddff, 0.4, 5, 0, 0.2, -(GM_D - 0.8));
}
