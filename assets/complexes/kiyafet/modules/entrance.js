// assets/complexes/kiyafet/modules/entrance.js — Giris ve vitrin ici
import { GM_W, GM_D, GM_BH, WT } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, cyl, ptl, placePrefab } from './helpers.js';
import { createKapiCam } from '../../../props/kiyafet/kapiCam.js';
import { createManken } from '../../../props/kiyafet/manken.js';

const FL = 0.30; // interior floor Y

/** Build entrance: glass doors, vitrin mannequins, entrance hall, spot lights */
export function buildEntrance(g, physicsBodies) {

  // ── Ana Giris Kapilari (vitrin cami arkasinda, x=±1.2) ──
  const doorZ = -(GM_D - 0.5);          // -9.5 — vitrinin hemen arkasinda
  const door1 = createKapiCam();
  placePrefab(g, door1, -1.2, FL, doorZ, 0);
  const door2 = createKapiCam();
  placePrefab(g, door2, +1.2, FL, doorZ, 0);

  // Kapi cerceve dikmeleri (2 adet, kapilarin dis yanlarinda)
  const frameX = 1.8, frameH = 2.8;
  const pillarCy = FL + frameH / 2;     // 1.70 — dikme merkezi zeminde baslar
  wb(g, 0.1, frameH, 0.12, -frameX, pillarCy, doorZ, M.metal, 0, physicsBodies);
  wb(g, 0.1, frameH, 0.12, +frameX, pillarCy, doorZ, M.metal, 0, physicsBodies);
  // Ust lent
  wb(g, frameX * 2, 0.1, 0.15, 0, FL + frameH, doorZ, M.metal, 0, physicsBodies);

  // ── Giris Paspasi (ince, 5mm) ──────────────────
  b(g, 4, 0.005, 2, 0, FL + 0.045, -(GM_D - 2), M.floorConc);

  // ── Manken Platformu (giris holunde, z=-7) ──────
  const platZ = -7, platW = 14, platD = 2, platH = 0.15;
  const platTop = FL + platH;            // 0.45 — platform ust yuzeyi
  b(g, platW, platH, platD, 0, FL + platH / 2, platZ, M.accent);

  // 3 manken platform uzerinde (platform ust yuzeyinde)
  const manken1 = createManken('armsOut');
  placePrefab(g, manken1, -6, platTop, platZ, 0.2);
  const manken2 = createManken('straight');
  placePrefab(g, manken2,  0, platTop, platZ, 0);
  const manken3 = createManken('oneArmUp');
  placePrefab(g, manken3, +6, platTop, platZ, -0.2);

  // ── Vitrin Ici Mankenler (camin hemen arkasinda, distan gorunur) ──
  const vitrinZ = -(GM_D - 1.5);        // -8.5 — vitrin camina yakin
  const vm1 = createManken('armsOut');
  placePrefab(g, vm1, -4, FL, vitrinZ, 0.2);
  const vm2 = createManken('straight');
  placePrefab(g, vm2,  0, FL, vitrinZ, 0);
  const vm3 = createManken('oneArmUp');
  placePrefab(g, vm3, +4, FL, vitrinZ, -0.2);

  // ── Giris Yani Dekor ────────────────────────────

  // Bati duvarinda buyuk ayna (2m × 1.5m)
  const aynaX = -(GM_W - 0.3);
  b(g, 2.0, 1.5, 0.04, aynaX, 1.25, doorZ + 1, M.glass);
  b(g, 0.06, 1.5, 0.06, aynaX - 1, 1.25, doorZ + 1, M.metal); // sol cerceve
  b(g, 0.06, 1.5, 0.06, aynaX + 1, 1.25, doorZ + 1, M.metal); // sag cerceve

  // Dogu duvarinda sepet/cantalar icin raf
  const rafX = GM_W - 0.3;
  b(g, 1.5, 0.04, 0.4, rafX, 1.0, doorZ + 1, M.rack);
  // Raf ayaklari (zeminde baslar)
  const legCy = FL + 0.5;               // 0.80 — silindir merkezi
  cyl(g, 0.03, 0.03, 1.0, 8, M.metal, rafX - 0.6, legCy, doorZ + 1.2);
  cyl(g, 0.03, 0.03, 1.0, 8, M.metal, rafX + 0.6, legCy, doorZ + 1.2);
}
