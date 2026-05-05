// assets/complexes/supermarket/modules/fresh_produce.js
// S5 — Fresh Produce: open coolers on west wall, produce stand SW corner.
// 4 coolers (west wall), 2 freezers (east island), produce stand.

import * as THREE from 'three';
import {
  SM_W,
} from '../constants.js';
import { b, placePrefab } from './helpers.js';
import { createSogutucuAcik } from '../../../props/market/sogutucuAcik.js';
import { createDondurucuCamli } from '../../../props/market/dondurucuCamli.js';
import { createManavTezgahi } from '../../../props/market/manavTezgahi.js';

export function buildFreshProduce(g) {
  /* ── Open coolers — west wall, 4 units ────────────────────── */
  // Sogutucu: 2.0w × 1.8h × 1.0d, placed flush against west wall
  const coolerX = -(SM_W - 0.5);        // x = -19.5 (0.2m from wall interior face)
  const coolerZs = [-8, 0, 8, 16];      // evenly spaced along west wall

  for (const z of coolerZs) {
    const cooler = createSogutucuAcik();
    cooler.rotation.y = Math.PI / 2;    // face east into store
    placePrefab(g, cooler, coolerX, 0, z, Math.PI / 2);
  }

  /* ── Glass-door freezers — east island, 2 units ───────────── */
  // Placed between aisles (x=+8.6) and divider wall (x=+12)
  // Freezer is 1.0w × 2.18h × 0.7d, faces west into store
  const freezerX = 10;
  const freezerZs = [2, 14];

  for (const z of freezerZs) {
    const freezer = createDondurucuCamli();
    placePrefab(g, freezer, freezerX, 0, z, 0);  // face west into store
  }

  /* ── Produce stand — south-west corner ──────────────────── */
  // 3.0w × 1.34h × 1.2d, placed south of cooler line
  const standX = -17;
  const standZ = -15;

  const tezgah = createManavTezgahi();
  placePrefab(g, tezgah, standX, 0, standZ, 0);  // faces south

  // Fruit crates on stand (simple boxes as decoration)
  const crateColors = [0xff6622, 0xffcc00, 0x44bb44, 0xcc3333];
  for (let i = 0; i < 4; i++) {
    const crateMat = new THREE.MeshLambertMaterial({ color: crateColors[i] });
    b(g, 0.35, 0.12, 0.3,
      standX - 0.5 + i * 0.35, 1.06, standZ + 0.1 + (i % 2) * 0.25,
      crateMat);
  }

  console.log('[FRESH_PRODUCE] Built — 4 coolers (west), 2 freezers (east island), produce stand (SW)');
}
