// assets/prefabs/hucreYatagi.js — Cell Bed Prefab
// Built at origin (0,0,0). Bed frame + pillow.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/hucreYatagi.js';

export function createHucreYatagi() {
  const group = new THREE.Group();
  group.name = 'HucreYatagi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Hücre Yatağı Prefab';

  // Bed frame
  const frame = boxMesh(1.0, 0.05, 2.0, MAT.BAR_METAL);
  frame.position.set(0, 0.5, 0);
  frame.userData.sourceFile = SRC;
  group.add(frame);

  // Pillow (two stacked cylinders at head of bed, +Z side)
  const pillow1 = cylMesh(0.2, 0.2, 0.4, 8, MAT.BAR_METAL);
  pillow1.position.set(1.9, 0.4, 0.8);
  pillow1.userData.sourceFile = SRC;
  group.add(pillow1);

  const pillow2 = cylMesh(0.2, 0.2, 0.5, 8, MAT.BAR_METAL);
  pillow2.position.set(1.9, 0.7, 0.8);
  pillow2.userData.sourceFile = SRC;
  group.add(pillow2);

  return group;
}
