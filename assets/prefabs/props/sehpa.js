// assets/prefabs/props/sehpa.js — Coffee Table Prefab
// Built at origin (0,0,0). Low table with 4 thin legs.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/sehpa.js';

export function createSehpa() {
  const group = new THREE.Group();
  group.name = 'Sehpa';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sehpa Prefab';

  // Table top
  const top = boxMesh(1.1, 0.07, 0.55, MAT.FURNITURE_WOOD);
  top.position.set(0, 0.42, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // 4 thin legs
  const legOffsets = [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.04, 0.40, 0.04, MAT.FURNITURE_TRIM);
    leg.position.set(dx, 0.2, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  return group;
}
