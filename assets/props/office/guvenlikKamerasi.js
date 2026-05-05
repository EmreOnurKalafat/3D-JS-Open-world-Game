// assets/props/office/guvenlikKamerasi.js — Güvenlik Kamerası Prefab
// Ceiling/wall mounted security camera with lens, IR LEDs, bracket arm.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/office/guvenlikKamerasi.js';

export function createGuvenlikKamerasi() {
  const group = new THREE.Group();
  group.name = 'GuvenlikKamerasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Güvenlik Kamerası';

  // Wall plate
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12),
    MAT.METAL
  );
  plate.position.set(0, 0.02, 0.12);
  plate.userData.sourceFile = SRC;
  group.add(plate);

  // Bracket arm (from wall to camera)
  const arm = boxMesh(0.05, 0.05, 0.22, MAT.FURNITURE_TRIM);
  arm.position.set(0, 0, 0.01);
  arm.userData.sourceFile = SRC;
  group.add(arm);

  // Swivel joint
  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), MAT.DARK_METAL);
  joint.position.set(0, 0, -0.10);
  joint.userData.sourceFile = SRC;
  group.add(joint);

  // Camera body (dome style)
  const bodyGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.12, 12);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 0, -0.16);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Lens (dark cylinder front)
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.04, 10),
    MAT.SEAT
  );
  lens.position.set(0, 0, -0.23);
  lens.userData.sourceFile = SRC;
  group.add(lens);

  // Lens glass
  const lensGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.01, 10),
    new THREE.MeshLambertMaterial({ color: 0x112233, emissive: 0x001122, emissiveIntensity: 0.3 })
  );
  lensGlass.position.set(0, 0, -0.25);
  lensGlass.userData.sourceFile = SRC;
  group.add(lensGlass);

  // IR LED ring around lens
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 4, 4),
      new THREE.MeshLambertMaterial({ color: 0xff2200, emissive: 0x440000, emissiveIntensity: 0.2 })
    );
    led.position.set(
      Math.cos(angle) * 0.035,
      Math.sin(angle) * 0.035,
      -0.23
    );
    led.userData.sourceFile = SRC;
    group.add(led);
  }

  // Status LED on top
  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 4, 4),
    new THREE.MeshLambertMaterial({ color: 0x00ff00, emissive: 0x003300, emissiveIntensity: 0.4 })
  );
  statusLed.position.set(0, 0.07, -0.16);
  statusLed.userData.sourceFile = SRC;
  group.add(statusLed);

  return group;
}
