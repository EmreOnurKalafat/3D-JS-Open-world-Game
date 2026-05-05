// assets/props/market/sogutucuAcik.js — Acik Sogutucu Dolap Prefab
// Beyaz govde + egimli ust + mavi PointLight. hasLight.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/sogutucuAcik.js';

export function createSogutucuAcik() {
  const group = new THREE.Group();
  group.name = 'SogutucuAcik';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Acik Sogutucu';
  group.userData.hasLight = true;

  const w = 2.0, d = 1.0, h = 1.8;

  // Base cabinet
  const base = boxMesh(w, 0.6, d, MAT.WHITE);
  base.position.y = 0.3;
  base.userData.sourceFile = SRC;
  group.add(base);

  // Back panel
  const back = boxMesh(w - 0.06, h - 0.6, 0.05, MAT.WHITE);
  back.position.set(0, 0.6 + (h - 0.6) / 2, -d / 2 + 0.03);
  back.userData.sourceFile = SRC;
  group.add(back);

  // Side panels
  for (const side of [-1, 1]) {
    const sidePanel = boxMesh(0.05, h - 0.6, d, MAT.WHITE);
    sidePanel.position.set(side * (w / 2 - 0.03), 0.6 + (h - 0.6) / 2, 0);
    sidePanel.userData.sourceFile = SRC;
    group.add(sidePanel);
  }

  // Angled top canopy
  const canopy = boxMesh(w, 0.08, 0.55, MAT.WHITE);
  canopy.position.set(0, h - 0.04, 0.2);
  canopy.rotation.x = -0.25;
  canopy.userData.sourceFile = SRC;
  group.add(canopy);

  // Plastic curtain strips (translucent)
  for (let i = 0; i < 7; i++) {
    const strip = boxMesh(0.04, h - 0.65, 0.02, MAT.GLASS);
    strip.position.set(-0.6 + i * 0.2, 0.6 + (h - 0.6) / 2, d / 2 - 0.08);
    strip.userData.sourceFile = SRC;
    group.add(strip);
  }

  // Blue accent LED strip
  const led = boxMesh(w - 0.2, 0.025, 0.06, MAT.BLUE_LIGHT);
  led.position.set(0, h - 0.06, 0.1);
  led.userData.sourceFile = SRC;
  group.add(led);

  // Interior blue point light
  const ptLight = new THREE.PointLight(0x4488ff, 0.6, 3);
  ptLight.position.set(0, h - 0.3, -0.15);
  ptLight.userData.sourceFile = SRC;
  group.add(ptLight);

  return group;
}
