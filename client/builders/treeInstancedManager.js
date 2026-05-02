// assets/prefabs/props/agacManager.js — InstancedMesh-based tree placer
// Takes coordinate lists from world.js, creates performant InstancedMeshes.
// userData.sourceFile points HERE so freecam editor opens this file on click.

import * as THREE from 'three';
import { MAT } from '/assets/resources.js';

const SRC = 'client/builders/treeInstancedManager.js';

// Shared base geometries
const trunkBaseGeo = new THREE.CylinderGeometry(0.2, 0.3, 1, 6);
trunkBaseGeo.translate(0, 0.5, 0);

const canopyBaseGeo = new THREE.IcosahedronGeometry(1, 0);

/**
 * Create tree InstancedMeshes from placement data.
 * @param {THREE.Scene} scene
 * @param {Array<{x:number, z:number, trunkH:number, canopyR:number, canopyColor:THREE.Color}>} trees
 * @returns {{trunkIM: THREE.InstancedMesh, canopyIM: THREE.InstancedMesh}}
 */
export function createTreeInstances(scene, trees) {
  if (trees.length === 0) return { trunkIM: null, canopyIM: null };

  const count = trees.length;
  const dummy = new THREE.Object3D();

  // ── Trunks ──
  const trunkIM = new THREE.InstancedMesh(trunkBaseGeo, MAT.BARK, count);
  trunkIM.name = 'TreeTrunks';
  trunkIM.userData.sourceFile = SRC;
  trunkIM.userData.editorLabel = 'Ağaç Gövdeleri (Instanced)';

  // ── Canopies ──
  const canopyMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const canopyIM = new THREE.InstancedMesh(canopyBaseGeo, canopyMat, count);
  canopyIM.name = 'TreeCanopies';
  canopyIM.userData.sourceFile = SRC;
  canopyIM.userData.editorLabel = 'Ağaç Yaprakları (Instanced)';

  for (let i = 0; i < count; i++) {
    const t = trees[i];

    dummy.position.set(t.x, 0, t.z);
    dummy.scale.set(1, t.trunkH, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    trunkIM.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, t.trunkH, t.z);
    dummy.scale.set(t.canopyR, t.canopyR * 0.8, t.canopyR);
    dummy.updateMatrix();
    canopyIM.setMatrixAt(i, dummy.matrix);
    canopyIM.setColorAt(i, t.canopyColor);
  }

  trunkIM.instanceMatrix.needsUpdate = true;
  canopyIM.instanceMatrix.needsUpdate = true;
  if (canopyIM.instanceColor) canopyIM.instanceColor.needsUpdate = true;

  scene.add(trunkIM);
  scene.add(canopyIM);

  return { trunkIM, canopyIM };
}
