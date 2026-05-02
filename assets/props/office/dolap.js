// assets/prefabs/dolap.js — Filing Cabinet Prefab
// Built at origin (0,0,0). Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/office/dolap.js';

export function createDolap() {
  const group = new THREE.Group();
  group.name = 'Dolap';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Dolap Prefab';

  // Cabinet body
  const body = boxMesh(0.9, 1.8, 0.5, MAT.METAL);
  body.position.set(0, 0.9, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // 4 drawers with handles
  for (let i = 0; i < 4; i++) {
    const y = 0.3 + i * 0.45;

    const face = boxMesh(0.8, 0.4, 0.02, MAT.TRIM);
    face.position.set(0, y, 0.26);
    face.userData.sourceFile = SRC;
    group.add(face);

    const handle = boxMesh(0.3, 0.03, 0.04, MAT.METAL);
    handle.position.set(0, y, 0.29);
    handle.userData.sourceFile = SRC;
    group.add(handle);
  }

  return group;
}
