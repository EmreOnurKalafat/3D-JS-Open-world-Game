// assets/prefabs/props/hastaneYatagi.js — Hospital Bed Prefab
// Built at origin (0,0,0). Bed lies along X axis (head at +X, foot at -X).
// Rotation applied by caller via group.rotation.y.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/props/hastaneYatagi.js';

export function createHastaneYatagi() {
  const group = new THREE.Group();
  group.name = 'HastaneYatagi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Hastane Yatağı Prefab';

  // Bed frame (low box, wide)
  const frame = boxMesh(2.0, 0.22, 0.9, MAT.PIPE_METAL);
  frame.position.set(0, 0.52, 0);
  frame.userData.sourceFile = SRC;
  group.add(frame);

  // Mattress (slightly smaller than frame)
  const mattress = boxMesh(1.96, 0.16, 0.86, MAT.MATTRESS);
  mattress.position.set(0, 0.65, 0);
  mattress.userData.sourceFile = SRC;
  group.add(mattress);

  // Pillow (at head = +X end)
  const pillow = boxMesh(0.58, 0.10, 0.52, MAT.PILLOW_WHITE);
  pillow.position.set(0.7, 0.74, 0);
  pillow.userData.sourceFile = SRC;
  group.add(pillow);

  // Headboard (thin vertical slab at +X)
  const headboard = boxMesh(0.06, 0.70, 0.86, MAT.PIPE_METAL);
  headboard.position.set(0.85, 0.98, 0);
  headboard.userData.sourceFile = SRC;
  group.add(headboard);

  // IV pole (tall thin cylinder, +X side, near head)
  const ivPole = cylMesh(0.03, 0.03, 1.4, 8, MAT.PIPE_METAL);
  ivPole.position.set(0.85, 0.7, 0);
  ivPole.userData.sourceFile = SRC;
  group.add(ivPole);

  // IV monitor (small box at top of pole)
  const monitor = boxMesh(0.28, 0.18, 0.28, MAT.SCREEN_DARK);
  monitor.position.set(0.85, 1.48, 0);
  monitor.userData.sourceFile = SRC;
  group.add(monitor);

  return group;
}
