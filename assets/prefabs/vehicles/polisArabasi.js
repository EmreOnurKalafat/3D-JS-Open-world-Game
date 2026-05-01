// assets/prefabs/polisArabasi.js — Police Car Prefab
// Built at origin (0,0,0). Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/vehicles/polisArabasi.js';

export function createPolisArabasi() {
  const group = new THREE.Group();
  group.name = 'PolisArabasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Polis Arabası Prefab';

  // Main body
  const body = boxMesh(4.8, 0.8, 2.0, MAT.WALL);
  body.position.set(0, 0.5, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Cabin
  const cabin = boxMesh(2.4, 0.6, 1.8, MAT.TRIM);
  cabin.position.set(-0.2, 1.2, 0);
  cabin.userData.sourceFile = SRC;
  group.add(cabin);

  // Roof light bar
  const bar = boxMesh(0.1, 0.1, 1.6, MAT.METAL);
  bar.position.set(-0.2, 1.55, 0);
  bar.userData.sourceFile = SRC;
  group.add(bar);

  // Red beacon
  const red = boxMesh(0.3, 0.15, 0.5, MAT.RED_LIGHT);
  red.position.set(-0.2, 1.55, -0.5);
  red.userData.sourceFile = SRC;
  group.add(red);

  // Blue beacon
  const blue = boxMesh(0.3, 0.15, 0.5, MAT.BLUE_LIGHT);
  blue.position.set(-0.2, 1.55, 0.5);
  blue.userData.sourceFile = SRC;
  group.add(blue);

  // 4 wheels
  const wheelOffsets = [[-1.4, 1.0], [1.4, 1.0], [-1.4, -1.0], [1.4, -1.0]];
  for (const [dx, dz] of wheelOffsets) {
    const wheel = cylMesh(0.35, 0.35, 0.25, 12, MAT.WHEEL);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(dx, 0.35, dz);
    wheel.userData.sourceFile = SRC;
    group.add(wheel);
  }

  return group;
}
