// assets/prefabs/vehicles/parkEdilmisArabaManager.js — InstancedMesh-based parked car placer
// Takes coordinate lists from world.js, creates performant InstancedMeshes per car type.
// userData.sourceFile points HERE so freecam editor opens this file on click.

import * as THREE from 'three';
import { MAT } from '/assets/resources.js';

const SRC = 'client/builders/carInstancedManager.js';

// Car part geometries — body + cabin per type
const BODY_GEOS = {
  sedan:  (() => { const g = new THREE.BoxGeometry(4.2, 0.8, 1.9); g.translate(0, 0.45, 0); return g; })(),
  sports: (() => { const g = new THREE.BoxGeometry(4.0, 0.55, 2.0); g.translate(0, 0.32, 0); return g; })(),
  suv:    (() => { const g = new THREE.BoxGeometry(4.4, 1.0, 2.0); g.translate(0, 0.55, 0); return g; })(),
};

const CABIN_GEOS = {
  sedan:  (() => { const g = new THREE.BoxGeometry(2.2, 0.55, 1.7); g.translate(-0.2, 1.17, 0); return g; })(),
  sports: (() => { const g = new THREE.BoxGeometry(1.8, 0.35, 1.8); g.translate(-0.3, 0.77, 0); return g; })(),
  suv:    (() => { const g = new THREE.BoxGeometry(2.4, 0.65, 1.8); g.translate(-0.1, 1.37, 0); return g; })(),
};

/**
 * Create parked car InstancedMeshes from placement data.
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
  const results = [];

  for (const [cType, entries] of Object.entries(groups)) {
    const count = entries.length;
    const dummy = new THREE.Object3D();

    // Body
    const bodyIM = new THREE.InstancedMesh(BODY_GEOS[cType], bodyMat, count);
    bodyIM.name = `ParkedCarBody_${cType}`;
    bodyIM.userData.sourceFile = SRC;
    bodyIM.userData.editorLabel = `Park Edilmiş Araba Gövde (${cType})`;

    // Cabin
    const cabinIM = new THREE.InstancedMesh(CABIN_GEOS[cType], MAT.DARK_GLASS, count);
    cabinIM.name = `ParkedCarCabin_${cType}`;
    cabinIM.userData.sourceFile = SRC;
    cabinIM.userData.editorLabel = `Park Edilmiş Araba Cam (${cType})`;

    for (let i = 0; i < count; i++) {
      const e = entries[i];
      dummy.position.set(e.x, 0, e.z);
      dummy.quaternion.copy(e.quat);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      bodyIM.setMatrixAt(i, dummy.matrix);
      bodyIM.setColorAt(i, e.color);

      cabinIM.setMatrixAt(i, dummy.matrix);
    }

    bodyIM.instanceMatrix.needsUpdate = true;
    if (bodyIM.instanceColor) bodyIM.instanceColor.needsUpdate = true;
    cabinIM.instanceMatrix.needsUpdate = true;

    scene.add(bodyIM);
    scene.add(cabinIM);
    results.push(bodyIM, cabinIM);
  }

  return results;
}
