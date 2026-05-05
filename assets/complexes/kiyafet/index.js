// assets/complexes/kiyafet/index.js — Kiyafet Magazasi Kompleksi
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GM_GRID_COL, GM_GRID_ROW, GM_ORIGIN_X, GM_ORIGIN_Z } from './constants.js';
import { buildShell } from './modules/shell.js';
import { buildEntrance } from './modules/entrance.js';
import { buildSalesFloor } from './modules/salesFloor.js';
import { buildFittingRooms } from './modules/fittingRooms.js';
import { buildCashier } from './modules/cashier.js';
import { buildBackroom } from './modules/backroom.js';
import { buildParking } from './modules/parking.js';
import { buildLighting } from './modules/lighting.js';

export { GM_GRID_COL, GM_GRID_ROW };

/**
 * @param {THREE.Scene} scene
 * @param {CANNON.World} physicsWorld
 * @param {boolean} [useInstanced]
 */
export function createKiyafetMagazasi(scene, physicsWorld, useInstanced = false) {
  const physicsBodies = [];
  const group = new THREE.Group();
  group.name = 'KiyafetMagazasiComplex';
  group.userData.sourceFile = 'assets/complexes/kiyafet/index.js';

  // Origin marker
  const markerGeo = new THREE.RingGeometry(1.5, 2, 6);
  const marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0xcc88ff, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(GM_ORIGIN_X, 0.02, GM_ORIGIN_Z);
  group.add(marker);

  const collectCars = useInstanced ? [] : null;
  const collectLamps = useInstanced ? [] : null;

  buildShell(group, physicsBodies);
  buildEntrance(group, physicsBodies);
  buildSalesFloor(group, physicsBodies);
  buildFittingRooms(group, physicsBodies);
  buildCashier(group);
  buildBackroom(group, physicsBodies);
  buildParking(group, collectCars, collectLamps);
  buildLighting(group);

  // Register physics bodies as CANNON static bodies
  for (const pb of physicsBodies) {
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(new CANNON.Box(new CANNON.Vec3(pb.sx / 2, pb.sy / 2, pb.sz / 2)));
    body.position.copy(pb.mesh.position);
    if (pb.mesh.rotation.y !== 0) body.quaternion.setFromEuler(0, pb.mesh.rotation.y, 0);
    physicsWorld.addBody(body);
  }

  scene.add(group);

  const interactionZones = [
    { label: 'Kasa', position: { x: GM_ORIGIN_X + 0, y: 0.5, z: GM_ORIGIN_Z + 7.5 }, radius: 2 },
    { label: 'Soyunma Kabini', position: { x: GM_ORIGIN_X + 11.4, y: 0, z: GM_ORIGIN_Z - 2 }, radius: 4 },
  ];

  const result = { group, interactionZones };
  if (useInstanced) {
    result.cars = collectCars;
    result.lamps = collectLamps;
  }
  return result;
}
