// assets/prefabs/props/trafikIsigiManager.js — InstancedMesh traffic light placer
// Takes coordinate lists from world.js, creates performant InstancedMesh.
// userData.sourceFile points HERE so freecam editor opens this file on click.
//
// Pattern: Import MAT from resources, read geometry from config, createInstances()

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAT } from '../../shared/resources.js';
import { POST, SIGNAL_BOX } from '../../../data/props/trafikIsigiConfig.js';

const SRC = 'assets/prefabs/props/trafikIsigiManager.js';

// Traffic light geometry built from config dimensions
const tlBaseGeo = (() => {
  const post = new THREE.BoxGeometry(POST.width, POST.height, POST.depth);
  post.translate(0, POST.yOffset, 0);
  const signalBox = new THREE.BoxGeometry(SIGNAL_BOX.width, SIGNAL_BOX.height, SIGNAL_BOX.depth);
  signalBox.translate(0, SIGNAL_BOX.yOffset, SIGNAL_BOX.zOffset);
  return mergeGeometries([post, signalBox]);
})();

/**
 * Create traffic light InstancedMesh from placement data.
 * @param {THREE.Scene} scene
 * @param {Array<{x:number, z:number, rotY:number}>} lights
 * @returns {THREE.InstancedMesh}
 */
export function createTrafficLightInstances(scene, lights) {
  if (lights.length === 0) return null;

  const count = lights.length;
  const im = new THREE.InstancedMesh(tlBaseGeo, MAT.METAL, count);
  im.name = 'TrafficLights';
  im.userData.sourceFile = SRC;
  im.userData.editorLabel = 'Trafik Işıkları (Instanced)';

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const tl = lights[i];
    dummy.position.set(tl.x, 0, tl.z);
    dummy.quaternion.setFromEuler(new THREE.Euler(0, tl.rotY, 0));
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
  }

  im.instanceMatrix.needsUpdate = true;
  scene.add(im);
  return im;
}
