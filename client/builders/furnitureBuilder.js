// client/builders/furnitureBuilder.js — Street furniture placement coordinator
// Collects lamp, traffic light, tree, and parked car coordinates from the grid.
// Delegates InstancedMesh creation to respective managers.
// userData.sourceFile is set by each manager (NOT here).
//
// Pattern: Read placement config from data/furniture/furnitureConfig.js →
//          collect coords from grid → delegate to managers

import * as THREE from 'three';
import { CAR_WEIGHTS, CAR_COLORS } from '../../data/zones/worldData.js';
import { createLampInstances } from '../../assets/prefabs/props/sokakLambasiManager.js';
import { createTrafficLightInstances } from '../../assets/prefabs/props/trafikIsigiManager.js';
import { LAMP, TRAFFIC_LIGHT, STREET_TREE, PARKED_CAR } from '../../data/furniture/furnitureConfig.js';

/**
 * Place lamps, traffic lights, street trees, and parked cars.
 * Lamps & traffic lights → built immediately via their managers.
 * Trees & cars → coordinate arrays returned for agacManager/parkEdilmisArabaManager.
 *
 * @param {THREE.Scene} scene
 * @param {Object} occ - OccupancyGrid instance
 * @param {Object} opts - { GRID, CELL, WH, HALF, ROAD, SW, BLOCK, isSpecialCell(row,col) }
 * @param {Array} treesArr — cityData.trees array to push position refs into
 * @returns {{treeCoords: Array, carCoords: Array}}
 */
export function placeFurniture(scene, occ, opts, treesArr) {
  const { GRID, CELL, WH, HALF, ROAD, SW, BLOCK, isSpecialCell } = opts;
  const lampCoords = [];
  const tlCoords = [];
  const treeCoords = [];
  const carCoords = [];

  // ── Traffic lights (2 per intersection) ──
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;
      for (const pos of TRAFFIC_LIGHT.positions) {
        const px = ix + pos.sx * (ROAD / 2 + SW - TRAFFIC_LIGHT.cornerInset);
        const pz = iz + pos.sz * (ROAD / 2 + SW - TRAFFIC_LIGHT.cornerInset);
        if (!occ.isFree(px, pz, TRAFFIC_LIGHT.occClearance)) continue;
        tlCoords.push({ x: px, z: pz, rotY: pos.ry });
        occ.fill(px, pz, TRAFFIC_LIGHT.occFillW, TRAFFIC_LIGHT.occFillD, TRAFFIC_LIGHT.occClearance);
      }
    }
  }

  // ── Street lamps (X-axis roads) ──
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH, x2 = (col + 1) * CELL - WH;
      const z = row * CELL - WH;
      for (let pos = x1 + LAMP.spacing; pos < x2 - LAMP.minEdgeGap; pos += LAMP.spacing) {
        for (const side of [-1, 1]) {
          const lx = pos, lz = z + side * (ROAD / 2 + SW + LAMP.roadOffset);
          if (!occ.isFree(lx, lz, LAMP.occClearance)) continue;
          lampCoords.push({ x: lx, z: lz, rotY: side > 0 ? Math.PI : 0 });
          occ.fill(lx, lz, LAMP.occFillW, LAMP.occFillD, LAMP.occClearance);
        }
      }
    }
  }

  // ── Street lamps (Z-axis roads) ──
  for (let col = 0; col <= GRID; col++) {
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH, z2 = (row + 1) * CELL - WH;
      const x = col * CELL - WH;
      for (let pos = z1 + LAMP.spacing; pos < z2 - LAMP.minEdgeGap; pos += LAMP.spacing) {
        for (const side of [-1, 1]) {
          const lx = x + side * (ROAD / 2 + SW + LAMP.roadOffset), lz = pos;
          if (!occ.isFree(lx, lz, LAMP.occClearance)) continue;
          lampCoords.push({ x: lx, z: lz, rotY: side > 0 ? Math.PI / 2 : -Math.PI / 2 });
          occ.fill(lx, lz, LAMP.occFillW, LAMP.occFillD, LAMP.occClearance);
        }
      }
    }
  }

  // ── Street trees (1 per block face) ──
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (isSpecialCell(row, col)) continue;
      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const treeOff = HALF - ROAD / 2 - SW - STREET_TREE.sidewalkGap;
      const faces = [[cx, cz + treeOff], [cx, cz - treeOff], [cx + treeOff, cz], [cx - treeOff, cz]];
      for (const [tx, tz] of faces) {
        if (!occ.isFree(tx, tz, STREET_TREE.occClearance)) continue;
        const trunkH = STREET_TREE.trunkHMin + Math.random() * (STREET_TREE.trunkHMax - STREET_TREE.trunkHMin);
        const canopyR = STREET_TREE.canopyRMin + Math.random() * (STREET_TREE.canopyRMax - STREET_TREE.canopyRMin);
        const hue = STREET_TREE.canopyHueMin + Math.random() * (STREET_TREE.canopyHueMax - STREET_TREE.canopyHueMin);
        const lightness = STREET_TREE.canopyLightnessMin + Math.random() * (STREET_TREE.canopyLightnessMax - STREET_TREE.canopyLightnessMin);
        const canopyColor = new THREE.Color().setHSL(hue, STREET_TREE.canopySaturation, lightness);
        treeCoords.push({ x: tx, z: tz, trunkH, canopyR, canopyColor });
        treesArr.push({ position: { x: tx, z: tz } });
        occ.fill(tx, tz, STREET_TREE.occFillW, STREET_TREE.occFillD, STREET_TREE.occClearance);
      }
    }
  }

  // ── Parked cars (1 per block face) ──
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (isSpecialCell(row, col)) continue;
      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const carOff = HALF - ROAD / 2 - SW - PARKED_CAR.sidewalkGap;
      const faces = [
        { x: cx, z: cz + carOff, ry: 0, ax: 'x' },
        { x: cx, z: cz - carOff, ry: Math.PI, ax: 'x' },
        { x: cx + carOff, z: cz, ry: Math.PI / 2, ax: 'z' },
        { x: cx - carOff, z: cz, ry: -Math.PI / 2, ax: 'z' },
      ];
      for (const face of faces) {
        const offset = (Math.random() - 0.5) * BLOCK * PARKED_CAR.jitterFraction;
        const px = face.ax === 'x' ? face.x + offset : face.x;
        const pz = face.ax === 'z' ? face.z + offset : face.z;
        if (!occ.isFree(px, pz, PARKED_CAR.occClearance)) continue;
        let rv = Math.random(), acc = 0, cType = 'sedan';
        for (const cw of CAR_WEIGHTS) { acc += cw.weight; if (rv <= acc) { cType = cw.type; break; } }
        const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        const quat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, face.ry + (Math.random() - 0.5) * PARKED_CAR.rotJitter, 0));
        carCoords.push({ x: px, z: pz, type: cType, color, quat });
        occ.fill(px, pz, PARKED_CAR.occFillW, PARKED_CAR.occFillD, PARKED_CAR.occFillExtra);
      }
    }
  }

  // Build lamp + traffic light InstancedMeshes immediately
  createLampInstances(scene, lampCoords);
  createTrafficLightInstances(scene, tlCoords);

  return { treeCoords, carCoords };
}
