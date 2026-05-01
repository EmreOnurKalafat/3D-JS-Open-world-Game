// assets/prefabs/cit.js — Fence Segment Generator
// Creates a fence run along X or Z axis. Returns a Group built at origin.
//
// Parameters:
//   axis        — 'x' or 'z' (required)
//   start       — start coordinate along axis (required)
//   end         — end coordinate along axis (required)
//   fixedCoord  — fixed coordinate on the other axis (required)
//   fenceHeight — total fence height (default 3.0)
//   postSpacing — spacing between posts (default 1.0)

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/structures/cit.js';

export function createCitFenceRun(opts) {
  const {
    axis,
    start,
    end,
    fixedCoord,
    fenceHeight = 3.0,
    postSpacing = 1.0,
  } = opts;

  const group = new THREE.Group();
  group.name = 'CitFenceRun';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çit Prefab';

  const len = end - start;
  const mid = (start + end) / 2;

  // Base rail
  if (axis === 'x') {
    const base = boxMesh(len + 0.3, 0.15, 0.15, MAT.DARK_WALL);
    base.position.set(mid, 0.5, fixedCoord);
    base.userData.sourceFile = SRC;
    group.add(base);
  } else {
    const base = boxMesh(0.15, 0.15, len + 0.3, MAT.DARK_WALL);
    base.position.set(fixedCoord, 0.5, mid);
    base.userData.sourceFile = SRC;
    group.add(base);
  }

  // Posts
  for (let p = start; p <= end + 0.01; p += postSpacing) {
    if (axis === 'x') {
      const post = cylMesh(0.03, 0.03, fenceHeight, 8, MAT.METAL);
      post.position.set(p, fenceHeight / 2 + 0.1, fixedCoord);
      post.userData.sourceFile = SRC;
      group.add(post);
    } else {
      const post = cylMesh(0.03, 0.03, fenceHeight, 8, MAT.METAL);
      post.position.set(fixedCoord, fenceHeight / 2 + 0.1, p);
      post.userData.sourceFile = SRC;
      group.add(post);
    }
  }

  // Horizontal rails (top + middle)
  for (const rh of [1.0, 3.0]) {
    if (axis === 'x') {
      const rail = boxMesh(len + 0.3, 0.04, 0.04, MAT.METAL);
      rail.position.set(mid, rh, fixedCoord);
      rail.userData.sourceFile = SRC;
      group.add(rail);
    } else {
      const rail = boxMesh(0.04, 0.04, len + 0.3, MAT.METAL);
      rail.position.set(fixedCoord, rh, mid);
      rail.userData.sourceFile = SRC;
      group.add(rail);
    }
  }

  return group;
}
