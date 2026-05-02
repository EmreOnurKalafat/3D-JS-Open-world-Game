// assets/prefabs/props/outdoor/jenerator.js — Industrial Generator Prefab
// Built at origin (0,0,0). Generator unit with ventilation slats.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/outdoor/jenerator.js';

export function createJenerator() {
  const group = new THREE.Group();
  group.name = 'Jenerator';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Jeneratör Prefab';

  // Main body
  const body = boxMesh(2.5, 1.4, 1.6, MAT.METAL);
  body.position.set(0, 0.7, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top cover
  const cover = boxMesh(2.5, 0.1, 1.6, MAT.DARK_METAL);
  cover.position.set(0, 1.45, 0);
  cover.userData.sourceFile = SRC;
  group.add(cover);

  // Ventilation slats (4 horizontal bars on one face)
  for (let i = 0; i < 4; i++) {
    const slat = boxMesh(2.4, 0.06, 0.04, MAT.FURNITURE_TRIM);
    slat.position.set(0, 0.5 + i * 0.25, 0.82);
    slat.userData.sourceFile = SRC;
    group.add(slat);
  }

  return group;
}
