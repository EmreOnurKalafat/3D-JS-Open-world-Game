// assets/prefabs/sandalye.js — Office Chair Prefab
// Built at origin (0,0,0). Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/sandalye.js';

export function createSandalye() {
  const group = new THREE.Group();
  group.name = 'Sandalye';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sandalye Prefab';

  // Seat cushion
  const seat = boxMesh(0.5, 0.05, 0.5, MAT.SEAT);
  seat.position.set(0, 0.45, 0);
  seat.userData.sourceFile = SRC;
  group.add(seat);

  // Backrest
  const back = boxMesh(0.45, 0.5, 0.05, MAT.SEAT);
  back.position.set(0, 0.7, -0.25);
  back.userData.sourceFile = SRC;
  group.add(back);

  // Pedestal (centre pole)
  const pole = cylMesh(0.04, 0.04, 0.4, 8, MAT.METAL);
  pole.position.set(0, 0.2, 0);
  pole.userData.sourceFile = SRC;
  group.add(pole);

  // Base — cross shape
  const baseX = boxMesh(0.5, 0.03, 0.08, MAT.METAL);
  baseX.position.set(0, 0.05, 0);
  baseX.userData.sourceFile = SRC;
  group.add(baseX);

  const baseZ = boxMesh(0.08, 0.03, 0.5, MAT.METAL);
  baseZ.position.set(0, 0.05, 0);
  baseZ.userData.sourceFile = SRC;
  group.add(baseZ);

  return group;
}
