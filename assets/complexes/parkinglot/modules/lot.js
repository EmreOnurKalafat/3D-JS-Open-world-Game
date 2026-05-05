// assets/complexes/parkinglot/modules/lot.js — Acik otopark (hastane stili cizgiler + ic cevre cit)
import * as THREE from 'three';
import { PL_W, PL_D, plx, plz } from '../constants.js';
import { M } from '../materials.js';
import { b, wb, slab, cyl, ptl, placePrefab } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';
import { createAgac } from '../../../props/outdoor/agac.js';
import { createCitFenceRun } from '../../../props/outdoor/cit.js';
import { createSedan } from '../../../vehicles/sedan.js';
import { createSuv } from '../../../vehicles/suv.js';

const STALL_W = 3.0;
const STALL_D = 5.5;
const STALLS_PER_ROW = 5;
const AISLE_W = 6.5;
const ENTRANCE_W = 8.0;

export function buildLot(g, physicsBodies, collectCars = null, collectLamps = null, collectTrees = null) {

  // ── Asfalt zemin ───────────────────────────────
  slab(g, PL_W * 2, PL_D * 2, 0, 0.05, 0, M.asphalt);

  // ── Bordur ─────────────────────────────────────
  const curbH = 0.15, curbT = 0.3, cTop = 0.05 + curbH / 2;
  const halfGap = ENTRANCE_W / 2;

  // Guney bordur (giris bosluklu)
  b(g, PL_W - halfGap, curbH, curbT, -(PL_W + halfGap) / 2, cTop, -(PL_D + curbT / 2), M.curb);
  b(g, PL_W - halfGap, curbH, curbT, +(PL_W + halfGap) / 2, cTop, -(PL_D + curbT / 2), M.curb);
  // Kuzey bordur (giris bosluklu)
  b(g, PL_W - halfGap, curbH, curbT, -(PL_W + halfGap) / 2, cTop, +(PL_D + curbT / 2), M.curb);
  b(g, PL_W - halfGap, curbH, curbT, +(PL_W + halfGap) / 2, cTop, +(PL_D + curbT / 2), M.curb);
  // Dogu ve bati — tam
  b(g, curbT, curbH, PL_D * 2, -(PL_W + curbT / 2), cTop, 0, M.curb);
  b(g, curbT, curbH, PL_D * 2, +(PL_W + curbT / 2), cTop, 0, M.curb);

  // ── Ic cevre citleri (bordur hemen icinde) ────
  const fenceInset = 12.5;
  const fenceX = PL_W;
  const fenceZ = PL_D;

  // Guney-dogu
  const f1 = createCitFenceRun({ axis: 'x', start: -(fenceX), end: -halfGap - 0.3, fixedCoord: -(fenceZ), fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f1, (-fenceX + (-halfGap - 0.3)) / 2, 0, -fenceZ, 0);
  // Guney-bati
  const f2 = createCitFenceRun({ axis: 'x', start: halfGap + 0.3, end: fenceX, fixedCoord: -(fenceZ), fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f2, (halfGap + 0.3 + fenceX) / 2, 0, -fenceZ, 0);
  // Kuzey-dogu
  const f3 = createCitFenceRun({ axis: 'x', start: -(fenceX), end: -halfGap - 0.3, fixedCoord: fenceZ, fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f3, (-fenceX + (-halfGap - 0.3)) / 2, 0, fenceZ, 0);
  // Kuzey-bati
  const f4 = createCitFenceRun({ axis: 'x', start: halfGap + 0.3, end: fenceX, fixedCoord: fenceZ, fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f4, (halfGap + 0.3 + fenceX) / 2, 0, fenceZ, 0);
  // Dogu (tam)
  const f5 = createCitFenceRun({ axis: 'z', start: -(fenceZ), end: fenceZ, fixedCoord: fenceX, fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f5, fenceX, 0, 0, 0);
  // Bati (tam)
  const f6 = createCitFenceRun({ axis: 'z', start: -(fenceZ), end: fenceZ, fixedCoord: -(fenceX), fenceHeight: 2.0, postSpacing: 1.5 });
  placePrefab(g, f6, -(fenceX), 0, 0, 0);

  // ── Park siralari ──────────────────────────────
  const southEdge = -PL_D + 2.5;
  const row0Z = southEdge + STALL_D / 2;
  const row1Z = row0Z + STALL_D + AISLE_W;

  const northEdge = PL_D - 2.5;
  const row3Z = northEdge - STALL_D / 2;
  const row2Z = row3Z - STALL_D - AISLE_W;

  const rowStartX = -(STALLS_PER_ROW * STALL_W) / 2;

  // Hastane stili: sadece cizgiler, dolgu yok
  drawStallLines(g, row0Z, rowStartX, STALL_W, STALL_D, STALLS_PER_ROW, false);
  drawStallLines(g, row1Z, rowStartX, STALL_W, STALL_D, STALLS_PER_ROW, true);
  drawStallLines(g, row2Z, rowStartX, STALL_W, STALL_D, STALLS_PER_ROW, false);
  drawStallLines(g, row3Z, rowStartX, STALL_W, STALL_D, STALLS_PER_ROW, true);

  // Sari surus yolu seritleri
  const aisle0Z = (row0Z + row1Z) / 2;
  const aisle1Z = (row2Z + row3Z) / 2;
  for (let i = 0; i < 4; i++) {
    slab(g, 0.15, 1.4, -6 + i * 2.8, 0.07, aisle0Z, M.stripeY);
    slab(g, 0.15, 1.4, -6 + i * 2.8, 0.07, aisle1Z, M.stripeY);
  }

  // ── Park etmis araclar (6 adet) ─────────────────
  const cars = [
    { z: row0Z, col: 0, rotY: 0, fn: createSedan, hue: 0 },
    { z: row0Z, col: 2, rotY: 0, fn: createSuv, hue: 210 },
    { z: row0Z, col: 4, rotY: 0, fn: createSedan, hue: 30 },
    { z: row1Z, col: 1, rotY: Math.PI, fn: createSedan, hue: 280 },
    { z: row3Z, col: 2, rotY: Math.PI, fn: createSedan, hue: 45 },
    { z: row3Z, col: 4, rotY: Math.PI, fn: createSuv, hue: 120 },
  ];

  for (const c of cars) {
    const cx = rowStartX + c.col * STALL_W + STALL_W / 2;
    if (collectCars) {
      const carHue = c.hue !== undefined ? c.hue : 0;
      const carColor = new THREE.Color().setHSL(carHue / 360, 0.7, 0.45);
      collectCars.push({
        x: plx(cx), z: plz(c.z),
        type: c.fn === createSuv ? 'suv' : 'sedan',
        color: carColor,
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, c.rotY, 0)),
      });
    } else {
      const v = c.fn(c.hue);
      placePrefab(g, v, cx, 0, c.z, c.rotY);
    }
  }

  // ── Bekci kulubesi ──────────────────────────────
  buildBooth(g, physicsBodies);

  // ── Giris bariyerleri (cift serit, acik) ────────
  buildBarrier(g, -3.5, -(PL_D - 1.0), 0);
  buildBarrier(g, +3.5, -(PL_D - 1.0), 0);
  buildBarrier(g, -3.5, PL_D - 1.0, Math.PI);
  buildBarrier(g, +3.5, PL_D - 1.0, Math.PI);

  // ── Sokak lambalari (4) ─────────────────────────
  const lampPositions = [
    [-PL_W + 1.5, -PL_D + 3, 0],
    [PL_W - 1.5, -PL_D + 3, Math.PI],
    [-PL_W + 1.5, PL_D - 3, 0],
    [PL_W - 1.5, PL_D - 3, Math.PI],
  ];
  if (collectLamps) {
    for (const [lx, lz, ry] of lampPositions) {
      collectLamps.push({ x: plx(lx), z: plz(lz), rotY: ry });
    }
  } else {
    for (const [lx, lz, ry] of lampPositions) {
      const lamp = createSokakLambasi();
      placePrefab(g, lamp, lx, 0, lz, ry);
    }
  }

  // ── Tabelalar ───────────────────────────────────
  buildSign(g, 0, -(PL_D + 1.2), 0);
  buildSign(g, 0, PL_D + 1.2, Math.PI);

  // ── Agaclar (8 adet) ────────────────────────────
  const treeOffset = 2.5;
  const trees = [
    [-PL_W - treeOffset, -PL_D - 1], [PL_W + treeOffset, -PL_D - 1],
    [-PL_W - treeOffset, PL_D + 1], [PL_W + treeOffset, PL_D + 1],
    [-PL_W - 2, -PL_D + 8], [-PL_W - 2, PL_D - 8],
    [PL_W + 2, -PL_D + 8], [PL_W + 2, PL_D - 8],
  ];
  if (collectTrees) {
    for (const [tx, tz] of trees) {
      collectTrees.push({
        x: plx(tx), z: plz(tz),
        trunkH: 2.8, canopyR: 1.6,
        canopyColor: new THREE.Color(0x3a6b2a),
      });
    }
  } else {
    for (const [tx, tz] of trees) {
      const agac = createAgac();
      placePrefab(g, agac, tx, 0, tz, 0);
    }
  }
}

/**
 * Hastane stili park cizgileri: sadece beyaz ince seritler, dolgu yok.
 * flipEntry: true ise yatay cizgi surus yolu tarafinda (rowlarin ters yonunde)
 */
function drawStallLines(g, rowZ, startX, stallW, stallD, count, flipEntry) {
  for (let i = 0; i < count; i++) {
    const cx = startX + i * stallW + stallW / 2;
    const leftX = cx - stallW / 2;

    // Sol dikey cizgi
    slab(g, 0.08, stallD, leftX, 0.07, rowZ, M.stripeW);
    // Arka yatay cizgi (surus yolundan uzak taraf)
    const backZ = flipEntry ? rowZ + stallD / 2 : rowZ - stallD / 2;
    slab(g, stallW - 0.1, 0.08, cx, 0.07, backZ, M.stripeW);
  }
  // En sag kenar dikey cizgi
  const lastCx = startX + (count - 1) * stallW + stallW / 2;
  slab(g, 0.08, stallD, lastCx + stallW / 2, 0.07, rowZ, M.stripeW);
}

function buildBooth(g, physicsBodies) {
  const bx = 7, bz = -(PL_D - 0.5);
  const bh = 2.4, bw = 2.2, bd = 2.2;
  const bTop = 0.10 + bh / 2;
  wb(g, bw, bh, bd, bx, bTop, bz, M.booth, 0, physicsBodies);
  b(g, bw + 0.5, 0.1, bd + 0.5, bx, 0.10 + bh + 0.05, bz, M.boothRoof);
  b(g, 1.4, 0.85, 0.04, bx, 1.5, bz - bd / 2 - 0.02, M.glass);
  b(g, 0.8, 0.7, 0.04, bx - bw / 2 - 0.02, 1.5, bz, M.glass);
  ptl(g, 0xfff5e8, 0.35, 4, bx, 2.0, bz);
}

function buildBarrier(g, lx, lz, rotY) {
  const group = new THREE.Group();
  group.position.set(plx(lx), 0, plz(lz));
  group.rotation.y = rotY;

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), M.metal);
  post.position.y = 0.55;
  group.add(post);

  // Kol yukari konumda (dikey, acik)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 0.035), M.red);
  arm.position.set(0, 1.05 + 1.4, 0);
  group.add(arm);

  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.2), M.signWhite);
    s.position.set(0, 1.05, 0.4 + i * 0.95);
    group.add(s);
  }
  g.add(group);
}

function buildSign(g, lx, lz, rotY) {
  cyl(g, 0.05, 0.05, 3.0, 8, M.metal, lx, 1.5, lz);
  b(g, 0.85, 0.6, 0.06, lx, 2.8, lz + (rotY === 0 ? -0.52 : 0.52), M.signBlue);
  b(g, 0.6, 0.4, 0.07, lx, 2.8, lz + (rotY === 0 ? -0.55 : 0.55), M.signWhite);
}
