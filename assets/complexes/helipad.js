// assets/prefabs/helipad.js — Helipad Prefab
// Built at origin (0,0,0). 10×10 pad with edge stripes and H marking.

import * as THREE from 'three';
import { MAT, boxMesh } from '../resources.js';

const SRC = 'assets/prefabs/complexes/helipad.js';

export function createHelipad() {
  const group = new THREE.Group();
  group.name = 'Helipad';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Helipad Prefab';

  // Pad base
  const base = boxMesh(10.0, 0.15, 10.0, MAT.PAD);
  base.position.set(0, 0.075, 0);
  base.userData.sourceFile = SRC;
  group.add(base);

  // Edge stripes
  for (const s of [-1, 1]) {
    const stripeZ = boxMesh(10.0, 0.01, 0.3, MAT.WHITE);
    stripeZ.position.set(0, 0.16, s * 5.0);
    stripeZ.userData.sourceFile = SRC;
    group.add(stripeZ);

    const stripeX = boxMesh(0.3, 0.01, 10.0, MAT.WHITE);
    stripeX.position.set(s * 5.0, 0.16, 0);
    stripeX.userData.sourceFile = SRC;
    group.add(stripeX);
  }

  // H marking
  const hLeft = boxMesh(0.3, 0.01, 4.0, MAT.WHITE);
  hLeft.position.set(-1.2, 0.16, 0);
  hLeft.userData.sourceFile = SRC;
  group.add(hLeft);

  const hRight = boxMesh(0.3, 0.01, 4.0, MAT.WHITE);
  hRight.position.set(1.2, 0.16, 0);
  hRight.userData.sourceFile = SRC;
  group.add(hRight);

  const hCross = boxMesh(2.4, 0.01, 0.3, MAT.WHITE);
  hCross.position.set(0, 0.16, 0);
  hCross.userData.sourceFile = SRC;
  group.add(hCross);

  return group;
}
