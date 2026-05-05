// assets/complexes/supermarket/index.js — Supermarket complex orchestrator
// Coordinates build-phase modules. Physics registered here.
// Pattern: Same as hospital and police station complexes.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  SM_GRID_COL, SM_GRID_ROW, SM_ORIGIN_X, SM_ORIGIN_Z,
  SM_W, SM_D, SM_BH, ZONE_SRC,
} from './constants.js';

import { buildShell } from './modules/shell.js';
import { buildEntrance } from './modules/entrance.js';
import { buildCashiers } from './modules/cashiers.js';
import { buildAisles } from './modules/aisles.js';
import { buildFreshProduce } from './modules/fresh_produce.js';
import { buildBackroom } from './modules/backroom.js';
import { buildParking } from './modules/parking.js';

export { SM_GRID_COL, SM_GRID_ROW };

/**
 * Builds the full supermarket complex and attaches it to `scene`.
 * @param {THREE.Scene}  scene
 * @param {CANNON.World} physicsWorld
 * @param {boolean}      [useInstanced] — if true, skip outdoor repeated meshes, return coords
 * @returns {{ group: THREE.Group, interactionZones: Array, cars?: Array, lamps?: Array }}
 */
export function createSupermarket(scene, physicsWorld, useInstanced = false) {
  console.log('[SUPERMARKET] Constructing Mega Market...');

  const physicsBodies = [];

  const group = new THREE.Group();
  group.name = 'SupermarketComplex';
  group.userData.sourceFile = ZONE_SRC;

  // ── Invisible ground marker for editor ─────────────────────
  const markerGeo = new THREE.RingGeometry(2, 2.5, 6);
  const marker = new THREE.Mesh(
    markerGeo,
    new THREE.MeshBasicMaterial({ color: 0xff8800, side: THREE.DoubleSide }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(SM_ORIGIN_X, 0.02, SM_ORIGIN_Z);
  marker.name = 'SM_OriginMarker';
  marker.userData.sourceFile = ZONE_SRC;
  group.add(marker);

  // Collect arrays for InstancedMesh batching
  const collectCars = useInstanced ? [] : null;
  const collectLamps = useInstanced ? [] : null;

  // Build order (back-to-front, ground-up):
  buildShell(group, physicsBodies);
  buildEntrance(group, physicsBodies);
  buildCashiers(group, physicsBodies);
  buildAisles(group, physicsBodies);
  buildFreshProduce(group);
  buildBackroom(group, physicsBodies);
  buildParking(group, collectCars, collectLamps);

  // ── Register physics bodies ────────────────────────────────
  for (const pb of physicsBodies) {
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(new CANNON.Box(new CANNON.Vec3(pb.sx / 2, pb.sy / 2, pb.sz / 2)));
    body.position.copy(pb.mesh.position);
    if (pb.mesh.rotation.y !== 0) {
      body.quaternion.setFromEuler(0, pb.mesh.rotation.y, 0);
    }
    physicsWorld.addBody(body);
  }

  scene.add(group);

  // ── Interaction zones (built up as modules are added) ──────
  /** @type {Array<{type:string, label:string, position:{x:number,y:number,z:number}, radius:number}>} */
  const interactionZones = [];

  console.log('[SUPERMARKET] Stub ready — %d physics bodies, %d interaction zones',
    physicsBodies.length, interactionZones.length);

  const result = { group, interactionZones };
  if (useInstanced) {
    result.cars = collectCars;
    result.lamps = collectLamps;
  }
  return result;
}
