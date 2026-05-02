// assets/prefabs/toplantiMasasi.js — Meeting Table Prefab (parameterized)
// Built at origin (0,0,0). Chairs placed separately by caller.
// Options: { width, depth, topY, legH, legInsetX, legInsetZ }

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/office/toplantiMasasi.js';

export function createToplantiMasasi(opts = {}) {
  const {
    width = 2.5,
    depth = 1.2,
    topY = 0.8,
    legH = 0.75,
    legInsetX = 0.15,
    legInsetZ = 0.2,
  } = opts;

  const group = new THREE.Group();
  group.name = 'ToplantiMasasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Toplantı Masası Prefab';

  const halfW = width / 2;
  const halfD = depth / 2;

  // Table top
  const top = boxMesh(width, 0.1, depth, MAT.WOOD);
  top.position.set(0, topY, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // 4 legs at corners
  const legOffsets = [
    [halfW - legInsetX, halfD - legInsetZ],
    [halfW - legInsetX, -(halfD - legInsetZ)],
    [-(halfW - legInsetX), halfD - legInsetZ],
    [-(halfW - legInsetX), -(halfD - legInsetZ)],
  ];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.05, legH, 0.05, MAT.TRIM);
    leg.position.set(dx, legH / 2 + 0.05, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  return group;
}
