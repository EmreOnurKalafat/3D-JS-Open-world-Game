// assets/complexes/supermarket/modules/parking.js
// S7 — Parking lot: asphalt, parallel stalls, lamps, parked cars
// 6m depth — fits within 60m building block (building 50m + parking 6m = 56m)

import * as THREE from 'three';
import {
  SM_W, SM_D, WT,
  smx, smz,
  MODULE_SRC_PREFIX,
} from '../constants.js';
import { M } from '../materials.js';
import { b, slab, placePrefab } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';

const SRC = MODULE_SRC_PREFIX + '/parking.js';

function buildParkedCar(color) {
  const car = new THREE.Group();
  car.userData.sourceFile = SRC;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.7, 1.8),
    new THREE.MeshLambertMaterial({ color }),
  );
  body.position.y = 0.35;
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.45, 1.6),
    new THREE.MeshLambertMaterial({ color: 0x8899bb, transparent: true, opacity: 0.45 }),
  );
  cabin.position.set(-0.2, 0.92, 0);
  cabin.castShadow = true;
  car.add(cabin);

  const wheelR = 0.28, wheelW = 0.22;
  const wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 10);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  for (const [wx, wy, wz] of [
    [-1.15, wheelR, -0.95], [1.15, wheelR, -0.95],
    [-1.15, wheelR,  0.95], [1.15, wheelR,  0.95],
  ]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    car.add(wheel);
  }

  return car;
}

/**
 * @param {THREE.Group} g
 * @param {Array<{x:number, z:number, type:string, color:THREE.Color, quat:THREE.Quaternion}>} [collectCars]
 * @param {Array<{x:number, z:number, rotY:number}>} [collectLamps]
 */
export function buildParking(g, collectCars = null, collectLamps = null) {
  // 6m deep parking zone south of building
  const parkZ_top = -(SM_D + 1);       // z = -23
  const parkZ_bot = -(SM_D + 5);       // z = -27 (4m depth, clears south sidewalk)
  const parkDepth = 4;
  const parkW     = SM_W * 2 + 4;      // 44 m
  const parkCz    = -25;

  /* ── Asphalt ──────────────────────────────────────────────── */
  slab(g, parkW, parkDepth, 0, 0.08, parkCz, M.asphalt);

  /* ── Curbs ────────────────────────────────────────────────── */
  const curbH = 0.18, curbW = 0.35;
  b(g, parkW, curbH, curbW, 0, curbH / 2, parkZ_top, M.curb);
  b(g, parkW, curbH, curbW, 0, curbH / 2, parkZ_bot, M.curb);
  b(g, curbW, curbH, parkDepth, -(SM_W + 2), curbH / 2, parkCz, M.curb);
  b(g, curbW, curbH, parkDepth,  (SM_W + 2), curbH / 2, parkCz, M.curb);

  /* ── Parallel parking stalls ──────────────────────────────── */
  const rowZ = parkCz + 0.5;          // z ≈ -24.5
  const stallLen = 5.3;

  const westStalls = [-16.5, -11.2, -5.9];   // 3 stalls west of centre
  const eastStalls = [5.9, 11.2, 16.5];       // 3 stalls east of centre
  const allStalls  = [...westStalls, ...eastStalls];

  for (const cx of allStalls) {
    b(g, 0.06, 0.004, 1.5, cx - stallLen / 2, 0.03, rowZ, M.stripeW);
    b(g, 0.06, 0.004, 1.5, cx + stallLen / 2, 0.03, rowZ, M.stripeW);
  }

  // Line along south curb
  b(g, parkW - 2, 0.004, 0.08, 0, 0.03, parkZ_bot + 0.3, M.stripeW);

  /* ── Disabled bay (far west) ──────────────────────────────── */
  const disX = -SM_W + 1.5;
  b(g, 0.06, 0.005, 1.5, disX - stallLen / 2, 0.035, rowZ, M.stripeBlue);
  b(g, 0.06, 0.005, 1.5, disX + stallLen / 2, 0.035, rowZ, M.stripeBlue);
  b(g, 1.2, 0.006, 1.2, disX, 0.04, rowZ, M.stripeBlue);

  /* ── Pedestrian crossing to entrance ──────────────────────── */
  for (let i = 0; i < 3; i++) {
    b(g, 0.5, 0.005, 0.7, 0, 0.03, parkZ_top - 0.4 - i * 1.8, M.stripeW);
  }

  /* ── Street lamps (3 adet) ────────────────────────────────── */
  const lampSpots = [
    { x: -(SM_W + 1), z: parkZ_top + 0.5 },
    { x:  (SM_W + 1), z: parkZ_top + 0.5 },
    { x: 0,            z: parkZ_bot + 1.0 },
  ];
  if (collectLamps) {
    for (const ls of lampSpots) {
      collectLamps.push({ x: smx(ls.x), z: smz(ls.z), rotY: 0 });
    }
  } else {
    for (const ls of lampSpots) {
      const lamp = createSokakLambasi();
      placePrefab(g, lamp, ls.x, 0, ls.z, 0);
    }
  }

  /* ── Parked cars (5 adet) ─────────────────────────────────── */
  const carColors = [0x2255cc, 0xdd3333, 0xeeeeee, 0x333333, 0xff6600];
  const parked = [
    { x: westStalls[0], z: rowZ, ry: -Math.PI / 2 },
    { x: westStalls[2], z: rowZ, ry: -Math.PI / 2 },
    { x: eastStalls[0], z: rowZ, ry:  Math.PI / 2 },
    { x: eastStalls[1], z: rowZ, ry:  Math.PI / 2 },
    { x: eastStalls[2], z: rowZ, ry:  Math.PI / 2 },
  ];

  if (collectCars) {
    for (let i = 0; i < parked.length; i++) {
      const pc = parked[i];
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pc.ry, 0));
      collectCars.push({
        x: smx(pc.x), z: smz(pc.z),
        type: 'sedan',
        color: new THREE.Color(carColors[i]),
        quat,
      });
    }
  } else {
    for (let i = 0; i < parked.length; i++) {
      const pc = parked[i];
      const carGroup = buildParkedCar(carColors[i]);
      placePrefab(g, carGroup, pc.x, 0, pc.z, pc.ry);
    }
  }

  console.log('[PARKING] Built — 6 parallel stalls + 1 disabled, 3 lamps, 5 cars (4m depth)');
}
