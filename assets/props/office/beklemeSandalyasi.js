// assets/prefabs/props/office/beklemeSandalyasi.js — Waiting Room Chair Prefab
// Built at origin (0,0,0). User sits at (0,0,0) facing -Z.
// Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/office/beklemeSandalyasi.js';

export function createBeklemeSandalyasi() {
  const group = new THREE.Group();
  group.name = 'BeklemeSandalyasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bekleme Sandalyesi Prefab';

  // Seat cushion
  const seat = boxMesh(0.5, 0.08, 0.50, MAT.FURNITURE_WOOD);
  seat.position.set(0, 0.42, 0);
  seat.userData.sourceFile = SRC;
  group.add(seat);

  // Backrest (behind seat at -Z)
  const backrest = boxMesh(0.46, 0.44, 0.05, MAT.FURNITURE_WOOD);
  backrest.position.set(0, 0.70, -0.23);
  backrest.userData.sourceFile = SRC;
  group.add(backrest);

  // 4 thin legs at corners
  const legOffsets = [[0.2, 0.2], [0.2, -0.2], [-0.2, 0.2], [-0.2, -0.2]];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.04, 0.42, 0.04, MAT.FURNITURE_TRIM);
    leg.position.set(dx, 0.21, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  return group;
}
