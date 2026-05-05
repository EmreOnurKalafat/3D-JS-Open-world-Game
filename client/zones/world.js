// client/zones/world.js — Thin orchestrator for procedural city generation
// Coordinates modular builders. All meshes get userData.sourceFile from their respective builder.
//
// Pattern: Constants → helpers → generateCity (8-phase pipeline) → updateWorld (water animation)

import * as THREE from 'three';
import { WORLD } from '/shared/constants.js';
import { OccupancyGrid } from '../../shared/utils.js';
import { getPhysicsWorld } from '../core/physicsManager.js';
import { ChunkManager } from '../core/chunkManager.js';
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from '/assets/complexes/police/index.js';
import { createHospital, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW } from '/assets/complexes/hospital/index.js';
import { createSupermarket, SM_GRID_COL, SM_GRID_ROW } from '/assets/complexes/supermarket/index.js';
import { SM_ORIGIN_X, SM_ORIGIN_Z } from '/assets/complexes/supermarket/constants.js';
import { createKiyafetMagazasi, GM_GRID_COL, GM_GRID_ROW } from '/assets/complexes/kiyafet/index.js';
import { GM_ORIGIN_X, GM_ORIGIN_Z } from '/assets/complexes/kiyafet/constants.js';
import { createParkingLot, PL_GRID_COL, PL_GRID_ROW } from '/assets/complexes/parkinglot/index.js';
import { PL_ORIGIN_X, PL_ORIGIN_Z } from '/assets/complexes/parkinglot/constants.js';
import { getZone, CUSTOM_BUILDINGS } from '/config/world.js';
import { createTreeInstances } from '../builders/treeInstancedManager.js';
import { createParkedCarInstances } from '../builders/carInstancedManager.js';
import {
  placeZoneBuildings, placeCustomBuilding, placeLandmarks,
} from '../builders/buildingOrchestrator.js';
import {
  initBuildingLights, updateBuildingLighting, updateBuildingTexturesForPhase,
} from '../builders/buildingFacadeManager.js';
import { buildRoadNetwork } from '../builders/roadNetworkBuilder.js';
import { createPark } from '../builders/parkBuilder.js';
import { createBeachWater, animateWater } from '../builders/environmentBuilder.js';
import { WATER_ANIM } from '/config/beachWater.js';
import { placeFurniture } from '../builders/furnitureBuilder.js';
import { lodManager } from '../core/lodManager.js';

// Re-exports for main.js
export { updateBuildingLighting, updateBuildingTexturesForPhase };

// ═══════ Grid constants ═══════
const BLOCK = WORLD.BLOCK_SIZE;
const ROAD  = WORLD.ROAD_WIDTH;
const GRID  = WORLD.GRID_SIZE;
const CELL  = BLOCK + ROAD;
const HALF  = CELL / 2;
const WH    = (GRID / 2) * CELL;
const SW    = 3;
const CURB  = ROAD / 2 + SW;
const BUILD_MARGIN = 1.0;
const EXT   = 40;

// ═══════ Shared city state ═══════
export const cityData = {
  buildings: [],
  trees: [],
  waterMesh: null,
  waterData: null,
  lights: [],
  chunkMgr: null,
  buildingLights: [],
  nightFactor: 0,
  hospitalGroup: null,
  supermarketGroup: null,
  kiyafetGroup: null,
  parkingLotGroup: null,
  policeGroups: [],
};

// ═══════ Cell classification helpers ═══════
function isHospitalCell(row, col) {
  return col === HOSPITAL_GRID_COL && row === HOSPITAL_GRID_ROW;
}

function isSupermarketCell(row, col) {
  return col === SM_GRID_COL && row === SM_GRID_ROW;
}

function isKiyafetCell(row, col) {
  return col === GM_GRID_COL && row === GM_GRID_ROW;
}

function isParkingLotCell(row, col) {
  return col === PL_GRID_COL && row === PL_GRID_ROW;
}

function isSpecialCell(row, col) {
  if (row === 0) return true;
  if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) return true;
  if (row === POLICE_GRID_ROW && col === POLICE_GRID_COL) return true;
  if (isHospitalCell(row, col)) return true;
  if (isSupermarketCell(row, col)) return true;
  if (isKiyafetCell(row, col)) return true;
  if (isParkingLotCell(row, col)) return true;
  return false;
}

// ═══════ MAIN ENTRY POINT ═══════
export function generateCity(scene) {
  console.log('[WORLD] Generating modular city...');

  const occ = new OccupancyGrid();
  const chunkMgr = new ChunkManager(WH + EXT);
  cityData.chunkMgr = chunkMgr;

  // Phase 1 — Road network: roads, sidewalks, block fills, markings, crosswalks
  buildRoadNetwork(scene, { GRID, CELL, WH, ROAD, BLOCK, HALF, SW, EXT, isSpecialCell });

  // Phase 2 — Special zones + landmarks (useInstanced → collect outdoor coords)
  const policeResult = buildPoliceStationComplex(scene, occ, cityData, true) || {};
  let hospitalResult = { group: null, trees: [], lamps: [] };
  try {
    hospitalResult = createHospital(scene, getPhysicsWorld(), true);
    cityData.hospitalGroup = hospitalResult.group;
  } catch (e) { console.error('[WORLD] Hospital creation failed:', e); }

  // Supermarket complex
  occ.fill(SM_ORIGIN_X, SM_ORIGIN_Z, 48, 50);  // building 44m + parking 4m, within block
  let marketResult = { group: null, cars: [], lamps: [] };
  try {
    marketResult = createSupermarket(scene, getPhysicsWorld(), true);
    cityData.supermarketGroup = marketResult.group;
  } catch (e) { console.error('[WORLD] Supermarket creation failed:', e); }

  // Kiyafet magazasi (kuzey bolge)
  occ.fill(GM_ORIGIN_X, GM_ORIGIN_Z, 32, 26); // bina 28×20 + margin
  let kiyafetResult = { group: null, cars: [], lamps: [] };
  try {
    kiyafetResult = createKiyafetMagazasi(scene, getPhysicsWorld(), true);
    cityData.kiyafetGroup = kiyafetResult.group;
  } catch (e) { console.error('[WORLD] Kiyafet magazasi creation failed:', e); }

  // Kuzey acik otopark
  occ.fill(PL_ORIGIN_X, PL_ORIGIN_Z, 54, 40); // lot 50×35 + margin
  let parkingLotResult = { group: null, cars: [], lamps: [], trees: [] };
  try {
    parkingLotResult = createParkingLot(scene, getPhysicsWorld(), true);
    cityData.parkingLotGroup = parkingLotResult.group;
  } catch (e) { console.error('[WORLD] Parking lot creation failed:', e); }

  // Aggregate complex outdoor coords for InstancedMesh batching
  const complexCars = [
    ...(marketResult.cars || []),
    ...(kiyafetResult.cars || []),
    ...(parkingLotResult.cars || []),
  ];
  const complexLamps = [
    ...(hospitalResult.lamps || []),
    ...(marketResult.lamps || []),
    ...(kiyafetResult.lamps || []),
    ...(parkingLotResult.lamps || []),
    ...(policeResult.lamps || []),
  ];
  const complexTrees = [
    ...(hospitalResult.trees || []),
    ...(parkingLotResult.trees || []),
  ];
  console.log('[WORLD] Complex outdoor coords — %d cars, %d lamps, %d trees',
    complexCars.length, complexLamps.length, complexTrees.length);

  placeLandmarks(scene, occ, { GRID, CELL, WH, HALF }, cityData.buildings);

  // Phase 3 — Custom/one-off buildings
  for (const bDef of CUSTOM_BUILDINGS) {
    placeCustomBuilding(scene, occ, {
      ...bDef,
      buildingsArr: cityData.buildings,
      sourceFile: bDef.sourceFile || 'data/config/world.js',
    });
  }

  // Phase 4 — Zone-based procedural buildings (InstancedMesh)
  placeZoneBuildings(scene, occ, {
    GRID, CELL, WH, HALF, CURB, BUILD_MARGIN,
    getZone, isSpecialCell,
  }, cityData.buildings);

  // Phase 5 — Park + street furniture (includes complex outdoor coords)
  const parkTreeCoords = createPark(scene, { GRID, CELL, WH, HALF, BLOCK });
  // Park trees → cityData.trees
  for (const tc of parkTreeCoords) cityData.trees.push({ position: { x: tc.x, z: tc.z } });

  const furnitureOpts = { GRID, CELL, WH, HALF, ROAD, SW, BLOCK, isSpecialCell };
  const { treeCoords, carCoords } = placeFurniture(scene, occ, furnitureOpts, cityData.trees, complexLamps);

  // InstancedMesh: all trees + parked cars (main grid + complexes)
  createTreeInstances(scene, [...parkTreeCoords, ...treeCoords, ...complexTrees]);
  createParkedCarInstances(scene, [...carCoords, ...complexCars]);

  // Complex trees → cityData.trees (for editor/spawn reference)
  for (const tc of complexTrees) cityData.trees.push({ position: { x: tc.x, z: tc.z } });

  // Phase 6 — Night lighting
  initBuildingLights(scene, CELL, WH);

  // Phase 7 — Beach & water
  createBeachWater(scene, cityData, WH, ROAD);

  // Phase 8 — Chunk registration (spatial visibility culling)
  const complexGroups = [
    cityData.hospitalGroup,
    cityData.supermarketGroup,
    cityData.kiyafetGroup,
    cityData.parkingLotGroup,
    ...cityData.policeGroups,
  ].filter(Boolean);
  for (const grp of complexGroups) {
    const pos = new THREE.Vector3();
    grp.getWorldPosition(pos);
    chunkMgr.register(chunkMgr.getKey(pos.x, pos.z), grp);
  }
  console.log('[WORLD] ChunkManager — %d groups registered', complexGroups.length);

  // LOD registration — find InstancedMeshes by name and register with distance limits
  let lodCount = 0;
  scene.traverse((obj) => {
    if (!obj.isInstancedMesh) return;
    if (obj.name === 'TreeTrunks' || obj.name === 'TreeCanopies') {
      lodManager.register(obj, 230); lodCount++;
    } else if (obj.name.startsWith('ParkedCarBody_') || obj.name.startsWith('ParkedCarCabin_')) {
      lodManager.register(obj, 180); lodCount++;
    } else if (obj.name === 'StreetLamps' || obj.name === 'TrafficLights') {
      lodManager.register(obj, 160); lodCount++;
    } else if (obj.name === 'crosswalk' || obj.name === 'crosswalkZ') {
      lodManager.register(obj, 200); lodCount++;
    } else if (obj.name.startsWith('body_') || obj.name.startsWith('entrance_') || obj.name.startsWith('roof_')) {
      // Zone buildings — always visible within fog, no LOD toggling needed
    }
  });
  console.log('[WORLD] LODManager — %d IM objects registered', lodCount);

  console.log('[WORLD] Done — %d buildings, %d trees',
    cityData.buildings.length, cityData.trees.length);
}

// ═══════ WATER ANIMATION (called each frame by main.js) ═══════
export function updateWorld(elapsed) {
  const wd = cityData.waterData;
  if (!wd) return;

  updateWorld._tick = (updateWorld._tick || 0) + 1;
  if (updateWorld._tick % WATER_ANIM.throttleFrames !== 0) return;

  animateWater(wd, elapsed);
}
