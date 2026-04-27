// client/world.js — Correct roads, buildings in bounds, no object clipping

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { WORLD } from '/shared/constants.js';
import {
  makeRoadTexture, makeSidewalkTexture, makeGrassTexture,
  makeSandTexture, makeWaterTexture,
} from './textureBuilder.js';
import {
  buildBuilding, buildTree, buildStreetLight, buildTrafficLight,
  buildSedanCar, buildSportsCar, buildSUV,
} from './assetBuilder.js';
import { getPhysicsWorld } from './physics.js';

const BLOCK = WORLD.BLOCK_SIZE;
const ROAD = WORLD.ROAD_WIDTH;
const GRID = WORLD.GRID_SIZE;
const CELL = BLOCK + ROAD;
const HALF = CELL / 2;
const WH = (GRID / 2) * CELL;

const SW = 3;           // sidewalk width
const CURB = ROAD / 2 + SW; // distance from road center to inner sidewalk edge
const BUILD_MARGIN = 1.0;  // gap between building and sidewalk

export const cityData = { buildings: [], trees: [], waterMesh: null, waterData: null, lights: [] };

// ═══════════════════════════════════════════════════════════
//  OCCUPANCY TRACKER — prevents any overlap
// ═══════════════════════════════════════════════════════════

class OccupancyGrid {
  constructor() { this.cells = new Map(); }
  _k(x, z) {
    // 0.5 unit granularity
    return `${Math.round(x * 2)},${Math.round(z * 2)}`;
  }
  /** Mark a rectangular area as occupied */
  fill(cx, cz, w, d, extra = 0) {
    const hw = w / 2 + extra, hd = d / 2 + extra;
    const sx = Math.round((cx - hw) * 2), ex = Math.round((cx + hw) * 2);
    const sz = Math.round((cz - hd) * 2), ez = Math.round((cz + hd) * 2);
    for (let x = sx; x <= ex; x++) {
      for (let z = sz; z <= ez; z++) {
        this.cells.set(`${x},${z}`, true);
      }
    }
  }
  /** Check if position is free (at least `gap` units from any occupied cell) */
  isFree(x, z, gap = 1.0) {
    const g = Math.round(gap * 2);
    const sx = Math.round(x * 2), sz = Math.round(z * 2);
    for (let dx = -g; dx <= g; dx++) {
      for (let dz = -g; dz <= g; dz++) {
        if (this.cells.has(`${sx + dx},${sz + dz}`)) return false;
      }
    }
    return true;
  }
}

// ═══════════════════════════════════════════════════════════
//  ROAD NETWORK — correct orientation for both axes
// ═══════════════════════════════════════════════════════════

function createRoads(scene) {
  const totalLen = WH * 2 + 80;
  const roadTex = makeRoadTexture();
  roadTex.wrapS = THREE.RepeatWrapping;
  roadTex.wrapT = THREE.RepeatWrapping;

  // X-axis roads (east-west): PlaneGeometry(totalLen, ROAD), rotated flat
  // After rotation.x=-PI/2, the strip runs along world X
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    const tex = roadTex.clone();
    tex.repeat.set(totalLen / 8, 1);
    tex.needsUpdate = true;
    const mat = new THREE.MeshLambertMaterial({ map: tex, depthWrite: true });
    const geo = new THREE.PlaneGeometry(totalLen, ROAD);
    const road = new THREE.Mesh(geo, mat);
    road.rotation.x = -Math.PI / 2;  // tip XY → XZ, strip runs along X
    road.position.set(0, 0.03, z);
    road.receiveShadow = true;
    scene.add(road);
  }

  // Z-axis roads (north-south): same geometry, rotate to run along Z
  // rotation.x=-PI/2 tips flat, rotation.y=PI/2 rotates strip to align with Z
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    const tex = roadTex.clone();
    tex.repeat.set(totalLen / 8, 1);
    tex.needsUpdate = true;
    const mat = new THREE.MeshLambertMaterial({ map: tex, depthWrite: true });
    const geo = new THREE.PlaneGeometry(totalLen, ROAD);
    const road = new THREE.Mesh(geo, mat);
    road.rotation.set(-Math.PI / 2, Math.PI / 2, 0); // flat + rotate to Z axis
    road.position.set(x, 0.031, 0); // slightly above X roads to prevent z-fight at intersections
    road.receiveShadow = true;
    scene.add(road);
  }
}

// ═══════════════════════════════════════════════════════════
//  SIDEWALKS — continuous, correct orientation
// ═══════════════════════════════════════════════════════════

function createSidewalks(scene) {
  const swTex = makeSidewalkTexture();
  swTex.wrapS = THREE.RepeatWrapping;
  swTex.wrapT = THREE.RepeatWrapping;
  const swMat = new THREE.MeshLambertMaterial({ map: swTex });
  const h = 0.2;
  const EXT = 40; // extension beyond outer intersections

  // ── X-road sidewalks (run along X), segmented between Z-roads ──
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;

    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH + ROAD / 2;
      const x2 = (col + 1) * CELL - WH - ROAD / 2;
      const segLen = x2 - x1;
      const cx = (x1 + x2) / 2;

      // South sidewalk
      const ss = new THREE.Mesh(new THREE.BoxGeometry(segLen, h, SW), swMat);
      ss.position.set(cx, h / 2, z - ROAD / 2 - SW / 2);
      ss.receiveShadow = true;
      scene.add(ss);

      // North sidewalk
      const sn = new THREE.Mesh(new THREE.BoxGeometry(segLen, h, SW), swMat);
      sn.position.set(cx, h / 2, z + ROAD / 2 + SW / 2);
      sn.receiveShadow = true;
      scene.add(sn);
    }

    // Outer extensions (west and east of the city)
    const extSegW = EXT;
    const extW = (0 * CELL - WH + ROAD / 2) - EXT / 2;      // west extension center
    const extE = (GRID * CELL - WH - ROAD / 2) + EXT / 2;    // east extension center
    for (const cxExt of [extW, extE]) {
      const ss = new THREE.Mesh(new THREE.BoxGeometry(extSegW, h, SW), swMat);
      ss.position.set(cxExt, h / 2, z - ROAD / 2 - SW / 2);
      ss.receiveShadow = true;
      scene.add(ss);
      const sn = new THREE.Mesh(new THREE.BoxGeometry(extSegW, h, SW), swMat);
      sn.position.set(cxExt, h / 2, z + ROAD / 2 + SW / 2);
      sn.receiveShadow = true;
      scene.add(sn);
    }
  }

  // ── Z-road sidewalks (run along Z), segmented between X-roads ──
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;

    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH + ROAD / 2;
      const z2 = (row + 1) * CELL - WH - ROAD / 2;
      const segLen = z2 - z1;
      const cz = (z1 + z2) / 2;

      // West sidewalk
      const sw_ = new THREE.Mesh(new THREE.BoxGeometry(SW, h, segLen), swMat);
      sw_.position.set(x - ROAD / 2 - SW / 2, h / 2, cz);
      sw_.receiveShadow = true;
      scene.add(sw_);

      // East sidewalk
      const se = new THREE.Mesh(new THREE.BoxGeometry(SW, h, segLen), swMat);
      se.position.set(x + ROAD / 2 + SW / 2, h / 2, cz);
      se.receiveShadow = true;
      scene.add(se);
    }

    // Outer extensions (south and north of the city)
    const extS = (0 * CELL - WH + ROAD / 2) - EXT / 2;       // south extension center
    const extN = (GRID * CELL - WH - ROAD / 2) + EXT / 2;     // north extension center
    for (const extCZ of [extS, extN]) {
      const sw_ = new THREE.Mesh(new THREE.BoxGeometry(SW, h, EXT), swMat);
      sw_.position.set(x - ROAD / 2 - SW / 2, h / 2, extCZ);
      sw_.receiveShadow = true;
      scene.add(sw_);
      const se = new THREE.Mesh(new THREE.BoxGeometry(SW, h, EXT), swMat);
      se.position.set(x + ROAD / 2 + SW / 2, h / 2, extCZ);
      se.receiveShadow = true;
      scene.add(se);
    }
  }

  // ── Corner fill squares at each intersection ──
  const cornerGeo = new THREE.BoxGeometry(SW, h, SW);
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH;
      const iz = row * CELL - WH;
      const corners = [
        { x: ix - ROAD / 2 - SW / 2, z: iz - ROAD / 2 - SW / 2 },
        { x: ix - ROAD / 2 - SW / 2, z: iz + ROAD / 2 + SW / 2 },
        { x: ix + ROAD / 2 + SW / 2, z: iz - ROAD / 2 - SW / 2 },
        { x: ix + ROAD / 2 + SW / 2, z: iz + ROAD / 2 + SW / 2 },
      ];
      for (const c of corners) {
        const corner = new THREE.Mesh(cornerGeo, swMat);
        corner.position.set(c.x, h / 2, c.z);
        corner.receiveShadow = true;
        scene.add(corner);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  BLOCK FILL — dark ground inside each block
// ═══════════════════════════════════════════════════════════

function createBlockFill(scene) {
  // The fillable area is from curb to curb
  const fillSize = BLOCK; // within the curbs

  const fillMat = new THREE.MeshLambertMaterial({ color: 0x3A3A3A });

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue; // beach
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue; // park

      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;

      const geo = new THREE.PlaneGeometry(fillSize, fillSize);
      const fill = new THREE.Mesh(geo, fillMat);
      fill.rotation.x = -Math.PI / 2;
      fill.position.set(cx, 0.025, cz);
      fill.receiveShadow = true;
      scene.add(fill);
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

function getConfig(zone) {
  const C = {
    downtown_core: { minH:40, maxH:80, sizes:[[8,8],[9,8],[8,9]],     colors:[0x7080A0,0x8090B0,0x6880A0,0x7890A8], dens:0.95 },
    downtown:      { minH:22, maxH:48, sizes:[[7,7],[8,7],[7,8]],     colors:[0x7890A0,0x8098A8,0x7088A0,0x8898A8], dens:0.88 },
    commercial:    { minH:10, maxH:28, sizes:[[6,7],[7,6],[7,7]],     colors:[0xC09060,0xB88860,0xD0A070,0xC89868], dens:0.82 },
    residential:   { minH:7,  maxH:18, sizes:[[5,6],[6,5],[5,5]],     colors:[0xD0A070,0xC89868,0xE0B080,0xD8A878], dens:0.82 },
    suburban:      { minH:5,  maxH:13, sizes:[[5,5],[4,5],[5,4]],     colors:[0xD8C0A0,0xD0B898,0xE8D0B0,0xE0C8A8], dens:0.72 },
    industrial:    { minH:8,  maxH:20, sizes:[[10,10],[11,9],[9,11]], colors:[0x666666,0x6A6A6A,0x606060,0x707070], dens:0.78 },
    beach:         { minH:3,  maxH:8,  sizes:[[6,6],[5,6],[6,5]],     colors:[0x80C0C0,0x90D0D0,0x78B8B8,0x88C8C8], dens:0.55 },
  };
  return C[zone] || C.suburban;
}

// ═══════════════════════════════════════════════════════════
//  BUILDINGS — strictly inside sidewalk bounds
// ═══════════════════════════════════════════════════════════

function placeBuildings(scene, occ) {
  const phys = getPhysicsWorld();

  // Building area: from inner curb edge inward
  // curb distance from block center = HALF - CURB = HALF - ROAD/2 - SW
  const usableHalf = HALF - CURB - BUILD_MARGIN; // space from block center to building edge
  const usable = usableHalf * 2;

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue; // beach
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue; // park

      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;
      const zone = getZone(row, col);
      const cfg = getConfig(zone);

      const minW = cfg.sizes[0][0];
      const minD = cfg.sizes[0][1];
      const nCols = Math.max(1, Math.floor(usable / (minW + BUILD_MARGIN)));
      const nRows = Math.max(1, Math.floor(usable / (minD + BUILD_MARGIN)));
      const slotW = usable / nCols;
      const slotD = usable / nRows;
      const sx = cx - usable / 2;
      const sz = cz - usable / 2;

      for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
          if (Math.random() > cfg.dens) continue;

          const pair = cfg.sizes[Math.floor(Math.random() * cfg.sizes.length)];
          const bw = Math.min(pair[0], slotW - BUILD_MARGIN * 2);
          const bd = Math.min(pair[1], slotD - BUILD_MARGIN * 2);
          if (bw < 3 || bd < 3) continue;

          const bh = cfg.minH + Math.random() * (cfg.maxH - cfg.minH);
          const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];

          // Center in slot, small random offset
          const bx = sx + c * slotW + slotW / 2 + (Math.random() - 0.5) * (slotW - bw - BUILD_MARGIN);
          const bz = sz + r * slotD + slotD / 2 + (Math.random() - 0.5) * (slotD - bd - BUILD_MARGIN);

          // Build mesh
          const mesh = buildBuilding(bw, bh, bd, color);
          mesh.position.set(bx, 0, bz);
          scene.add(mesh);

          // Physics
          const shape = new CANNON.Box(new CANNON.Vec3(bw / 2, bh / 2, bd / 2));
          const body = new CANNON.Body({ mass: 0 });
          body.addShape(shape);
          body.position.set(bx, bh / 2, bz);
          phys.addBody(body);
          cityData.buildings.push({ mesh, body });

          // Mark footprint as occupied (with extra margin for walls)
          occ.fill(bx, bz, bw + 1.2, bd + 1.2);
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  STREET FURNITURE — placed only where free
// ═══════════════════════════════════════════════════════════

function placeFurniture(scene, occ) {
  // ── Traffic lights at every intersection ──
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH;
      const iz = row * CELL - WH;

      // 4 traffic lights per intersection
      const positions = [
        { x: ix + ROAD / 2 + SW - 1.5, z: iz + ROAD / 2 + SW - 1.5, ry: Math.PI / 4 },
        { x: ix + ROAD / 2 + SW - 1.5, z: iz - ROAD / 2 - SW + 1.5, ry: -Math.PI / 4 },
        { x: ix - ROAD / 2 - SW + 1.5, z: iz + ROAD / 2 + SW - 1.5, ry: 3 * Math.PI / 4 },
        { x: ix - ROAD / 2 - SW + 1.5, z: iz - ROAD / 2 - SW + 1.5, ry: -3 * Math.PI / 4 },
      ];
      for (const p of positions) {
        if (!occ.isFree(p.x, p.z, 2)) continue;
        const tl = buildTrafficLight();
        tl.position.set(p.x, 0, p.z);
        tl.rotation.y = p.ry;
        scene.add(tl);
        occ.fill(p.x, p.z, 1.5, 1.5, 2);
      }
    }
  }

  // ── Street lights along roads ──
  const lightSpacing = 25;
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH;
      const x2 = (col + 1) * CELL - WH;
      const z = row * CELL - WH;

      // Along X road segment, both sides
      for (let pos = x1 + lightSpacing; pos < x2 - 5; pos += lightSpacing) {
        for (const side of [-1, 1]) {
          const lx = pos;
          const lz = z + side * (ROAD / 2 + SW + 1.5);
          if (!occ.isFree(lx, lz, 2.5)) continue;
          const lamp = buildStreetLight();
          lamp.position.set(lx, 0, lz);
          lamp.rotation.y = side > 0 ? Math.PI : 0;
          scene.add(lamp);
          cityData.lights.push(lamp);
          occ.fill(lx, lz, 1, 1, 2.5);
        }
      }
    }
  }
  for (let col = 0; col <= GRID; col++) {
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH;
      const z2 = (row + 1) * CELL - WH;
      const x = col * CELL - WH;

      // Along Z road segment, both sides
      for (let pos = z1 + lightSpacing; pos < z2 - 5; pos += lightSpacing) {
        for (const side of [-1, 1]) {
          const lx = x + side * (ROAD / 2 + SW + 1.5);
          const lz = pos;
          if (!occ.isFree(lx, lz, 2.5)) continue;
          const lamp = buildStreetLight();
          lamp.position.set(lx, 0, lz);
          lamp.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
          scene.add(lamp);
          cityData.lights.push(lamp);
          occ.fill(lx, lz, 1, 1, 2.5);
        }
      }
    }
  }

  // ── Street trees along sidewalks ──
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;

      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;

      // One tree on each block face, at a fixed offset from center
      const treeOff = HALF - ROAD / 2 - SW - 1.5; // between sidewalk and buildings
      const faces = [
        { x: cx, z: cz + treeOff },
        { x: cx, z: cz - treeOff },
        { x: cx + treeOff, z: cz },
        { x: cx - treeOff, z: cz },
      ];

      for (let i = 0; i < faces.length; i++) {
        const f = faces[i];
        // 1-2 trees per face, spread along the face
        const count = 1 + Math.floor(Math.random() * 2);
        for (let t = 0; t < count; t++) {
          const offset = (t / (count || 1) - 0.5) * BLOCK * 0.5 + (Math.random() - 0.5) * 4;
          let tx = f.x, tz = f.z;
          if (i < 2) tx += offset;
          else tz += offset;

          if (!occ.isFree(tx, tz, 2.5)) continue;

          const tree = buildTree();
          tree.position.set(tx, 0, tz);
          tree.scale.setScalar(0.45 + Math.random() * 0.45);
          scene.add(tree);
          cityData.trees.push(tree);
          occ.fill(tx, tz, 1, 1, 2.5);
        }
      }
    }
  }

  // ── Parked cars along curbs ──
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;

      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;
      const carOff = HALF - ROAD / 2 - SW - 0.8; // on the curb edge

      const faces = [
        { xBase: cx, zBase: cz + carOff, ry: 0, alongAxis: 'x' },
        { xBase: cx, zBase: cz - carOff, ry: Math.PI, alongAxis: 'x' },
        { xBase: cx + carOff, zBase: cz, ry: Math.PI / 2, alongAxis: 'z' },
        { xBase: cx - carOff, zBase: cz, ry: -Math.PI / 2, alongAxis: 'z' },
      ];

      for (const face of faces) {
        const carCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < carCount; i++) {
          const offset = (i / (carCount || 1) - 0.5) * BLOCK * 0.55 + (Math.random() - 0.5) * 3;
          const px = face.alongAxis === 'x' ? face.xBase + offset : face.xBase;
          const pz = face.alongAxis === 'z' ? face.zBase + offset : face.zBase;

          if (!occ.isFree(px, pz, 4.0)) continue;

          // Pick random car type
          const types = [buildSedanCar, buildSportsCar, buildSUV];
          const w = [0.5, 0.2, 0.3];
          let rv = Math.random(), acc = 0, fn = types[0];
          for (let j = 0; j < types.length; j++) { acc += w[j]; if (rv <= acc) { fn = types[j]; break; } }
          const colors = [0xFF3030, 0xFF8800, 0x3366FF, 0xEEEEEE, 0x222222, 0x44AA44];
          const car = fn(colors[Math.floor(Math.random() * colors.length)]);
          car.position.set(px, 0.3, pz);
          car.rotation.y = face.ry;
          car.scale.setScalar(0.72 + Math.random() * 0.15);
          car.castShadow = true;
          scene.add(car);
          occ.fill(px, pz, 4.5, 2.5, 0.5);
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  SPECIAL: park, landmarks, beach/water
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

  // Trees in park — evenly spaced
  const g = 5;
  for (let r = 0; r < g; r++) {
    for (let c = 0; c < g; c++) {
      const tree = buildTree();
      tree.position.set(
        cx + (c / (g - 1) - 0.5) * BLOCK * 0.8 + (Math.random() - 0.5) * 3,
        0,
        cz + (r / (g - 1) - 0.5) * BLOCK * 0.8 + (Math.random() - 0.5) * 3
      );
      tree.scale.setScalar(0.7 + Math.random() * 0.6);
      scene.add(tree);
      cityData.trees.push(tree);
    }
  }
}

function placeLandmarks(scene, occ) {
  const phys = getPhysicsWorld();
  const c = Math.floor(GRID / 2);

  // Skyscraper in downtown core
  const sx = c * CELL - WH + HALF;
  const sz = (c + 1) * CELL - WH + HALF;
  const tower = buildBuilding(10, 85, 10, 0x7080B0);
  tower.position.set(sx, 0, sz);
  scene.add(tower);
  {
    const s = new CANNON.Box(new CANNON.Vec3(5, 42.5, 5));
    const b = new CANNON.Body({ mass: 0 }); b.addShape(s); b.position.set(sx, 42.5, sz); phys.addBody(b);
    cityData.buildings.push({ mesh: tower, body: b });
  }
  occ.fill(sx, sz, 10, 10, 3);

  // Antenna
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 14, 8),
    new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
  ant.position.set(sx, 92, sz);
  scene.add(ant);

  // Hospital
  const hx = (c + 3) * CELL - WH + HALF;
  const hz = c * CELL - WH + HALF;
  const hosp = buildBuilding(14, 24, 12, 0xEEEEEE);
  hosp.position.set(hx, 0, hz);
  scene.add(hosp);
  {
    const s = new CANNON.Box(new CANNON.Vec3(7, 12, 6));
    const b = new CANNON.Body({ mass: 0 }); b.addShape(s); b.position.set(hx, 12, hz); phys.addBody(b);
    cityData.buildings.push({ mesh: hosp, body: b });
  }
  occ.fill(hx, hz, 14, 12, 2);

  // Police station
  const px = 2 * CELL - WH + HALF;
  const pz = (GRID - 2) * CELL - WH + HALF;
  const pol = buildBuilding(12, 18, 10, 0x445588);
  pol.position.set(px, 0, pz);
  scene.add(pol);
  {
    const s = new CANNON.Box(new CANNON.Vec3(6, 9, 5));
    const b = new CANNON.Body({ mass: 0 }); b.addShape(s); b.position.set(px, 9, pz); phys.addBody(b);
    cityData.buildings.push({ mesh: pol, body: b });
  }
  occ.fill(px, pz, 12, 10, 2);
}

function createBeachWater(scene) {
  const sandTex = makeSandTexture();
  sandTex.wrapS = THREE.RepeatWrapping;
  sandTex.wrapT = THREE.RepeatWrapping;
  sandTex.repeat.set(14, 1);
  const sandMat = new THREE.MeshLambertMaterial({ map: sandTex });

  const bw = WH * 2 + 60;
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(bw, 30), sandMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, -0.3, -WH - ROAD + 12);
  beach.receiveShadow = true;
  scene.add(beach);

  // Water
  const { texture, canvas, ctx } = makeWaterTexture();
  const waterGeo = new THREE.PlaneGeometry(bw + 60, 150);
  const waterMat = new THREE.MeshPhongMaterial({
    map: texture, color: 0x1155AA, specular: 0x335577,
    shininess: 70, transparent: true, opacity: 0.85,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, WORLD.WATER_Y, -WH - ROAD - 35);
  water.receiveShadow = true;
  scene.add(water);
  cityData.waterMesh = water;
  cityData.waterData = { canvas, ctx, texture };
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════

export function generateCity(scene) {
  console.log('[WORLD] Generating city...');
  const occ = new OccupancyGrid();

  createRoads(scene);
  createBlockFill(scene);
  createSidewalks(scene);
  placeBuildings(scene, occ);
  createPark(scene, occ);
  placeLandmarks(scene, occ);
  placeFurniture(scene, occ);
  createBeachWater(scene);

  console.log('[WORLD] Done — %d buildings, %d trees, %d lights',
    cityData.buildings.length, cityData.trees.length, cityData.lights.length);
}

export function updateWorld(elapsed) {
  const wd = cityData.waterData;
  if (!wd) return;
  const { canvas, ctx, texture } = wd;
  ctx.fillStyle = '#1A5276';
  ctx.fillRect(0, 0, 256, 256);
  const t = elapsed * 0.5;
  for (let y = 0; y < 256; y += 12) {
    for (let x = 0; x < 256; x += 3) {
      const shade = 20 + Math.sin(x * 0.1 + y * 0.05 + t) * 15;
      ctx.fillStyle = `rgb(${15 + shade},${50 + shade},${100 + shade})`;
      ctx.fillRect(x, y + Math.sin(x * 0.05 + t) * 4, 3, 2);
    }
  }
  texture.needsUpdate = true;
}
