// assets/props/outdoor/copKonteyneri.js — Dumpster Prefab
// Body, ribbed lid, side handles, 4 wheels, front bar.

import * as THREE from 'three';
import { GEO, MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/copKonteyneri.js';

export function createCopKonteyneri(color = 0x1a5e1a) {
  const group = new THREE.Group();
  group.name = 'CopKonteyneri';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çöp Konteyneri';

  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const darkMetal = MAT.DARK_METAL;
  const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

  // ── Main body ────────────────────────────
  const body = boxMesh(2.0, 1.05, 1.0, bodyMat);
  body.position.set(0, 0.55, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // ── Front bar (for truck lift) ───────────
  const frontBar = boxMesh(1.6, 0.08, 0.06, MAT.METAL);
  frontBar.position.set(0, 0.35, 0.52);
  frontBar.userData.sourceFile = SRC;
  group.add(frontBar);

  // ── Side handles (4) ─────────────────────
  for (const side of [-1, 1]) {
    for (const y of [0.45, 0.75]) {
      const handle = boxMesh(0.15, 0.06, 0.06, MAT.METAL);
      handle.position.set(side * 1.04, y, -0.1);
      handle.userData.sourceFile = SRC;
      group.add(handle);

      // Handle bracket
      const bracket = boxMesh(0.04, 0.10, 0.06, darkMetal);
      bracket.position.set(side * 0.96, y, 0.0);
      bracket.userData.sourceFile = SRC;
      group.add(bracket);
    }
  }

  // ── Lid (slightly domed with ribs) ───────
  const lidBase = boxMesh(2.04, 0.06, 1.04, MAT.DARK_METAL);
  lidBase.position.set(0, 1.10, 0);
  lidBase.userData.sourceFile = SRC;
  group.add(lidBase);

  // Lid ribs (3 ridges along width)
  for (let x = -0.6; x <= 0.6; x += 0.6) {
    const rib = boxMesh(0.04, 0.04, 0.98, MAT.METAL);
    rib.position.set(x, 1.15, 0);
    rib.userData.sourceFile = SRC;
    group.add(rib);
  }

  // ── Lid hinges (2 at back) ───────────────
  for (const x of [-0.7, 0.7]) {
    const hinge = boxMesh(0.08, 0.06, 0.08, darkMetal);
    hinge.position.set(x, 1.10, -0.48);
    hinge.userData.sourceFile = SRC;
    group.add(hinge);
  }

  // ── Wheels (4) ───────────────────────────
  for (const side of [-1, 1]) {
    for (const z of [-0.3, 0.3]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.10, 8),
        blackMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 1.04, 0.10, z);
      wheel.castShadow = true;
      wheel.userData.sourceFile = SRC;
      group.add(wheel);

      // Axle bracket
      const axle = boxMesh(0.06, 0.04, 0.04, darkMetal);
      axle.position.set(side * 0.96, 0.08, z);
      axle.userData.sourceFile = SRC;
      group.add(axle);
    }
  }

  // ── Side reinforcement panels ────────────
  for (const side of [-1, 1]) {
    const panel = boxMesh(1.6, 0.6, 0.02, MAT.DARK_METAL);
    panel.position.set(side * 0.52, 0.55, 0);
    panel.userData.sourceFile = SRC;
    group.add(panel);
  }

  return group;
}
