// assets/prefabs/masa.js — Office Desk Prefab (with monitor, keyboard, drawer, chair)
// Built at origin (0,0,0), user sits at +Z facing -Z toward the monitor.
// For other facings, rotate the group via group.rotation.y after creation.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';
import { createSandalye } from './sandalye.js';

const SRC = 'assets/prefabs/props/office/masa.js';

export function createMasa() {
  const group = new THREE.Group();
  group.name = 'Masa';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Masa Prefab';

  // Desktop
  const top = boxMesh(1.6, 0.05, 0.8, MAT.WOOD);
  top.position.set(0, 0.75, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // 4 legs — corners of the desktop
  const legOffsets = [[0.75, 0.35], [0.75, -0.35], [-0.75, 0.35], [-0.75, -0.35]];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.05, 0.75, 0.05, MAT.TRIM);
    leg.position.set(dx, 0.375, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  // Monitor — bezel
  const bezel = boxMesh(0.5, 0.3, 0.05, MAT.TRIM);
  bezel.position.set(0, 0.95, -0.15);
  bezel.userData.sourceFile = SRC;
  group.add(bezel);

  // Monitor — screen (emissive)
  const screen = boxMesh(0.48, 0.28, 0.01, MAT.MONITOR_EMISSIVE);
  screen.position.set(0, 0.95, -0.18);
  screen.userData.sourceFile = SRC;
  group.add(screen);

  // Monitor stand
  const stand = boxMesh(0.1, 0.15, 0.1, MAT.TRIM);
  stand.position.set(0, 0.825, -0.15);
  stand.userData.sourceFile = SRC;
  group.add(stand);

  // Keyboard
  const kb = boxMesh(0.4, 0.02, 0.15, MAT.TRIM);
  kb.position.set(0, 0.77, 0.2);
  kb.userData.sourceFile = SRC;
  group.add(kb);

  // Drawer unit (right side of desk — +X)
  const drawerY = 0.45;
  const dxBase = boxMesh(0.5, 0.08, 0.5, MAT.TRIM);
  dxBase.position.set(0.7, drawerY, 0);
  dxBase.userData.sourceFile = SRC;
  group.add(dxBase);

  const dxBody = boxMesh(0.45, 0.5, 0.08, MAT.TRIM);
  dxBody.position.set(0.9, 0.75, 0);
  dxBody.userData.sourceFile = SRC;
  group.add(dxBody);

  const dxPole = cylMesh(0.05, 0.05, 0.4, 8, MAT.METAL);
  dxPole.position.set(0.7, 0.2, 0);
  dxPole.userData.sourceFile = SRC;
  group.add(dxPole);

  const dxFoot = boxMesh(0.6, 0.05, 0.6, MAT.TRIM);
  dxFoot.position.set(0.7, 0.05, 0);
  dxFoot.userData.sourceFile = SRC;
  group.add(dxFoot);

  // Chair (behind the desk, user sits here at +Z)
  const chair = createSandalye();
  chair.position.set(0, 0, 1.2);
  group.add(chair);

  return group;
}
