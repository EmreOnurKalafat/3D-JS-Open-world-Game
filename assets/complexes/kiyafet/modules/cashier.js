// assets/complexes/kiyafet/modules/cashier.js — Kasa bankosu
import { M } from '../materials.js';
import { b, placePrefab } from './helpers.js';
import { createKasaBankosu } from '../../../props/kiyafet/kasaBankosu.js';
import { createYazarkasa } from '../../../props/market/yazarkasa.js';
import { createPosCihazi } from '../../../props/market/posCihazi.js';

/** Build the cashier counter with register, POS, and gift-wrap corner */
export function buildCashier(g) {

  // ── Kasa Bankosu (arka tarafta, z=+7.5, guneye — musteriye bakar) ──
  const banko = createKasaBankosu();
  placePrefab(g, banko, 0, 0.30, 7.5, Math.PI); // 180° — guneye donuk

  // Yazarkasa (banko uzerinde, sol taraf)
  const yk = createYazarkasa();
  placePrefab(g, yk, -0.4, 1.09, 7.5, 0);

  // POS cihazi (banko uzerinde, sag taraf)
  const pos = createPosCihazi();
  placePrefab(g, pos, 0.6, 1.09, 7.5, 0);

  // ── Hediye Paketi Kosesi (bankonun dogusunda, z=+7, x=+4) ──
  b(g, 1.5, 0.8, 0.8, 4, 0.70, 7, M.accent);
  // Hediye paketi simgesi
  b(g, 0.3, 0.3, 0.3, 4, 1.15, 7, M.fabricRed);
  // Kucuk kurdele
  b(g, 0.1, 0.3, 0.05, 4, 1.3, 7 + 0.16, M.signGold);
  b(g, 0.3, 0.05, 0.05, 4, 1.3 + 0.02, 7, M.signGold);
}
