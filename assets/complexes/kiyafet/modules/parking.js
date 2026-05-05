// assets/complexes/kiyafet/modules/parking.js — Kucuk otopark
import * as THREE from 'three';
import { GM_W, GM_D, gmx, gmz } from '../constants.js';
import { M } from '../materials.js';
import { b, slab, placePrefab } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';

/**
 * Build a small 6-car parking lot south of the store.
 * @param {THREE.Group} g
 * @param {Array<{x:number, z:number, type:string, color:THREE.Color, quat:THREE.Quaternion}>} [collectCars]
 * @param {Array<{x:number, z:number, rotY:number}>} [collectLamps]
 */
export function buildParking(g, collectCars = null, collectLamps = null) {

  const parkZ_top = -(GM_D + 1);    // z = -11 (binanin 1m guneyi)
  const parkZ_bot = -(GM_D + 6);    // z = -16 (5m derinlik)
  const parkW = GM_W * 2;           // 28m genislik
  const parkCz = (parkZ_top + parkZ_bot) / 2; // -13.5
  const parkD = 5;

  // ── Asfalt Zemin ──────────────────────────────
  slab(g, parkW, parkD, 0, 0.05, parkCz, M.asphalt);

  // ── Park Cizgileri (6 park yeri, 2.4m aralikli) ──
  const stallW = 2.4;
  const startX = -parkW / 2 + 1;
  for (let i = 0; i < 6; i++) {
    const sx = startX + i * stallW + stallW / 2;
    b(g, stallW - 0.2, 0.005, parkD - 0.3, sx, 0.095, parkCz, M.curb);
  }

  // ── Engelli Parki (en batida, mavi isaret) ────
  b(g, 1.2, 0.006, 1.2, -parkW / 2 + 2, 0.095, parkCz - 1.5, M.fabricBlue);

  // ── Park Etmis Arabalar (3 adet) ──────────────
  const carColors = [M.fabricRed, M.fabricBlue, M.white];
  const carXs = [-8, 0, 8];
  if (collectCars) {
    for (let i = 0; i < 3; i++) {
      const quat = new THREE.Quaternion(); // identity = facing +Z
      collectCars.push({
        x: gmx(carXs[i]), z: gmz(parkCz),
        type: 'sedan',
        color: new THREE.Color(carColors[i].color || carColors[i]),
        quat,
      });
    }
  } else {
    for (let i = 0; i < 3; i++) {
      b(g, 4.0, 1.2, 2.0, carXs[i], 0.69, parkCz, carColors[i]);
      b(g, 2.2, 0.6, 1.8, carXs[i] - 0.2, 1.59, parkCz, M.glass);
      b(g, 0.6, 0.5, 0.3, carXs[i] - 1.2, 0.30, parkCz - 0.8, M.metalDark);
      b(g, 0.6, 0.5, 0.3, carXs[i] + 1.2, 0.30, parkCz - 0.8, M.metalDark);
      b(g, 0.6, 0.5, 0.3, carXs[i] - 1.2, 0.30, parkCz + 0.8, M.metalDark);
      b(g, 0.6, 0.5, 0.3, carXs[i] + 1.2, 0.30, parkCz + 0.8, M.metalDark);
    }
  }

  // ── Sokak Lambalari (2 adet) ─────────────────
  if (collectLamps) {
    collectLamps.push({ x: gmx(-(parkW / 2 - 2)), z: gmz(parkCz + 2.5), rotY: 0 });
    collectLamps.push({ x: gmx(+(parkW / 2 - 2)), z: gmz(parkCz + 2.5), rotY: Math.PI });
  } else {
    const lamp1 = createSokakLambasi();
    placePrefab(g, lamp1, -(parkW / 2 - 2), 0, parkCz + 2.5, 0);
    const lamp2 = createSokakLambasi();
    placePrefab(g, lamp2, +(parkW / 2 - 2), 0, parkCz + 2.5, Math.PI);
  }
}
