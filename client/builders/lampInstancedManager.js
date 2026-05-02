// assets/prefabs/props/sokakLambasiManager.js — InstancedMesh street lamp placer
// Takes coordinate lists from world.js, creates performant InstancedMesh.
// userData.sourceFile points HERE so freecam editor opens this file on click.
//
// Pattern: Import MAT from resources, read geometry from config, createInstances()

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAT } from '/assets/resources.js';
import { POLE, ARM } from '/config/furniture.js';

const SRC = 'client/builders/lampInstancedManager.js';

// Lamp geometry built from config dimensions
const lampBaseGeo = (() => {
  const pole = new THREE.CylinderGeometry(POLE.radiusTop, POLE.radiusBottom, POLE.height, POLE.segments);
  pole.translate(0, POLE.yOffset, 0);
  const arm = new THREE.BoxGeometry(ARM.width, ARM.height, ARM.depth);
  arm.translate(ARM.offsetX, ARM.offsetY, 0);
  return mergeGeometries([pole, arm]);
})();

/**
 * Create street lamp InstancedMesh from placement data.
 * @param {THREE.Scene} scene
 * @param {Array<{x:number, z:number, rotY:number}>} lamps
 * @returns {THREE.InstancedMesh}
 */
export function createLampInstances(scene, lamps) {
  if (lamps.length === 0) return null;

  const count = lamps.length;
  const im = new THREE.InstancedMesh(lampBaseGeo, MAT.METAL, count);
  im.name = 'StreetLamps';
  im.userData.sourceFile = SRC;
  im.userData.editorLabel = 'Sokak Lambaları (Instanced)';

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const l = lamps[i];
    dummy.position.set(l.x, 0, l.z);
    dummy.quaternion.setFromEuler(new THREE.Euler(0, l.rotY, 0));
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
  }

  im.instanceMatrix.needsUpdate = true;
  scene.add(im);
  return im;
}
