// assets/prefabs/sokakLambasi.js — Street Lamp Prefab
// Built at origin (0,0,0). Includes PointLight in the group.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/structures/sokakLambasi.js';

export function createSokakLambasi() {
  const group = new THREE.Group();
  group.name = 'SokakLambasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sokak Lambası Prefab';

  // Pole
  const pole = cylMesh(0.1, 0.15, 7.0, 12, MAT.TRIM);
  pole.position.set(0, 3.5, 0);
  pole.userData.sourceFile = SRC;
  group.add(pole);

  // Arm (extends to one side)
  const arm = boxMesh(1.5, 0.1, 0.3, MAT.TRIM);
  arm.position.set(-0.6, 6.9, 0);
  arm.userData.sourceFile = SRC;
  group.add(arm);

  // Point light (add to group, caller registers with cityData if needed)
  const light = new THREE.PointLight(0xfff5e6, 0.4, 20);
  light.position.set(-1.0, 6.8, 0);
  light.castShadow = false;
  light.userData.sourceFile = SRC;
  group.add(light);

  return group;
}
