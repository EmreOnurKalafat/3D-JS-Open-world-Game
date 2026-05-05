// client/builders/carInstancedManager.js — InstancedMesh-based parked car placer
// Takes coordinate lists from world.js, creates performant InstancedMeshes per car type.
// Each car type gets: body (color per instance) + cabin (dark glass) + wheels (4 per car).
// Geometries match the proportions of the realistic vehicle prefabs under assets/vehicles/.
// userData.sourceFile points HERE so freecam editor opens this file on click.

import * as THREE from 'three';
import { MAT } from '/assets/resources.js';

const SRC = 'client/builders/carInstancedManager.js';

// ═══════ Car geometries — body, cabin, and 4-wheel cluster per type ═══════
// Dimensions match the realistic prefabs: sedan.js, sports.js, suv.js

const BODY_GEOS = {
  sedan:  (() => { const g = new THREE.BoxGeometry(4.1, 0.72, 2.0); g.translate(0, 0.58, 0); return g; })(),
  sports: (() => { const g = new THREE.BoxGeometry(4.2, 0.52, 2.1); g.translate(0, 0.4, 0); return g; })(),
  suv:    (() => { const g = new THREE.BoxGeometry(4.5, 0.95, 2.1); g.translate(0, 0.68, 0); return g; })(),
};

const CABIN_GEOS = {
  sedan:  (() => { const g = new THREE.BoxGeometry(2.2, 0.55, 1.8); g.translate(-0.2, 1.2, 0); return g; })(),
  sports: (() => { const g = new THREE.BoxGeometry(1.8, 0.38, 1.9); g.translate(-0.35, 0.82, 0); return g; })(),
  suv:    (() => { const g = new THREE.BoxGeometry(2.6, 0.58, 1.95); g.translate(-0.1, 1.42, 0); return g; })(),
};

// Wheel cluster: 4 cylinders at car-relative positions
function makeWheelData(type) {
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 14);
  const positions = {
    sedan:  [[1.35, 0.35, 1.08], [1.35, 0.35, -1.08], [-1.35, 0.35, 1.08], [-1.35, 0.35, -1.08]],
    sports: [[1.28, 0.33, 1.18], [1.28, 0.33, -1.18], [-1.3, 0.37, 1.2], [-1.3, 0.37, -1.2]],
    suv:    [[1.45, 0.38, 1.15], [1.45, 0.38, -1.15], [-1.45, 0.38, 1.15], [-1.45, 0.38, -1.15]],
  }[type] || [[1.35, 0.35, 1.08], [1.35, 0.35, -1.08], [-1.35, 0.35, 1.08], [-1.35, 0.35, -1.08]];

  return { singleWheel: wheelGeo, positions };
}

const WHEEL_DATA = {
  sedan:  makeWheelData('sedan'),
  sports: makeWheelData('sports'),
  suv:    makeWheelData('suv'),
};

/**
 * Create parked car InstancedMeshes from placement data.
 * Each car type gets: body IM (instance-colored) + cabin IM (dark glass) + wheels IM (4 per car).
 * @param {THREE.Scene} scene
 * @param {Array<{x:number, z:number, type:string, color:THREE.Color, quat:THREE.Quaternion}>} cars
 * @returns {THREE.InstancedMesh[]}
 */
export function createParkedCarInstances(scene, cars) {
  if (cars.length === 0) return [];

  // Group by type
  const groups = {};
  for (const c of cars) {
    if (!groups[c.type]) groups[c.type] = [];
    groups[c.type].push(c);
  }

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const cabinMat = MAT.DARK_GLASS;
  const wheelMat = MAT.WHEEL;
  const results = [];

  for (const [cType, entries] of Object.entries(groups)) {
    if (!BODY_GEOS[cType]) continue;
    const count = entries.length;
    const dummy = new THREE.Object3D();

    // Body IM (instance-colored per car)
    const bodyIM = new THREE.InstancedMesh(BODY_GEOS[cType], bodyMat, count);
    bodyIM.name = `ParkedCarBody_${cType}`;
    bodyIM.castShadow = true;
    bodyIM.receiveShadow = true;
    bodyIM.userData.sourceFile = SRC;
    bodyIM.userData.editorLabel = `Park Edilmiş Araba Gövde (${cType})`;

    // Cabin IM (shared dark glass, one material for all instances)
    const cabinIM = new THREE.InstancedMesh(CABIN_GEOS[cType], cabinMat, count);
    cabinIM.name = `ParkedCarCabin_${cType}`;
    cabinIM.userData.sourceFile = SRC;
    cabinIM.userData.editorLabel = `Park Edilmiş Araba Cam (${cType})`;

    // Wheel IM — 4 wheels per car = count * 4 instances
    const wheelCount = count * 4;
    const orientedWheel = WHEEL_DATA[cType].singleWheel.clone();
    orientedWheel.rotateX(Math.PI / 2);

    const wheelsIM = new THREE.InstancedMesh(orientedWheel, wheelMat, wheelCount);
    wheelsIM.name = `ParkedCarWheels_${cType}`;
    wheelsIM.castShadow = true;
    wheelsIM.receiveShadow = true;
    wheelsIM.userData.sourceFile = SRC;
    wheelsIM.userData.editorLabel = `Park Edilmiş Araba Tekerlek (${cType})`;

    const wheelPositions = WHEEL_DATA[cType].positions;

    for (let i = 0; i < count; i++) {
      const e = entries[i];
      dummy.position.set(e.x, 0, e.z);
      dummy.quaternion.copy(e.quat);
      dummy.updateMatrix();

      bodyIM.setMatrixAt(i, dummy.matrix);
      bodyIM.setColorAt(i, e.color || new THREE.Color(0xcccccc));

      cabinIM.setMatrixAt(i, dummy.matrix);

      // 4 wheels per car, offset from car center
      for (let w = 0; w < 4; w++) {
        const wi = i * 4 + w;
        const [wpx, wpy, wpz] = wheelPositions[w];
        dummy.position.set(e.x + wpx, wpy, e.z + wpz);
        dummy.quaternion.copy(e.quat);
        dummy.updateMatrix();
        wheelsIM.setMatrixAt(wi, dummy.matrix);
      }
    }

    bodyIM.instanceMatrix.needsUpdate = true;
    if (bodyIM.instanceColor) bodyIM.instanceColor.needsUpdate = true;
    cabinIM.instanceMatrix.needsUpdate = true;
    wheelsIM.instanceMatrix.needsUpdate = true;

    scene.add(bodyIM);
    scene.add(cabinIM);
    scene.add(wheelsIM);
    results.push(bodyIM, cabinIM, wheelsIM);
  }

  return results;
}
