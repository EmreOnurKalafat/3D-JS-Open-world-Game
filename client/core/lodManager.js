// client/core/lodManager.js — Distance-based LOD visibility for InstancedMesh
// THREE.LOD doesn't work with InstancedMesh, so this toggles .visible
// based on camera distance to the IM's bounding box.
//
// Pattern: LODManager.register(obj, maxDist) → update(cameraPos) each frame

import * as THREE from 'three';

class LODManager {
  constructor() {
    /** @type {Array<{object: THREE.Object3D, maxDistance: number, enabled: boolean}>} */
    this.entries = [];
    this.frameCount = 0;
    this.interval = 20; // update every 20 frames (~3 Hz at 60 FPS)
  }

  /**
   * Register an object for distance-based visibility.
   * @param {THREE.Object3D|THREE.InstancedMesh} object
   * @param {number} maxDistance — visible when distance <= this value
   */
  register(object, maxDistance) {
    if (!object) return;
    this.entries.push({ object, maxDistance, enabled: true });
  }

  /**
   * Update all registered objects based on camera distance.
   * Throttled internally — safe to call every frame.
   * @param {THREE.Vector3} cameraPos
   * @returns {boolean} true if any changes
   */
  update(cameraPos) {
    this.frameCount++;
    if (this.frameCount % this.interval !== 0) return false;

    let changed = false;
    const tempBox = new THREE.Box3();
    const tempVec = new THREE.Vector3();

    for (const entry of this.entries) {
      if (!entry.enabled || !entry.object) continue;

      let dist;
      if (entry.object.isInstancedMesh) {
        // InstancedMesh: use distance to nearest instance via bounding box
        tempBox.setFromObject(entry.object);
        if (tempBox.isEmpty()) continue;
        tempBox.clampPoint(cameraPos, tempVec);
        dist = cameraPos.distanceTo(tempVec);
      } else {
        // Groups / individual meshes
        entry.object.getWorldPosition(tempVec);
        dist = cameraPos.distanceTo(tempVec);
      }

      const shouldBeVisible = dist <= entry.maxDistance;
      if (entry.object.visible !== shouldBeVisible) {
        entry.object.visible = shouldBeVisible;
        changed = true;
      }
    }
    return changed;
  }

  /** Clear all entries */
  clear() {
    this.entries.length = 0;
  }
}

export const lodManager = new LODManager();
