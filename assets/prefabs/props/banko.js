// assets/prefabs/props/banko.js — Reception Counter / Desk Prefab
// Built at origin (0,0,0). Tall counter with worktop, body, and legs.
// Customer side at +Z, staff side at -Z.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/banko.js';

export function createBanko() {
  const group = new THREE.Group();
  group.name = 'Banko';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Banko Prefab';

  // Counter body
  const body = boxMesh(4.0, 1.0, 0.75, MAT.WHITE);
  body.position.set(0, 0.9, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Worktop
  const top = boxMesh(4.2, 0.08, 0.80, MAT.FURNITURE_WOOD);
  top.position.set(0, 1.42, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // 4 legs
  const legOffsets = [[-1.8, 0.3], [1.8, 0.3], [-1.8, -0.3], [1.8, -0.3]];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.07, 0.9, 0.07, MAT.FURNITURE_TRIM);
    leg.position.set(dx, 0.45, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  return group;
}
