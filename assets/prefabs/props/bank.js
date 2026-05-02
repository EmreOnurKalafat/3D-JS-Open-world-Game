// assets/prefabs/props/bank.js — Park Bench Prefab
// Built at origin (0,0,0). Bench extends along X axis.
// Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/bank.js';

export function createBank() {
  const group = new THREE.Group();
  group.name = 'Bank';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bank Prefab';

  // Seat plank
  const seat = boxMesh(1.8, 0.07, 0.42, MAT.FURNITURE_WOOD);
  seat.position.set(0, 0.44, 0);
  seat.userData.sourceFile = SRC;
  group.add(seat);

  // Backrest plank (behind seat at -Z)
  const backrest = boxMesh(1.8, 0.38, 0.06, MAT.FURNITURE_WOOD);
  backrest.position.set(0, 0.72, -0.18);
  backrest.userData.sourceFile = SRC;
  group.add(backrest);

  // Two side supports (armrest/leg combos at left and right ends)
  for (const dx of [-0.72, 0.72]) {
    const support = boxMesh(0.06, 0.44, 0.38, MAT.FURNITURE_TRIM);
    support.position.set(dx, 0.22, 0);
    support.userData.sourceFile = SRC;
    group.add(support);
  }

  return group;
}
