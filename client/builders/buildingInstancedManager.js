// client/builders/buildingInstancedManager.js — Deferred InstancedMesh build system
// Collects build entries by signature, then flushes them as InstancedMesh batches.

import * as THREE from 'three';

const SRC = 'client/builders/buildingInstancedManager.js';

const buildGroups = new Map();

/** Queue a mesh for batched InstancedMesh creation */
export function addBuildEntry(sig, geometry, material, matrix) {
  if (!buildGroups.has(sig)) {
    buildGroups.set(sig, { geometry: geometry.clone(), material, matrices: [] });
  }
  buildGroups.get(sig).matrices.push(matrix.clone());
}

/** Flush all queued entries into InstancedMesh objects and add to scene */
export function buildAllBuildings(scene) {
  for (const [sig, group] of buildGroups) {
    const im = new THREE.InstancedMesh(group.geometry, group.material, group.matrices.length);
    group.matrices.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    im.name = sig;
    im.userData.sourceFile = SRC;
    im.userData.editorLabel = `${sig} (Instanced)`;
    scene.add(im);
  }
  buildGroups.clear();
}
