// assets/prefabs/vehicles/ambulans.js — Ambulance Vehicle Prefab
// Built at origin (0,0,0). Faces +Z (forward). Wheels at ground level.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../resources.js';

const SRC = 'assets/prefabs/vehicles/ambulans.js';

export function createAmbulans() {
  const group = new THREE.Group();
  group.name = 'Ambulans';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ambulans Prefab';
  group.userData.type = 'vehicle';

  // Main body
  const body = boxMesh(4.5, 1.9, 2.0, MAT.AMBULANCE_WHITE);
  body.position.set(0, 1.4, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Cab roof (slightly raised front section)
  const cab = boxMesh(1.8, 0.30, 1.8, MAT.AMBULANCE_WHITE);
  cab.position.set(0, 2.1, -0.1);
  cab.userData.sourceFile = SRC;
  group.add(cab);

  // Rear doors (back face)
  const rearDoor = boxMesh(0.04, 1.5, 1.9, MAT.AMBULANCE_BODY);
  rearDoor.position.set(0, 1.25, 1.01);
  rearDoor.userData.sourceFile = SRC;
  group.add(rearDoor);

  // Rear door trim
  const rearTrim = boxMesh(0.04, 1.5, 0.04, MAT.FURNITURE_TRIM);
  rearTrim.position.set(0, 1.25, 1.97);
  rearTrim.userData.sourceFile = SRC;
  group.add(rearTrim);

  // Red light bar (on cab roof)
  const lightBarRed = boxMesh(1.5, 0.18, 0.3, MAT.RED_EMISSIVE);
  lightBarRed.position.set(0, 2.35, -0.1);
  lightBarRed.userData.sourceFile = SRC;
  group.add(lightBarRed);

  // Blue beacon left
  const beaconL = boxMesh(0.3, 0.12, 0.3, MAT.BLUE_EMISSIVE);
  beaconL.position.set(-0.25, 2.5, -0.1);
  beaconL.userData.sourceFile = SRC;
  group.add(beaconL);

  // Red beacon right
  const beaconR = boxMesh(0.3, 0.12, 0.3, MAT.RED_EMISSIVE);
  beaconR.position.set(0.25, 2.5, -0.1);
  beaconR.userData.sourceFile = SRC;
  group.add(beaconR);

  // Side windows
  const sideWinL = boxMesh(0.04, 0.8, 1.4, MAT.AMBER_GLASS);
  sideWinL.position.set(-2.27, 1.7, 0);
  sideWinL.userData.sourceFile = SRC;
  group.add(sideWinL);

  // 4 wheels (cylinders on their side)
  const wheelPositions = [[1.4, 1.0], [-1.4, 1.0], [1.4, -1.0], [-1.4, -1.0]];
  for (const [wx, wz] of wheelPositions) {
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.24, 10);
    const wheel = new THREE.Mesh(wheelGeo, MAT.WHEEL);
    wheel.position.set(wx, 0.38, wz);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);

    // Hubcap
    const hubFront = cylMesh(0.18, 0.18, 0.03, 8, MAT.METAL);
    hubFront.position.set(wx, 0.38, wz + 0.13);
    hubFront.userData.sourceFile = SRC;
    group.add(hubFront);

    const hubRear = cylMesh(0.18, 0.18, 0.03, 8, MAT.METAL);
    hubRear.position.set(wx, 0.38, wz - 0.13);
    hubRear.userData.sourceFile = SRC;
    group.add(hubRear);
  }

  return group;
}
