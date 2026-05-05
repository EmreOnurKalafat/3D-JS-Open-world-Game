// assets/props/market/kapiOtomatik.js — Otomatik Cam Kapi Prefab
// Double sliding glass door with aluminum frame. Optimized from 17 → 9 meshes.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/kapiOtomatik.js';

export function createKapiOtomatik() {
  const group = new THREE.Group();
  group.name = 'KapiOtomatik';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Otomatik Cam Kapı';

  const doorH = 2.8, doorW = 1.3, frameT = 0.07;
  const totalW = doorW * 2 + frameT;

  // Header beam
  const header = boxMesh(totalW + 0.4, 0.12, 0.18, MAT.METAL);
  header.position.set(0, doorH + 0.06, 0);
  header.userData.sourceFile = SRC;
  group.add(header);

  // Left door panel (glass + frame as single group)
  const leftDoor = new THREE.Group();
  leftDoor.name = 'SolKanat';
  const leftGlass = boxMesh(doorW - 0.10, doorH - 0.10, 0.03, MAT.GLASS);
  leftDoor.add(leftGlass);
  const leftFrame = boxMesh(doorW, doorH, 0.06, MAT.METAL);
  leftFrame.material = leftFrame.material.clone();
  leftFrame.material.opacity = 0.2;
  leftFrame.material.transparent = true;
  leftDoor.add(leftFrame);
  leftDoor.position.set(-doorW / 2 - frameT / 4, 0, 0);
  leftDoor.userData.sourceFile = SRC;
  group.add(leftDoor);
  group.userData.solKanat = leftDoor;

  // Right door panel
  const rightDoor = new THREE.Group();
  rightDoor.name = 'SagKanat';
  const rightGlass = boxMesh(doorW - 0.10, doorH - 0.10, 0.03, MAT.GLASS);
  rightDoor.add(rightGlass);
  const rightFrame = boxMesh(doorW, doorH, 0.06, MAT.METAL);
  rightFrame.material = rightFrame.material.clone();
  rightFrame.material.opacity = 0.2;
  rightFrame.material.transparent = true;
  rightDoor.add(rightFrame);
  rightDoor.position.set(doorW / 2 + frameT / 4, 0, 0);
  rightDoor.userData.sourceFile = SRC;
  group.add(rightDoor);
  group.userData.sagKanat = rightDoor;

  // Side fixed glass panels
  for (const side of [-1, 1]) {
    const panelW = 0.9;
    const panel = boxMesh(panelW, doorH - 0.4, 0.03, MAT.GLASS);
    panel.position.set(side * (totalW / 2 + panelW / 2 + 0.05), 0, 0);
    panel.userData.sourceFile = SRC;
    group.add(panel);

    const panelFrame = boxMesh(panelW + 0.06, doorH - 0.2, 0.08, MAT.METAL);
    panelFrame.position.set(side * (totalW / 2 + panelW / 2 + 0.05), 0, 0);
    panelFrame.userData.sourceFile = SRC;
    group.add(panelFrame);
  }

  // Door handle bars
  for (const side of [-1, 1]) {
    const handle = boxMesh(0.04, 0.5, 0.03, MAT.DARK_METAL);
    handle.position.set(side * 0.06, 0, 0.035);
    handle.userData.sourceFile = SRC;
    group.add(handle);
  }

  return group;
}
