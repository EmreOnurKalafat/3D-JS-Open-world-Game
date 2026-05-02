// assets/prefabs/bayrak.js — Flag Prefab
// Built at origin (0,0,0). Plane with double-sided flag texture.

import * as THREE from 'three';
import { GEO, MAT } from '../../resources.js';

const SRC = 'assets/prefabs/props/decorative/bayrak.js';

export function createBayrak() {
  const group = new THREE.Group();
  group.name = 'Bayrak';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bayrak Prefab';

  const flag = new THREE.Mesh(GEO.PLANE_1, MAT.FLAG);
  flag.scale.set(0.6, 0.4, 1);
  flag.userData.sourceFile = SRC;
  group.add(flag);

  return group;
}
