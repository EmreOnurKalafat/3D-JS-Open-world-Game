// assets/complexes/parkinglot/index.js — Kuzey Acik Otopark Kompleksi
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PL_GRID_COL, PL_GRID_ROW, PL_ORIGIN_X, PL_ORIGIN_Z } from './constants.js';
import { buildLot } from './modules/lot.js';

export { PL_GRID_COL, PL_GRID_ROW };

/**
 * @param {THREE.Scene} scene
 * @param {CANNON.World} physicsWorld
 * @param {boolean} [useInstanced]
 */
export function createParkingLot(scene, physicsWorld, useInstanced = false) {
  const physicsBodies = [];
  const group = new THREE.Group();
  group.name = 'ParkingLotComplex';
  group.userData.sourceFile = 'assets/complexes/parkinglot/index.js';

  // Origin marker
  const markerGeo = new THREE.RingGeometry(1.5, 2, 6);
  const marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0x88aaff, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(PL_ORIGIN_X, 0.02, PL_ORIGIN_Z);
  group.add(marker);

  const collectCars = useInstanced ? [] : null;
  const collectLamps = useInstanced ? [] : null;
  const collectTrees = useInstanced ? [] : null;

  buildLot(group, physicsBodies, collectCars, collectLamps, collectTrees);

  // Register physics bodies
  for (const pb of physicsBodies) {
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(new CANNON.Box(new CANNON.Vec3(pb.sx / 2, pb.sy / 2, pb.sz / 2)));
    body.position.copy(pb.mesh.position);
    if (pb.mesh.rotation.y !== 0) body.quaternion.setFromEuler(0, pb.mesh.rotation.y, 0);
    physicsWorld.addBody(body);
  }

  scene.add(group);
  const result = { group, interactionZones: [] };
  if (useInstanced) {
    result.cars = collectCars;
    result.lamps = collectLamps;
    result.trees = collectTrees;
  }
  return result;
}
