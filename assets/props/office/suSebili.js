// assets/props/office/suSebili.js — Su Sebili Prefab
// Water cooler with translucent jug, taps, drip tray, and base cabinet.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/office/suSebili.js';

export function createSuSebili() {
  const group = new THREE.Group();
  group.name = 'SuSebili';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Su Sebili';

  const cabinetH = 0.75;

  // Base cabinet
  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const cabinet = boxMesh(0.38, cabinetH, 0.38, cabinetMat);
  cabinet.position.set(0, cabinetH / 2, 0);
  cabinet.userData.sourceFile = SRC;
  group.add(cabinet);

  // Cabinet detail line
  const seam = boxMesh(0.40, 0.015, 0.40, MAT.FURNITURE_TRIM);
  seam.position.set(0, cabinetH * 0.5, 0);
  seam.userData.sourceFile = SRC;
  group.add(seam);

  // Water jug (inverted, translucent blue)
  const jugGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.55, 14);
  const jugMat = new THREE.MeshLambertMaterial({
    color: 0x88bbff,
    transparent: true,
    opacity: 0.45,
  });
  const jug = new THREE.Mesh(jugGeo, jugMat);
  jug.position.set(0, cabinetH - 0.02 + 0.27, 0);
  jug.userData.sourceFile = SRC;
  group.add(jug);

  // Jug neck (at bottom, goes into cabinet)
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.08, 10),
    new THREE.MeshLambertMaterial({ color: 0xcccccc })
  );
  neck.position.set(0, cabinetH - 0.04, 0);
  neck.userData.sourceFile = SRC;
  group.add(neck);

  // Jug cap ring
  const capRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.015, 6, 10),
    MAT.DARK_METAL
  );
  capRing.rotation.x = Math.PI / 2;
  capRing.position.set(0, cabinetH, 0);
  capRing.userData.sourceFile = SRC;
  group.add(capRing);

  // Water level line in jug
  const waterLevel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.16, 0.02, 14),
    new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.6 })
  );
  waterLevel.position.set(0, cabinetH + 0.05, 0);
  waterLevel.userData.sourceFile = SRC;
  group.add(waterLevel);

  // Taps (2)
  for (const side of [-1, 1]) {
    const tap = boxMesh(0.04, 0.06, 0.10, MAT.METAL);
    tap.position.set(side * 0.10, cabinetH - 0.08, 0.22);
    tap.userData.sourceFile = SRC;
    group.add(tap);

    // Colored button (blue=cold, red=hot)
    const btnColor = new THREE.MeshLambertMaterial({
      color: side === -1 ? 0x3366ff : 0xdd3333,
    });
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), btnColor);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(side * 0.10, cabinetH - 0.08, 0.29);
    btn.userData.sourceFile = SRC;
    group.add(btn);
  }

  // Drip tray
  const tray = boxMesh(0.30, 0.03, 0.12, MAT.DARK_METAL);
  tray.position.set(0, cabinetH - 0.18, 0.22);
  tray.userData.sourceFile = SRC;
  group.add(tray);

  return group;
}
