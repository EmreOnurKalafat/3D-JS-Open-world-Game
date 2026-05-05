// assets/complexes/supermarket/modules/aisles.js
// S4 — Aisle system: InstancedMesh-batched shelf rows
// 5 double-sided rows, ~40-50 total shelf units. High performance.

import * as THREE from 'three';
import {
  SM_D, WT,
  smx, smz,
  MODULE_SRC_PREFIX,
} from '../constants.js';
import { M } from '../materials.js';
import { b, placePrefab } from './helpers.js';
import { getReyonDoluGeoTex } from '../../../props/market/reyonDolu.js';
import { createReyonBos } from '../../../props/market/reyonBos.js';

const SRC = MODULE_SRC_PREFIX + '/aisles.js';

export function buildAisles(g, physicsBodies) {
  const sZ = -(SM_D + WT);  // south interior wall

  // Aisle zone starts after cashiers, ends before north wall
  const aisleStartZ = sZ + 13.3;       // z = -9.0
  const aisleEndZ = SM_D - WT - 3.7;   // z = +18.0 (3.7m from north wall)
  const aisleDepth = aisleEndZ - aisleStartZ;
  const aisleCount = 5;
  const aisleGap = 2.8;  // walking gap between rows
  const shelfD = 0.6;
  const totalAisleWidth = aisleCount * (shelfD * 2 + aisleGap) - aisleGap;
  const aisleStartX = -totalAisleWidth / 2 + shelfD + aisleGap / 2;

  /* ── InstancedMesh for full shelves ───────────────────────── */
  const { geometry: shelfGeo, texture: shelfTex } = getReyonDoluGeoTex();
  const shelfMat = new THREE.MeshLambertMaterial({ map: shelfTex });

  // Collect all shelf positions
  const shelfMatrices = [];
  const shelfPhysEntries = [];

  const shelfPerSide = Math.floor(aisleDepth / 1.1);  // ~1.1m per shelf unit along Z
  const shelfSpacingZ = aisleDepth / shelfPerSide;

  for (let aisle = 0; aisle < aisleCount; aisle++) {
    const ax = aisleStartX + aisle * (shelfD * 2 + aisleGap);

    for (let s = 0; s < shelfPerSide; s++) {
      const sz = aisleStartZ + s * shelfSpacingZ + shelfSpacingZ / 2;

      // West-facing shelf, east-facing shelf (back-to-back pairs)
      for (const [side, ry] of [[-1, Math.PI / 2], [1, -Math.PI / 2]]) {
        const sx = ax + side * (shelfD / 2 + 0.01);
        const dummy = new THREE.Object3D();
        const wx = smx(sx), wz = smz(sz);
        dummy.position.set(wx, 2.5 / 2, wz);
        dummy.rotation.y = ry;
        dummy.updateMatrix();
        shelfMatrices.push(dummy.matrix.clone());

        shelfPhysEntries.push({
          mesh: { position: new THREE.Vector3(wx, 2.5 / 2, wz), rotation: { y: ry } },
          sx: ry === 0 ? 2.0 : 0.6,
          sy: 2.5,
          sz: ry === 0 ? 0.6 : 2.0,
        });
      }
    }
  }

  // Build InstancedMesh
  const im = new THREE.InstancedMesh(shelfGeo, shelfMat, shelfMatrices.length);
  shelfMatrices.forEach((m, i) => im.setMatrixAt(i, m));
  im.instanceMatrix.needsUpdate = true;
  im.castShadow = true;
  im.receiveShadow = true;
  im.name = 'SupermarketShelves';
  im.userData.sourceFile = SRC;
  im.userData.editorLabel = 'Market Reyonları (Instanced)';
  g.add(im);

  /* ── Physics for full shelves ─────────────────────────────── */
  for (const pe of shelfPhysEntries) {
    physicsBodies.push({
      mesh: pe.mesh,
      sx: pe.sx, sy: pe.sy, sz: pe.sz,
    });
  }

  /* ── A handful of empty shelves (scattered) ───────────────── */
  const emptyPositions = [
    [aisleStartX + 2 * (shelfD * 2 + aisleGap), aisleStartZ + aisleDepth * 0.3],
    [aisleStartX + 4 * (shelfD * 2 + aisleGap), aisleStartZ + aisleDepth * 0.7],
  ];
  for (const [ex, ez] of emptyPositions) {
    const bosRef = createReyonBos();
    placePrefab(g, bosRef, ex, 0, ez, -Math.PI / 2);
  }

  /* ── End-cap displays (ends of aisles facing cashiers) ────── */
  for (let aisle = 0; aisle < aisleCount; aisle++) {
    const ax = aisleStartX + aisle * (shelfD * 2 + aisleGap);
    // Front end cap (south end, facing entrance)
    b(g, 1.8, 1.6, 0.5, ax, 0.8, aisleStartZ, M.signGreen, 0, physicsBodies);
    b(g, 0.08, 1.6, 0.08, ax - 0.9, 0.8, aisleStartZ, M.darkTrim, 0, physicsBodies);
    b(g, 0.08, 1.6, 0.08, ax + 0.9, 0.8, aisleStartZ, M.darkTrim, 0, physicsBodies);

    // Back end cap (north end)
    b(g, 1.8, 1.6, 0.5, ax, 0.8, aisleEndZ, M.signRed, 0, physicsBodies);
  }

  console.log('[AISLES] %d shelves (InstancedMesh), %d empty shelves',
    shelfMatrices.length, emptyPositions.length);
}
