// client/zones/world.js — Thin orchestrator for procedural city generation
// Coordinates modular builders. All meshes get userData.sourceFile from their respective builder.
//
// Pattern: Constants → helpers → generateCity (7-phase pipeline) → updateWorld (water animation)

import { WORLD } from '/shared/constants.js';
import { OccupancyGrid } from '../../shared/utils.js';
import { getPhysicsWorld } from '../core/physicsManager.js';
import { ChunkManager } from '../core/chunkManager.js';
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from './zone_police.js';
import { createHospital, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW } from './zone_hospital.js';
import { getZone, CUSTOM_BUILDINGS } from '../../data/zones/worldData.js';
import { createTreeInstances } from '../../assets/prefabs/props/agacManager.js';
import { createParkedCarInstances } from '../../assets/prefabs/vehicles/parkEdilmisArabaManager.js';
import {
  placeZoneBuildings, placeCustomBuilding, placeLandmarks,
  initBuildingLights, updateBuildingLighting,
  updateBuildingTexturesForPhase,
} from '../builders/buildingManager.js';
import { buildRoadNetwork } from '../builders/roadNetworkBuilder.js';
import { createPark } from '../builders/parkBuilder.js';
import { createBeachWater, animateWater } from '../builders/environmentBuilder.js';
import { WATER_ANIM } from '../../data/environment/beachWaterConfig.js';
import { placeFurniture } from '../builders/furnitureBuilder.js';

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
  policeGroups: [],
};

// ═══════ Cell classification helpers ═══════
function isHospitalCell(row, col) {
  return col === HOSPITAL_GRID_COL && row === HOSPITAL_GRID_ROW;
}

function isSpecialCell(row, col) {
  if (row === 0) return true;
  if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) return true;
  if (row === POLICE_GRID_ROW && col === POLICE_GRID_COL) return true;
  if (isHospitalCell(row, col)) return true;
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

  // Phase 2 — Special zones + landmarks
  buildPoliceStationComplex(scene, occ);
  try {
    const hospitalResult = createHospital(scene, getPhysicsWorld());
    cityData.hospitalGroup = hospitalResult.group;
  } catch (e) { console.error('[WORLD] Hospital creation failed:', e); }

  placeLandmarks(scene, occ, { GRID, CELL, WH, HALF }, cityData.buildings);

  // Phase 3 — Custom/one-off buildings
  for (const bDef of CUSTOM_BUILDINGS) {
    placeCustomBuilding(scene, occ, {
      ...bDef,
      buildingsArr: cityData.buildings,
      sourceFile: bDef.sourceFile || 'data/zones/worldData.js',
    });
  }

  // Phase 4 — Zone-based procedural buildings (InstancedMesh)
  placeZoneBuildings(scene, occ, {
    GRID, CELL, WH, HALF, CURB, BUILD_MARGIN,
    getZone, isSpecialCell,
  }, cityData.buildings);

  // Phase 5 — Park + street furniture
  const parkTreeCoords = createPark(scene, { GRID, CELL, WH, HALF, BLOCK });
  // Park trees → cityData.trees
  for (const tc of parkTreeCoords) cityData.trees.push({ position: { x: tc.x, z: tc.z } });

  const furnitureOpts = { GRID, CELL, WH, HALF, ROAD, SW, BLOCK, isSpecialCell };
  const { treeCoords, carCoords } = placeFurniture(scene, occ, furnitureOpts, cityData.trees);

  // InstancedMesh: all trees + parked cars
  createTreeInstances(scene, [...parkTreeCoords, ...treeCoords]);
  createParkedCarInstances(scene, carCoords);

  // Phase 6 — Night lighting
  initBuildingLights(scene, CELL, WH);

  // Phase 7 — Beach & water
  createBeachWater(scene, cityData, WH, ROAD);

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
