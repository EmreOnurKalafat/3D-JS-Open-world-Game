// assets/prefabs/props/office/guvenlikKamerasi.js — Security Camera Prefab
// Built at origin (0,0,0). Wall/ceiling mounted camera on bracket.
// Faces -Z by default (mounting surface at +Z).

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/office/guvenlikKamerasi.js';

export function createGuvenlikKamerasi() {
  const group = new THREE.Group();
  group.name = 'GuvenlikKamerasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Güvenlik Kamerası Prefab';

  // Mounting bracket (vertical stem)
  const bracket = cylMesh(0.04, 0.06, 0.5, 8, MAT.FURNITURE_TRIM);
  bracket.position.set(0, 0.25, 0);
  bracket.userData.sourceFile = SRC;
  group.add(bracket);

  // Camera body (small box pointing outward in -Z)
  const body = boxMesh(0.14, 0.08, 0.22, MAT.DARK_METAL);
  body.position.set(0, 0, -0.11);
  body.userData.sourceFile = SRC;
  group.add(body);

  return group;
}
