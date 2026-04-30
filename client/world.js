// client/world.js — Phase 3: InstancedMesh + chunking + LOD
// Buildings use chunked InstancedMesh with per-instance colors

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { WORLD } from '/shared/constants.js';
import {
  makeSidewalkTexture, makeGrassTexture,
  makeSandTexture, makeWaterTexture,
  makeBuildingFacadeTexture, updateBuildingFacadeTexture, updateBuildingFacadeContinuous,
} from './textureBuilder.js';
import { getPhysicsWorld } from './physics.js';
import { ChunkManager } from './chunkManager.js';
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from './policeStation.js';

const BLOCK = WORLD.BLOCK_SIZE;
const ROAD = WORLD.ROAD_WIDTH;
const GRID = WORLD.GRID_SIZE;
const CELL = BLOCK + ROAD;
const HALF = CELL / 2;
const WH = (GRID / 2) * CELL;
const SW = 3;
const CURB = ROAD / 2 + SW;
const BUILD_MARGIN = 1.0;
const EXT = 40;

export const cityData = { buildings: [], trees: [], waterMesh: null, waterData: null, lights: [], chunkMgr: null, buildingLights: [], nightFactor: 0 };

// ═══════════════════════════════════════════════════════════
//  SHARED MATERIALS — created once, reused everywhere
// ═══════════════════════════════════════════════════════════

const roadMat = new THREE.MeshLambertMaterial({ color: 0x3A3A3A });
const fillMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
const asphaltFillMat = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // black asphalt for special blocks
const buildBodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // white base for instanceColor
const buildRoofMat = new THREE.MeshLambertMaterial({ color: 0x333333 }); // dark roof
const yellowMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, depthWrite: true });
const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, depthWrite: true });
const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const treeCanopyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // white base for instanceColor
const carBodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // white base for instanceColor
const metalMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

let swMat; // set after texture is built

// Shared tree geometries (used by both placeFurniture and createPark)
const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1, 6);
trunkGeo.translate(0, 0.5, 0);
const canopyGeo = new THREE.IcosahedronGeometry(1, 0);

// ═══════════════════════════════════════════════════════════
//  OCCUPANCY TRACKER
// ═══════════════════════════════════════════════════════════

class OccupancyGrid {
  constructor() { this.cells = new Map(); }
  fill(cx, cz, w, d, extra = 0) {
    const hw = w / 2 + extra, hd = d / 2 + extra;
    const sx = Math.round((cx - hw) * 2), ex = Math.round((cx + hw) * 2);
    const sz = Math.round((cz - hd) * 2), ez = Math.round((cz + hd) * 2);
    for (let x = sx; x <= ex; x++)
      for (let z = sz; z <= ez; z++)
        this.cells.set(`${x},${z}`, true);
  }
  isFree(x, z, gap = 1.0) {
    const g = Math.round(gap * 2);
    const sx = Math.round(x * 2), sz = Math.round(z * 2);
    for (let dx = -g; dx <= g; dx++)
      for (let dz = -g; dz <= g; dz++)
        if (this.cells.has(`${sx + dx},${sz + dz}`)) return false;
    return true;
  }
}

// ═══════════════════════════════════════════════════════════
//  DEFERRED BUILD SYSTEM
// ═══════════════════════════════════════════════════════════

// Merge groups: key -> { material, entries: [{geometry, position, quaternion, scale}] }
const mergeGroups = new Map();

function addMerge(key, material, geometry, position, quaternion, scale) {
  if (!mergeGroups.has(key)) mergeGroups.set(key, { material, entries: [] });
  mergeGroups.get(key).entries.push({
    geometry: geometry.clone(),
    position: position.clone(),
    quaternion: quaternion.clone(),
    scale: scale.clone(),
  });
}

// Instanced groups: key -> { geometry, material, entries: [{position, quaternion, scale, color}] }
const instGroups = new Map();

function addInstance(key, geometry, material, position, quaternion, scale, color = null) {
  if (!instGroups.has(key)) instGroups.set(key, { geometry: geometry.clone(), material, entries: [] });
  instGroups.get(key).entries.push({
    position: position.clone(),
    quaternion: quaternion.clone(),
    scale: scale.clone(),
    color,
  });
}

/** Build all merged geometry meshes and add to scene */
function buildMerged(scene) {
  for (const [key, group] of mergeGroups) {
    if (group.entries.length === 0) continue;
    const geos = group.entries.map(e => {
      const g = e.geometry;
      const m = new THREE.Matrix4().compose(e.position, e.quaternion, e.scale);
      g.applyMatrix4(m);
      return g;
    });
    const merged = mergeGeometries(geos);
    const mesh = new THREE.Mesh(merged, group.material);
    mesh.receiveShadow = true;
    mesh.name = key;
    scene.add(mesh);
  }
  mergeGroups.clear();
}

/** Build all InstancedMesh objects and add to scene */
function buildInstanced(scene) {
  for (const [key, group] of instGroups) {
    if (group.entries.length === 0) continue;
    const im = new THREE.InstancedMesh(group.geometry, group.material, group.entries.length);
    const dummy = new THREE.Object3D();
    group.entries.forEach((e, i) => {
      dummy.position.copy(e.position);
      dummy.quaternion.copy(e.quaternion);
      dummy.scale.copy(e.scale);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      if (e.color) im.setColorAt(i, e.color);
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.name = key;
    scene.add(im);
  }
  instGroups.clear();
}

// ═══════════════════════════════════════════════════════════
//  ROAD NETWORK
// ═══════════════════════════════════════════════════════════

const ROAD_H = 0.05;
const ROAD_Y = 0.025;

function createRoads() {
  const extOff = EXT / 2;
  const extW = -WH - extOff;
  const extE = WH + extOff;
  const extS = -WH - extOff;
  const extN = WH + extOff;

  // X-axis roads
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH, x2 = (col + 1) * CELL - WH;
      const cx = (x1 + x2) / 2, segLen = x2 - x1;
      addMerge('roadX', roadMat,
        new THREE.BoxGeometry(segLen, ROAD_H, ROAD),
        new THREE.Vector3(cx, ROAD_Y, z),
        new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const cxE of [extW, extE])
      addMerge('roadX', roadMat,
        new THREE.BoxGeometry(EXT, ROAD_H, ROAD),
        new THREE.Vector3(cxE, ROAD_Y, z),
        new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // Z-axis roads
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH, z2 = (row + 1) * CELL - WH;
      const cz = (z1 + z2) / 2, segLen = z2 - z1;
      addMerge('roadZ', roadMat,
        new THREE.BoxGeometry(ROAD, ROAD_H, segLen),
        new THREE.Vector3(x, ROAD_Y, cz),
        new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const czE of [extS, extN])
      addMerge('roadZ', roadMat,
        new THREE.BoxGeometry(ROAD, ROAD_H, EXT),
        new THREE.Vector3(x, ROAD_Y, czE),
        new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }
}

// ═══════════════════════════════════════════════════════════
//  BLOCK FILL
// ═══════════════════════════════════════════════════════════

function createBlockFill() {
  const geo = new THREE.PlaneGeometry(BLOCK, BLOCK);
  for (let row = 0; row < GRID; row++) {
    if (row === 0) continue;
    for (let col = 0; col < GRID; col++) {
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;
      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;
      const isPolice = row === POLICE_GRID_ROW && col === POLICE_GRID_COL;
      const blockMat = isPolice ? asphaltFillMat : fillMat;
      const mergeKey = isPolice ? 'fill_asphalt' : 'fill';
      addMerge(mergeKey, blockMat, geo,
        new THREE.Vector3(cx, 0.01, cz),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
        new THREE.Vector3(1, 1, 1));
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  SIDEWALKS
// ═══════════════════════════════════════════════════════════

function createSidewalks() {
  const h = 0.2;
  const extOff = EXT / 2;

  // X-road sidewalks
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH + ROAD / 2, x2 = (col + 1) * CELL - WH - ROAD / 2;
      const cx = (x1 + x2) / 2, segLen = x2 - x1;
      for (const side of [-1, 1]) {
        addMerge('swX', swMat,
          new THREE.BoxGeometry(segLen, h, SW),
          new THREE.Vector3(cx, h / 2, z + side * (ROAD / 2 + SW / 2)),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
    const extW = -WH + ROAD / 2 - extOff, extE = WH - ROAD / 2 + extOff;
    for (const cxE of [extW, extE]) {
      for (const side of [-1, 1]) {
        addMerge('swX', swMat,
          new THREE.BoxGeometry(EXT, h, SW),
          new THREE.Vector3(cxE, h / 2, z + side * (ROAD / 2 + SW / 2)),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
  }

  // Z-road sidewalks
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH + ROAD / 2, z2 = (row + 1) * CELL - WH - ROAD / 2;
      const cz = (z1 + z2) / 2, segLen = z2 - z1;
      for (const side of [-1, 1]) {
        addMerge('swZ', swMat,
          new THREE.BoxGeometry(SW, h, segLen),
          new THREE.Vector3(x + side * (ROAD / 2 + SW / 2), h / 2, cz),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
    const extS = -WH + ROAD / 2 - extOff, extN = WH - ROAD / 2 + extOff;
    for (const czE of [extS, extN]) {
      for (const side of [-1, 1]) {
        addMerge('swZ', swMat,
          new THREE.BoxGeometry(SW, h, EXT),
          new THREE.Vector3(x + side * (ROAD / 2 + SW / 2), h / 2, czE),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
  }

  // Corner fill squares
  const cornerGeo = new THREE.BoxGeometry(SW, h, SW);
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;
      const corners = [
        [ix - ROAD / 2 - SW / 2, iz - ROAD / 2 - SW / 2],
        [ix - ROAD / 2 - SW / 2, iz + ROAD / 2 + SW / 2],
        [ix + ROAD / 2 + SW / 2, iz - ROAD / 2 - SW / 2],
        [ix + ROAD / 2 + SW / 2, iz + ROAD / 2 + SW / 2],
      ];
      for (const [cx, cz] of corners) {
        addMerge('swCorner', swMat, cornerGeo,
          new THREE.Vector3(cx, h / 2, cz),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  ROAD MARKINGS — solid lines + InstancedMesh crosswalks
// ═══════════════════════════════════════════════════════════

const MARK_Y = ROAD_Y + ROAD_H / 2 + 0.001;

function createRoadMarkings() {
  const extOff = EXT / 2;
  const extW = -WH + ROAD / 2 - extOff, extE = WH - ROAD / 2 + extOff;
  const extS = -WH + ROAD / 2 - extOff, extN = WH - ROAD / 2 + extOff;

  // ── Yellow X center lines (solid continuous) ──
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH + ROAD / 2, x2 = (col + 1) * CELL - WH - ROAD / 2;
      const cx = (x1 + x2) / 2;
      addMerge('yellowX', yellowMat,
        new THREE.BoxGeometry(x2 - x1, 0.004, 0.2),
        new THREE.Vector3(cx, MARK_Y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const cxE of [extW, extE])
      addMerge('yellowX', yellowMat,
        new THREE.BoxGeometry(EXT, 0.004, 0.2),
        new THREE.Vector3(cxE, MARK_Y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // ── Yellow Z center lines ──
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH + ROAD / 2, z2 = (row + 1) * CELL - WH - ROAD / 2;
      const cz = (z1 + z2) / 2;
      addMerge('yellowZ', yellowMat,
        new THREE.BoxGeometry(0.2, 0.004, z2 - z1),
        new THREE.Vector3(x, MARK_Y + 0.0005, cz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const czE of [extS, extN])
      addMerge('yellowZ', yellowMat,
        new THREE.BoxGeometry(0.2, 0.004, EXT),
        new THREE.Vector3(x, MARK_Y + 0.0005, czE), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // ── White X edge lines ──
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let side of [-1, 1]) {
      for (let col = 0; col < GRID; col++) {
        const x1 = col * CELL - WH + ROAD / 2, x2 = (col + 1) * CELL - WH - ROAD / 2;
        const cx = (x1 + x2) / 2;
        addMerge('whiteX', whiteMat,
          new THREE.BoxGeometry(x2 - x1, 0.004, 0.12),
          new THREE.Vector3(cx, MARK_Y, z + side * (ROAD / 2 - 0.7)),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
      for (const cxE of [extW, extE])
        addMerge('whiteX', whiteMat,
          new THREE.BoxGeometry(EXT, 0.004, 0.12),
          new THREE.Vector3(cxE, MARK_Y, z + side * (ROAD / 2 - 0.7)),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
  }

  // ── White Z edge lines ──
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let side of [-1, 1]) {
      for (let row = 0; row < GRID; row++) {
        const z1 = row * CELL - WH + ROAD / 2, z2 = (row + 1) * CELL - WH - ROAD / 2;
        const cz = (z1 + z2) / 2;
        addMerge('whiteZ', whiteMat,
          new THREE.BoxGeometry(0.12, 0.004, z2 - z1),
          new THREE.Vector3(x + side * (ROAD / 2 - 0.7), MARK_Y + 0.0005, cz),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
      for (const czE of [extS, extN])
        addMerge('whiteZ', whiteMat,
          new THREE.BoxGeometry(0.12, 0.004, EXT),
          new THREE.Vector3(x + side * (ROAD / 2 - 0.7), MARK_Y + 0.0005, czE),
          new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
  }

  // ── Crosswalks — InstancedMesh stripes ──
  const cwY = MARK_Y + 0.001;
  const cwStripeGeo = new THREE.BoxGeometry(ROAD, 0.004, 0.25);
  const cwStripeGeoZ = new THREE.BoxGeometry(0.25, 0.004, ROAD);
  const cwOff = ROAD / 2 + 1.2;
  const cwCount = 4;
  const cwSpacing = 0.5;

  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;

      for (let s = 0; s < cwCount; s++) {
        // South & North (stripes along X)
        const zS = iz - cwOff - (cwCount - 1) * cwSpacing / 2 + s * cwSpacing;
        const zN = iz + cwOff - (cwCount - 1) * cwSpacing / 2 + s * cwSpacing;
        addInstance('crosswalk', cwStripeGeo, whiteMat,
          new THREE.Vector3(ix, cwY, zS), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        addInstance('crosswalk', cwStripeGeo, whiteMat,
          new THREE.Vector3(ix, cwY, zN), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));

        // West & East (stripes along Z)
        const xW = ix - cwOff - (cwCount - 1) * cwSpacing / 2 + s * cwSpacing;
        const xE = ix + cwOff - (cwCount - 1) * cwSpacing / 2 + s * cwSpacing;
        addInstance('crosswalkZ', cwStripeGeoZ, whiteMat,
          new THREE.Vector3(xW, cwY, iz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        addInstance('crosswalkZ', cwStripeGeoZ, whiteMat,
          new THREE.Vector3(xE, cwY, iz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  ZONES
// ═══════════════════════════════════════════════════════════

function getZone(row, col) {
  const c = (GRID - 1) / 2;
  const d = Math.sqrt((row - c) ** 2 + (col - c) ** 2);
  if (row === 0) return 'beach';
  if (row >= GRID - 2 && col >= GRID - 2) return 'industrial';
  if (row >= GRID - 2) return 'industrial';
  if (d < 1.5) return 'downtown_core';
  if (d < 2.8) return 'downtown';
  if (d < 5.0) return 'commercial';
  if (d < 7.0) return 'residential';
  return 'suburban';
}

// Realistic city planning per zone (usable area per block = ~52×52 units)
function getZoneConfig(zone) {
  const C = {
    // Dense skyscraper core — 4 massive towers per block, tight spacing
    downtown_core: { minH:45, maxH:85, sizes:[[20,16],[18,18],[22,14]],   cols:2, rows:2, dens:0.95 },
    // Downtown ring — 4 large office towers
    downtown:      { minH:25, maxH:50, sizes:[[16,14],[14,16],[16,12]],   cols:2, rows:2, dens:0.90 },
    // Commercial — 9 mid-rise shops/offices, moderate spacing
    commercial:    { minH:10, maxH:30, sizes:[[13,10],[11,12],[13,9]],    cols:3, rows:3, dens:0.85 },
    // Residential — 12 apartment blocks, medium density
    residential:   { minH:8,  maxH:20, sizes:[[10,8],[9,9],[12,7]],      cols:3, rows:4, dens:0.80 },
    // Suburban — 20 houses, spacious with yards
    suburban:      { minH:4,  maxH:12, sizes:[[8,6],[7,7],[9,5]],        cols:4, rows:5, dens:0.70 },
    // Industrial — 2 massive warehouses per block
    industrial:    { minH:10, maxH:22, sizes:[[26,18],[22,20],[28,16]],   cols:1, rows:2, dens:0.80 },
    // Beach — 6 low-rise casual buildings, sparse
    beach:         { minH:3,  maxH:8,  sizes:[[10,7],[8,8],[12,6]],      cols:3, rows:2, dens:0.55 },
  };
  return C[zone] || C.suburban;
}

// ═══════════════════════════════════════════════════════════
//  BUILDINGS — chunked InstancedMesh + physics bodies
// ═══════════════════════════════════════════════════════════

// City-wide InstancedMesh build data: "sig" → { geo, mat, matrices: [] }
const buildGroups = new Map();

function addBuildEntry(sig, geometry, material, matrix) {
  if (!buildGroups.has(sig)) {
    buildGroups.set(sig, { geometry: geometry.clone(), material, matrices: [] });
  }
  buildGroups.get(sig).matrices.push(matrix.clone());
}

/** Build all building InstancedMeshes — consolidated by geometry, no chunk splitting */
function buildAllBuildings(scene) {
  for (const [sig, group] of buildGroups) {
    const im = new THREE.InstancedMesh(group.geometry, group.material, group.matrices.length);
    group.matrices.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    im.name = sig;
    scene.add(im);
  }
  buildGroups.clear();
}

// Building facade texture cache — stores full texData {texture, canvas, ctx, baseColor, windowData}
const zoneTexData = {};
function getZoneTextureData(zone) {
  if (!zoneTexData[zone]) {
    const colorMap = {
      downtown_core: '#7080A0', downtown: '#7890A0',
      commercial: '#C0A080', residential: '#D0A878',
      suburban: '#D8C0A0', industrial: '#666666', beach: '#80C0C0',
    };
    zoneTexData[zone] = makeBuildingFacadeTexture(colorMap[zone] || '#888888');
  }
  return zoneTexData[zone];
}

/** Update all building textures for day/night cycle transition (discrete phases) */
export function updateBuildingTexturesForPhase(phase) {
  for (const key of Object.keys(zoneTexData)) {
    updateBuildingFacadeTexture(zoneTexData[key], phase);
  }
}

/** Create area lights covering the city at night — tuned for PBR (intensity in cd) */
function initBuildingLights(scene) {
  const allLights = [];
  const STEP = CELL * 2; // ~144 unit spacing → 4×4 grid
  const off = WH * 0.7;

  for (let ix = -off; ix <= off + 1; ix += STEP) {
    for (let iz = -off; iz <= off + 1; iz += STEP) {
      const light = new THREE.PointLight(0xFFDDAA, 0, 220);
      light.position.set(ix, 20, iz);
      light.castShadow = false;
      light.userData = { maxIntensity: 200 };
      scene.add(light);
      allLights.push(light);
    }
  }

  cityData.buildingLights = allLights;
  console.log('[WORLD] %d area lights created', allLights.length);
}

/** Smoothly updates building facade textures + point light intensities */
export function updateBuildingLighting(nightFactor) {
  cityData.nightFactor = nightFactor;
  const nf = Math.max(0, Math.min(1, nightFactor));

  // Update point lights
  for (const light of cityData.buildingLights) {
    light.intensity = nf * light.userData.maxIntensity;
  }

  // Update facade textures only when nightFactor changes meaningfully
  const prev = updateBuildingLighting._lastNf;
  if (prev === undefined || Math.abs(nf - prev) > 0.015) {
    updateBuildingLighting._lastNf = nf;
    for (const key of Object.keys(zoneTexData)) {
      updateBuildingFacadeContinuous(zoneTexData[key], nf);
    }
  }
}

/** Build ground-floor entrance: flush awning + door, centered on building face */
function buildEntrance(bw) {
  const parts = [];
  // Awning/canopy — flush against building
  const awning = new THREE.BoxGeometry(Math.min(bw * 0.5, 6), 0.2, 1.2);
  awning.translate(0, 3.0, 0.6);
  parts.push(awning);
  // Door frame — embedded in wall
  const door = new THREE.BoxGeometry(2, 2.6, 0.15);
  door.translate(0, 1.3, 0.08);
  parts.push(door);
  // Step
  const step = new THREE.BoxGeometry(2.8, 0.25, 0.8);
  step.translate(0, 0.12, 0.4);
  parts.push(step);
  return mergeGeometries(parts);
}

/** Build a detailed roof: main slab + AC units + elevator overrun */
function buildRoofWithDetails(bw, bd) {
  const parts = [];
  // Main roof slab
  const slab = new THREE.BoxGeometry(bw - 1.5, 0.3, bd - 1.5);
  slab.translate(0, 0.15, 0);
  parts.push(slab);

  // AC units (small boxes)
  const acCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < acCount; i++) {
    const aw = 1.2 + Math.random() * 1.5;
    const ah = 1.5 + Math.random() * 2.0;
    const ad = 0.8 + Math.random() * 1.0;
    const ac = new THREE.BoxGeometry(aw, ah, ad);
    ac.translate(
      (Math.random() - 0.5) * (bw - 3),
      0.3 + ah / 2,
      (Math.random() - 0.5) * (bd - 3)
    );
    parts.push(ac);
  }

  // Elevator overrun (tall box)
  const eh = 2.5 + Math.random() * 1.5;
  const ev = new THREE.BoxGeometry(2.5, eh, 2.5);
  ev.translate(
    (Math.random() - 0.5) * (bw - 5),
    0.3 + eh / 2,
    (Math.random() - 0.5) * (bd - 5)
  );
  parts.push(ev);

  return mergeGeometries(parts);
}

function placeBuildings(scene, occ) {
  const phys = getPhysicsWorld();
  const usableHalf = HALF - CURB - BUILD_MARGIN;
  const usable = usableHalf * 2;

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;
      if (row === POLICE_GRID_ROW && col === POLICE_GRID_COL) continue; // police station

      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const zone = getZone(row, col);
      const cfg = getZoneConfig(zone);

      const nCols = cfg.cols;
      const nRows = cfg.rows;
      const slotW = usable / nCols, slotD = usable / nRows;
      const sx = cx - usable / 2, sz = cz - usable / 2;

      // Block edge positions (road centers)
      const roadN = cz + HALF, roadS = cz - HALF;
      const roadE = cx + HALF, roadW = cx - HALF;

      for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
          if (Math.random() > cfg.dens) continue;
          const pair = cfg.sizes[Math.floor(Math.random() * cfg.sizes.length)];
          const bw = Math.min(pair[0], slotW - BUILD_MARGIN * 2);
          const bd = Math.min(pair[1], slotD - BUILD_MARGIN * 2);
          if (bw < 3 || bd < 3) continue;

          const bh = cfg.minH + Math.random() * (cfg.maxH - cfg.minH);
          // Jitter proportional to zone density: tighter in dense areas
          const jitter = (1 - cfg.dens) * 2 + 0.3;
          const bx = sx + c * slotW + slotW / 2 + (Math.random() - 0.5) * (slotW - bw - BUILD_MARGIN) * jitter;
          const bz = sz + r * slotD + slotD / 2 + (Math.random() - 0.5) * (slotD - bd - BUILD_MARGIN) * jitter;

          const sig = `bld_${bw.toFixed(1)}x${bh.toFixed(1)}x${bd.toFixed(1)}`;

          // Shared Lambert material per zone — no specular (GTX 1050 friendly)
          const texData = getZoneTextureData(zone);
          if (!texData._sharedMat) {
            texData._sharedMat = new THREE.MeshLambertMaterial({ map: texData.texture });
            texData._sharedMat.map.wrapS = THREE.RepeatWrapping;
            texData._sharedMat.map.wrapT = THREE.RepeatWrapping;
            texData._sharedMat.map.repeat.set(1, Math.max(1, Math.round(cfg.maxH / 10)));
          }
          const bodyTexMat = texData._sharedMat;

          const bodyGeo = new THREE.BoxGeometry(bw, bh, bd);
          bodyGeo.translate(0, bh / 2, 0);
          const bodyMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(bx, 0, bz),
            new THREE.Quaternion(),
            new THREE.Vector3(1, 1, 1)
          );
          addBuildEntry('body_' + zone + '_' + sig, bodyGeo, bodyTexMat, bodyMatrix);

          // Determine which road this building faces (closest block edge)
          const distN = Math.abs(bz - roadN), distS = Math.abs(bz - roadS);
          const distE = Math.abs(bx - roadE), distW = Math.abs(bx - roadW);
          const minDist = Math.min(distN, distS, distE, distW);

          let eRotY, eOffX, eOffZ;
          if (minDist === distN)      { eRotY = 0;            eOffX = 0; eOffZ = bd / 2; }
          else if (minDist === distS) { eRotY = Math.PI;      eOffX = 0; eOffZ = -bd / 2; }
          else if (minDist === distE) { eRotY = Math.PI / 2;  eOffX = bw / 2; eOffZ = 0; }
          else                        { eRotY = -Math.PI / 2; eOffX = -bw / 2; eOffZ = 0; }

          // Entrance — flush on road-facing side
          const entranceGeo = buildEntrance(minDist === distE || minDist === distW ? bd : bw);
          const eQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, eRotY, 0));
          const eMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(bx + eOffX, 0, bz + eOffZ),
            eQuat,
            new THREE.Vector3(1, 1, 1)
          );
          addBuildEntry('entrance_' + sig, entranceGeo, buildRoofMat, eMatrix);

          // Roof with AC units and elevator overrun
          const roofGeo = buildRoofWithDetails(bw, bd);
          roofGeo.translate(0, bh + 0.15, 0);
          addBuildEntry('roof_' + sig, roofGeo, buildRoofMat, bodyMatrix);

          // Physics body
          const shape = new CANNON.Box(new CANNON.Vec3(bw / 2, bh / 2, bd / 2));
          const body = new CANNON.Body({ mass: 0 });
          body.addShape(shape);
          body.position.set(bx, bh / 2, bz);
          phys.addBody(body);
          cityData.buildings.push({ position: { x: bx, y: 0, z: bz }, body, w: bw, h: bh, d: bd });
          occ.fill(bx, bz, bw + 1.2, bd + 1.2);
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  STREET FURNITURE — InstancedMesh approach
// ═══════════════════════════════════════════════════════════

// Car part geometries: body + cabin separated for two-tone InstancedMesh
const carBodyGeos = {
  sedan: (function() { const g = new THREE.BoxGeometry(4.2, 0.8, 1.9); g.translate(0, 0.45, 0); return g; })(),
  sports: (function() { const g = new THREE.BoxGeometry(4.0, 0.55, 2.0); g.translate(0, 0.32, 0); return g; })(),
  suv: (function() { const g = new THREE.BoxGeometry(4.4, 1.0, 2.0); g.translate(0, 0.55, 0); return g; })(),
};
const carCabinGeos = {
  sedan: (function() { const g = new THREE.BoxGeometry(2.2, 0.55, 1.7); g.translate(-0.2, 1.17, 0); return g; })(),
  sports: (function() { const g = new THREE.BoxGeometry(1.8, 0.35, 1.8); g.translate(-0.3, 0.77, 0); return g; })(),
  suv: (function() { const g = new THREE.BoxGeometry(2.4, 0.65, 1.8); g.translate(-0.1, 1.37, 0); return g; })(),
};
const cabinWindowMat = new THREE.MeshLambertMaterial({ color: 0x2A3A5C });

const carColors = [
  new THREE.Color(0xFF3030), new THREE.Color(0xFF8800),
  new THREE.Color(0x3366FF), new THREE.Color(0xEEEEEE),
  new THREE.Color(0x222222), new THREE.Color(0x44AA44),
];

function placeFurniture(scene, occ) {
  const phys = getPhysicsWorld();

  // ── Traffic lights (2 per intersection, reduced from 4) ──
  const tlGeo = (function() {
    // Simplified traffic light geometry: post + box
    const g = new THREE.BoxGeometry(0.12, 5, 0.12);
    g.translate(0, 2.5, 0);
    const box = new THREE.BoxGeometry(0.5, 1.8, 0.5);
    box.translate(0, 5, 0.6);
    return mergeGeometries([g, box]);
  })();

  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;
      const tlPositions = [
        { x: ix + ROAD / 2 + SW - 1, z: iz + ROAD / 2 + SW - 1, ry: Math.PI / 4 },
        { x: ix - ROAD / 2 - SW + 1, z: iz - ROAD / 2 - SW + 1, ry: -3 * Math.PI / 4 },
      ];
      for (const p of tlPositions) {
        if (!occ.isFree(p.x, p.z, 2)) continue;
        addInstance('trafficLight', tlGeo, metalMat,
          new THREE.Vector3(p.x, 0, p.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.ry, 0)),
          new THREE.Vector3(1, 1, 1));
        occ.fill(p.x, p.z, 1.5, 1.5, 2);
      }
    }
  }

  // ── Street lights (spacing 50 instead of 25) ──
  const lightSpacing = 50;
  const lampGeo = (function() {
    const pole = new THREE.CylinderGeometry(0.1, 0.15, 6, 8);
    pole.translate(0, 3, 0);
    const arm = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    arm.translate(0.7, 6, 0);
    return mergeGeometries([pole, arm]);
  })();

  // X road lamps
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH, x2 = (col + 1) * CELL - WH;
      const z = row * CELL - WH;
      for (let pos = x1 + lightSpacing; pos < x2 - 10; pos += lightSpacing) {
        for (const side of [-1, 1]) {
          const lx = pos, lz = z + side * (ROAD / 2 + SW + 1);
          if (!occ.isFree(lx, lz, 2)) continue;
          addInstance('lamp', lampGeo, metalMat,
            new THREE.Vector3(lx, 0, lz),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side > 0 ? Math.PI : 0, 0)),
            new THREE.Vector3(1, 1, 1));
          occ.fill(lx, lz, 1, 1, 2);
        }
      }
    }
  }
  // Z road lamps
  for (let col = 0; col <= GRID; col++) {
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH, z2 = (row + 1) * CELL - WH;
      const x = col * CELL - WH;
      for (let pos = z1 + lightSpacing; pos < z2 - 10; pos += lightSpacing) {
        for (const side of [-1, 1]) {
          const lx = x + side * (ROAD / 2 + SW + 1), lz = pos;
          if (!occ.isFree(lx, lz, 2)) continue;
          addInstance('lamp', lampGeo, metalMat,
            new THREE.Vector3(lx, 0, lz),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0)),
            new THREE.Vector3(1, 1, 1));
          occ.fill(lx, lz, 1, 1, 2);
        }
      }
    }
  }

  // ── Street trees (1 per face, reduced from 1-2) ──

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;
      if (row === POLICE_GRID_ROW && col === POLICE_GRID_COL) continue; // police station

      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const treeOff = HALF - ROAD / 2 - SW - 1;
      const faces = [[cx, cz + treeOff], [cx, cz - treeOff], [cx + treeOff, cz], [cx - treeOff, cz]];

      for (const [tx, tz] of faces) {
        if (!occ.isFree(tx, tz, 2.5)) continue;
        const trunkH = 2 + Math.random() * 2;
        const canopyR = 1 + Math.random();
        const canopyColor = new THREE.Color().setHSL(0.22 + Math.random() * 0.12, 0.8, 0.2 + Math.random() * 0.25);

        addInstance('treeTrunk', trunkGeo, treeTrunkMat,
          new THREE.Vector3(tx, 0, tz), new THREE.Quaternion(),
          new THREE.Vector3(1, trunkH, 1));
        addInstance('treeCanopy', canopyGeo, treeCanopyMat,
          new THREE.Vector3(tx, trunkH, tz), new THREE.Quaternion(),
          new THREE.Vector3(canopyR, canopyR * 0.8, canopyR), canopyColor);
        cityData.trees.push({ position: { x: tx, z: tz } });
        occ.fill(tx, tz, 1, 1, 2.5);
      }
    }
  }

  // ── Parked cars (1 per face, reduced from 1-2) ──
  const carWeights = [
    { type: 'sedan', weight: 0.5 },
    { type: 'sports', weight: 0.2 },
    { type: 'suv', weight: 0.3 },
  ];

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;
      if (row === POLICE_GRID_ROW && col === POLICE_GRID_COL) continue; // police station

      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const carOff = HALF - ROAD / 2 - SW - 0.5;
      const faces = [
        { x: cx, z: cz + carOff, ry: 0, ax: 'x' },
        { x: cx, z: cz - carOff, ry: Math.PI, ax: 'x' },
        { x: cx + carOff, z: cz, ry: Math.PI / 2, ax: 'z' },
        { x: cx - carOff, z: cz, ry: -Math.PI / 2, ax: 'z' },
      ];

      for (const face of faces) {
        const offset = (Math.random() - 0.5) * BLOCK * 0.4;
        const px = face.ax === 'x' ? face.x + offset : face.x;
        const pz = face.ax === 'z' ? face.z + offset : face.z;
        if (!occ.isFree(px, pz, 3)) continue;

        // Pick car type
        let rv = Math.random(), acc = 0, cType = 'sedan';
        for (const cw of carWeights) { acc += cw.weight; if (rv <= acc) { cType = cw.type; break; } }
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        const quat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, face.ry + (Math.random() - 0.5) * 0.1, 0));
        const pos = new THREE.Vector3(px, 0, pz);

        // Body (colored)
        addInstance('carBody_' + cType, carBodyGeos[cType], carBodyMat, pos, quat,
          new THREE.Vector3(1, 1, 1), color);
        // Cabin (dark tinted windows)
        addInstance('carCabin_' + cType, carCabinGeos[cType], cabinWindowMat, pos, quat,
          new THREE.Vector3(1, 1, 1));
        occ.fill(px, pz, 4.5, 2.5, 0.5);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  PARK
// ═══════════════════════════════════════════════════════════

function createPark(scene, occ) {
  const r = Math.floor(GRID / 2), c = Math.floor(GRID / 2);
  const cx = c * CELL - WH + HALF, cz = r * CELL - WH + HALF;

  const grassTex = makeGrassTexture();
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(3, 3);
  const grassMat = new THREE.MeshLambertMaterial({ map: grassTex });

  const geo = new THREE.PlaneGeometry(BLOCK, BLOCK);
  const park = new THREE.Mesh(geo, grassMat);
  park.rotation.x = -Math.PI / 2;
  park.position.set(cx, 0.07, cz);
  park.receiveShadow = true;
  scene.add(park);

  // Park trees via InstancedMesh (same pattern as street trees)
  const g = 5;
  for (let r = 0; r < g; r++) {
    for (let c = 0; c < g; c++) {
      const tx = cx + (c / (g - 1) - 0.5) * BLOCK * 0.8 + (Math.random() - 0.5) * 3;
      const tz = cz + (r / (g - 1) - 0.5) * BLOCK * 0.8 + (Math.random() - 0.5) * 3;
      const trunkH = 2 + Math.random() * 2;
      const canopyR = 0.9 + Math.random() * 0.7;
      const canopyColor = new THREE.Color().setHSL(0.22 + Math.random() * 0.12, 0.8, 0.25 + Math.random() * 0.2);

      addInstance('treeTrunk', trunkGeo, treeTrunkMat,
        new THREE.Vector3(tx, 0, tz), new THREE.Quaternion(),
        new THREE.Vector3(1, trunkH, 1));
      addInstance('treeCanopy', canopyGeo, treeCanopyMat,
        new THREE.Vector3(tx, trunkH, tz), new THREE.Quaternion(),
        new THREE.Vector3(canopyR, canopyR * 0.8, canopyR), canopyColor);
      cityData.trees.push({ position: { x: tx, z: tz } });
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  LANDMARKS
// ═══════════════════════════════════════════════════════════

function placeLandmarks(scene, occ) {
  const phys = getPhysicsWorld();
  const c = Math.floor(GRID / 2);

  // Skyscraper
  const sx = c * CELL - WH + HALF, sz = (c + 1) * CELL - WH + HALF;
  const skSig = '10.0x85.0x10.0';
  const bodyGeo = new THREE.BoxGeometry(10, 85, 10);
  bodyGeo.translate(0, 42.5, 0);
  const matBody = new THREE.Matrix4().makeScale(1, 1, 1).setPosition(sx, 0, sz);
  const skTexData = getZoneTextureData('downtown_core');
  const skTexMat = new THREE.MeshLambertMaterial({ map: skTexData.texture });
  skTexMat.map.wrapS = THREE.RepeatWrapping;
  skTexMat.map.wrapT = THREE.RepeatWrapping;
  skTexMat.map.repeat.set(2, 11);
  addBuildEntry('body_skyscraper_' + skSig, bodyGeo, skTexMat, matBody);
  const roofGeo = buildRoofWithDetails(10, 10);
  roofGeo.translate(0, 85.15, 0);
  addBuildEntry('roof_skyscraper_' + skSig, roofGeo, buildRoofMat, matBody);

  // Skyscraper entrance — faces south (toward downtown)
  const skEntrance = buildEntrance(10);
  const skEMat = new THREE.Matrix4().compose(
    new THREE.Vector3(sx, 0, sz - 5),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
    new THREE.Vector3(1, 1, 1));
  addBuildEntry('entrance_skyscraper_' + skSig, skEntrance, buildRoofMat, skEMat);
  {
    const s = new CANNON.Box(new CANNON.Vec3(5, 42.5, 5));
    const b = new CANNON.Body({ mass: 0 }); b.addShape(s); b.position.set(sx, 42.5, sz); phys.addBody(b);
    cityData.buildings.push({ position: { x: sx, y: 0, z: sz }, body: b, w: 10, h: 85, d: 10 });
  }
  occ.fill(sx, sz, 10, 10, 3);

  // Antenna
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 14, 8),
    new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
  ant.position.set(sx, 92, sz);
  scene.add(ant);

  // Hospital
  const hx = (c + 3) * CELL - WH + HALF, hz = c * CELL - WH + HALF;
  const hSig = '14.0x24.0x12.0';
  const hBodyGeo = new THREE.BoxGeometry(14, 24, 12);
  hBodyGeo.translate(0, 12, 0);
  const hMat = new THREE.Matrix4().makeScale(1, 1, 1).setPosition(hx, 0, hz);
  const hTexData = getZoneTextureData('commercial');
  const hTexMat = new THREE.MeshLambertMaterial({ map: hTexData.texture });
  hTexMat.map.wrapS = THREE.RepeatWrapping;
  hTexMat.map.wrapT = THREE.RepeatWrapping;
  hTexMat.map.repeat.set(2, 3);
  addBuildEntry('body_hospital_' + hSig, hBodyGeo, hTexMat, hMat);
  const hRoofGeo = buildRoofWithDetails(14, 12);
  hRoofGeo.translate(0, 24.15, 0);
  addBuildEntry('roof_hospital_' + hSig, hRoofGeo, buildRoofMat, hMat);

  // Hospital entrance — faces south
  const hEntrance = buildEntrance(14);
  const hEMat = new THREE.Matrix4().compose(
    new THREE.Vector3(hx, 0, hz - 6),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
    new THREE.Vector3(1, 1, 1));
  addBuildEntry('entrance_hospital_' + hSig, hEntrance, buildRoofMat, hEMat);
  {
    const s = new CANNON.Box(new CANNON.Vec3(7, 12, 6));
    const b = new CANNON.Body({ mass: 0 }); b.addShape(s); b.position.set(hx, 12, hz); phys.addBody(b);
    cityData.buildings.push({ position: { x: hx, y: 0, z: hz }, body: b, w: 14, h: 24, d: 12 });
  }
  occ.fill(hx, hz, 14, 12, 2);
}

// ═══════════════════════════════════════════════════════════
//  BEACH + WATER
// ═══════════════════════════════════════════════════════════

function createBeachWater(scene) {
  const sandTex = makeSandTexture();
  sandTex.wrapS = THREE.RepeatWrapping;
  sandTex.wrapT = THREE.RepeatWrapping;
  sandTex.repeat.set(14, 2);
  const sandMat = new THREE.MeshLambertMaterial({ map: sandTex });

  const bw = WH * 2 + 60;
  const beachDepth = 70;
  const beachZ = -WH + ROAD / 2 - beachDepth / 2;
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(bw, beachDepth), sandMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, 0.04, beachZ);
  beach.receiveShadow = true;
  scene.add(beach);

  const { texture, canvas, ctx } = makeWaterTexture();
  const waterGeo = new THREE.PlaneGeometry(bw + 60, 150);
  const waterMat = new THREE.MeshLambertMaterial({
    map: texture, color: 0x1155AA,
    transparent: true, opacity: 0.85,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, WORLD.WATER_Y, beachZ - beachDepth / 2 - 75);
  water.receiveShadow = true;
  scene.add(water);
  cityData.waterMesh = water;
  cityData.waterData = { canvas, ctx, texture };
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════

export function generateCity(scene) {
  console.log('[WORLD] Generating consolidated instanced city...');

  // Init shared materials that need textures
  const swTex = makeSidewalkTexture();
  swTex.wrapS = THREE.RepeatWrapping;
  swTex.wrapT = THREE.RepeatWrapping;
  swMat = new THREE.MeshLambertMaterial({ map: swTex });

  const occ = new OccupancyGrid();
  const chunkMgr = new ChunkManager(WH + EXT);
  cityData.chunkMgr = chunkMgr;

  // Collect all geometry data
  createRoads();
  createBlockFill();
  createSidewalks();
  createRoadMarkings();

  // Build merged meshes (roads, sidewalks, markings)
  buildMerged(scene);

  // Place buildings, landmarks, park
  placeBuildings(scene, occ);
  placeLandmarks(scene, occ);
  buildPoliceStationComplex(scene, occ); // standalone complex — replaces old generic landmark
  createPark(scene, occ);

  // Build ALL instanced meshes (street furniture + park trees)
  placeFurniture(scene, occ);
  buildInstanced(scene);

  // Build consolidated building InstancedMeshes (not per-chunk — always visible)
  buildAllBuildings(scene);

  // Area lights for night-time window glow effect
  initBuildingLights(scene);

  // Beach & water
  createBeachWater(scene);

  console.log('[WORLD] Done — %d buildings, %d trees',
    cityData.buildings.length, cityData.trees.length);
}

export function updateWorld(elapsed) {
  const wd = cityData.waterData;
  if (!wd) return;

  // Throttle water animation — every 6 frames
  updateWorld._tick = (updateWorld._tick || 0) + 1;
  if (updateWorld._tick % 6 !== 0) return;

  const { canvas, ctx, texture } = wd;
  ctx.fillStyle = '#1A5276';
  ctx.fillRect(0, 0, 256, 256);
  const t = elapsed * 0.5;
  // Half-resolution drawing for performance
  for (let y = 0; y < 256; y += 24) {
    for (let x = 0; x < 256; x += 6) {
      const shade = 20 + Math.sin(x * 0.1 + y * 0.05 + t) * 15;
      ctx.fillStyle = `rgb(${15 + shade},${50 + shade},${100 + shade})`;
      ctx.fillRect(x, y + Math.sin(x * 0.05 + t) * 4, 6, 4);
    }
  }
  texture.needsUpdate = true;
}
