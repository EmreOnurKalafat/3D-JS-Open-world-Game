// assets/prefabs/suSebili.js — Water Cooler Prefab
// Built at origin (0,0,0).

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/suSebili.js';

export function createSuSebili() {
  const group = new THREE.Group();
  group.name = 'SuSebili';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Su Sebili Prefab';

  // Water bottle (cylinder)
  const bottle = cylMesh(0.15, 0.15, 1.0, 8, MAT.GLASS);
  bottle.position.set(0, 0.5, 0);
  bottle.userData.sourceFile = SRC;
  group.add(bottle);

  // Base/top
  const base = boxMesh(0.4, 0.3, 0.4, MAT.WALL);
  base.position.set(0, 1.1, 0);
  base.userData.sourceFile = SRC;
  group.add(base);

  return group;
}
