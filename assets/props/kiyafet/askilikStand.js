// assets/props/kiyafet/askilikStand.js — Freestanding Clothing Rack (A-grade)
// Double-post garment rack with CanvasTexture base plates, cross bar.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/askilikStand.js';

export function createAskilikStand(w = 1.8) {
  const group = new THREE.Group();
  group.name = 'AskilikStand';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Askılık (' + w + 'm)';
  group.userData.rackType = 'hanging';

  const barH = 1.6;
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xc8c8c8 });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

  // 2 upright poles
  for (const dx of [-w / 2, w / 2]) {
    const pole = cylMesh(0.032, 0.032, barH, 12, chromeMat);
    pole.position.set(dx, barH / 2, 0);
    pole.userData.sourceFile = SRC;
    group.add(pole);

    // Top cap
    const cap = cylMesh(0.03, 0.036, 0.03, 8, darkMat);
    cap.position.set(dx, barH + 0.015, 0);
    cap.userData.sourceFile = SRC;
    group.add(cap);
  }

  // Horizontal bar
  const bar = cylMesh(0.025, 0.025, w, 12, chromeMat);
  bar.position.set(0, barH, 0);
  bar.rotation.z = Math.PI / 2;
  bar.userData.sourceFile = SRC;
  group.add(bar);

  // Base plates with rubber texture
  for (const dx of [-w / 2, w / 2]) {
    const basePlate = boxMesh(0.3, 0.025, 0.5, darkMat);
    basePlate.position.set(dx, 0.012, 0);
    basePlate.userData.sourceFile = SRC;
    group.add(basePlate);

    // Pole flange
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.03, 12), chromeMat);
    flange.position.set(dx, 0.03, 0);
    flange.userData.sourceFile = SRC;
    group.add(flange);
  }

  return group;
}
