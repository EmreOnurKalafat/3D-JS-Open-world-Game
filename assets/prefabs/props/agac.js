// assets/prefabs/props/agac.js — Low-Poly Tree Prefab
// Built at origin (0,0,0). Parameterized scale (default 1.0).

import * as THREE from 'three';
import { MAT, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/agac.js';

export function createAgac(scale = 1.0) {
  const group = new THREE.Group();
  group.name = 'Agac';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ağaç Prefab';

  const s = scale;

  // Trunk
  const trunk = cylMesh(0.14 * s, 0.22 * s, 2.8 * s, 8, MAT.BARK);
  trunk.position.set(0, 1.4 * s, 0);
  trunk.userData.sourceFile = SRC;
  group.add(trunk);

  // Canopy (icosahedron for leafy look)
  const canopyGeo = new THREE.IcosahedronGeometry(1.6 * s, 1);
  const canopy = new THREE.Mesh(canopyGeo, MAT.LEAF);
  canopy.position.set(0, 3.5 * s, 0);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  canopy.userData.sourceFile = SRC;
  group.add(canopy);

  return group;
}
