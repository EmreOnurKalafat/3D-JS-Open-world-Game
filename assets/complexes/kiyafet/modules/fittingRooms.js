// assets/complexes/kiyafet/modules/fittingRooms.js — Soyunma kabinleri
import { GM_W, GM_D, GM_BH, WT } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, ptl, placePrefab } from './helpers.js';
import { createSoyunmaKabini } from '../../../props/kiyafet/soyunmaKabini.js';
import { createBuyukAyna } from '../../../props/kiyafet/buyukAyna.js';

/** Build 4 fitting rooms on the east side, plus waiting area with mirror */
export function buildFittingRooms(g, physicsBodies) {

  // ── Soyunma Kabinleri (dogu taraf, x=11.4, kapilar batiya) ──
  const kabinX = 11.4;
  const cabinZs = [-2, 1, 5, 8]; // 4 kabin Z pozisyonlari

  for (const cz of cabinZs) {
    const kabin = createSoyunmaKabini();
    placePrefab(g, kabin, kabinX, 0.30, cz, 0); // kapi batiya (default)

    // Ic aydinlatma
    ptl(g, 0xfff5e8, 0.3, 2, kabinX, 2.0, cz);

    // Kabin duvarlarina fizik body ekle (sadece arka duvar)
    const arkaW = 1.2, arkaH = 2.2, arkaD = 0.03;
    const proxy = wb(g, arkaW, arkaH, arkaD, kabinX, 1.40, cz, M.floorConc, 0, physicsBodies);
    proxy.visible = false;
    // Yan duvarlar
    const yanW = 0.03, yanD = 1.2;
    const proxyL = wb(g, yanW, arkaH, yanD, kabinX - 0.6, 1.40, cz, M.floorConc, 0, physicsBodies);
    proxyL.visible = false;
    const proxyR = wb(g, yanW, arkaH, yanD, kabinX + 0.6, 1.40, cz, M.floorConc, 0, physicsBodies);
    proxyR.visible = false;
  }

  // ── Buyuk Ayna (dogu duvarinda, bekleme alani) ──
  const ayna = createBuyukAyna();
  placePrefab(g, ayna, 13.7, 0.30, 3, -Math.PI / 2); // Batiya bakar

  // ── Bekleme Koltugu ────────────────────────────
  b(g, 2.5, 0.5, 0.5, 13, 0.55, 2, M.cabinWood);
  b(g, 2.3, 0.06, 0.4, 13, 0.83, 2, M.fabricRed);
}
