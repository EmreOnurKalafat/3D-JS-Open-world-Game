// assets/prefabs/complexes/hospital/index.js — Hospital complex orchestrator
// Coordinates 10 build-phase modules. Physics registered here.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { HOSPITAL_ORIGIN, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW, hx, hz, ZONE_SRC } from './constants.js';
import { buildShell } from './modules/shell.js';
import { buildRoof } from './modules/roof.js';
import { buildEmergencyInterior } from './modules/emergency.js';
import { buildMainLobby } from './modules/lobby.js';
import { buildAmbulanceBay } from './modules/ambulanceBay.js';
import { buildMainCanopy } from './modules/canopy.js';
import { buildParking } from './modules/parking.js';
import { buildGarden } from './modules/garden.js';
import { buildServiceArea } from './modules/serviceArea.js';
import { buildPerimeter } from './modules/perimeter.js';

export { HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW };

/**
 * Builds the full hospital complex and attaches it to `scene`.
 * @param {THREE.Scene}  scene
 * @param {CANNON.World} physicsWorld
 * @returns {{ group: THREE.Group, interactionZones: Array }}
 */
export function createHospital(scene, physicsWorld) {
  const physicsBodies = [];

  const group = new THREE.Group();
  group.name = 'hospital';
  group.userData.sourceFile = ZONE_SRC;

  /* Build order (back-to-front, ground-up) */
  buildShell(group, physicsBodies);
  buildRoof(group);
  buildEmergencyInterior(group);
  buildMainLobby(group);
  buildAmbulanceBay(group, physicsBodies);
  buildMainCanopy(group);
  buildParking(group);
  buildGarden(group);
  buildServiceArea(group);
  buildPerimeter(group, physicsBodies);

  /* ── Register physics bodies ──────────────────────────── */
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

  /* ── Interaction zones ────────────────────────────────── */
  const interactionZones = [
    {
      type: 'emergency_checkin',
      label: '[E] Acil Servis',
      position: { x: hx(-7), y: 0, z: hz(12) },
      radius: 3,
    },
    {
      type: 'ambulance',
      label: '[E] Ambulans Çağır',
      position: { x: hx(-7), y: 0, z: hz(18) },
      radius: 4,
    },
    {
      type: 'main_reception',
      label: '[E] Kayıt / Poliklinik',
      position: { x: hx(6), y: 0, z: hz(12) },
      radius: 3,
    },
  ];

  console.log('[HOSPITAL] Built — %d physics bodies, %d interaction zones',
    physicsBodies.length, interactionZones.length);

  return { group, interactionZones };
}
