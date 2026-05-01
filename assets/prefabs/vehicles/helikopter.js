// assets/prefabs/helikopter.js — Police Helicopter Prefab
// Built at origin (0,0,0). Rotation applied by caller via group.rotation.y.
// Scaled 1.6× vs original dimensions for R7 compliance.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';

const SRC = 'assets/prefabs/vehicles/helikopter.js';

export function createHelikopter() {
  const group = new THREE.Group();
  group.name = 'Helikopter';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Helikopter Prefab';

  // Fuselage
  const body = boxMesh(4.8, 1.92, 2.24, MAT.HELI_BODY);
  body.position.set(0, 1.3, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Cockpit nose
  const nose = boxMesh(1.92, 1.44, 1.92, MAT.GLASS);
  nose.position.set(2.9, 1.45, 0);
  nose.userData.sourceFile = SRC;
  group.add(nose);

  // Tail boom
  const tail = boxMesh(4.8, 0.64, 0.64, MAT.HELI_BODY);
  tail.position.set(-4.5, 1.0, 0);
  tail.userData.sourceFile = SRC;
  group.add(tail);

  // Tail fin
  const fin = boxMesh(0.16, 1.28, 0.96, MAT.HELI_BODY);
  fin.position.set(-6.7, 1.45, 0);
  fin.userData.sourceFile = SRC;
  group.add(fin);

  // Main rotor
  const rotor = boxMesh(0.24, 0.08, 11.2, MAT.TRIM);
  rotor.position.set(0, 2.4, 0);
  rotor.userData.sourceFile = SRC;
  group.add(rotor);

  // Rotor hub
  const hub = cylMesh(0.16, 0.16, 0.24, 8, MAT.METAL);
  hub.position.set(0, 2.4, 0);
  hub.userData.sourceFile = SRC;
  group.add(hub);

  // Tail rotor
  const tRotor = boxMesh(0.06, 1.3, 0.06, MAT.TRIM);
  tRotor.position.set(-6.7, 1.45, 0.56);
  tRotor.userData.sourceFile = SRC;
  group.add(tRotor);

  // Skids + risers
  for (const sx of [-0.8, 0.8]) {
    const skid = boxMesh(5.1, 0.13, 0.13, MAT.METAL);
    skid.position.set(0, 0.24, sx);
    skid.userData.sourceFile = SRC;
    group.add(skid);

    for (const rz of [-1.6, 1.6]) {
      const riser = cylMesh(0.05, 0.05, 0.8, 8, MAT.METAL);
      riser.position.set(rz, 0.64, sx);
      riser.userData.sourceFile = SRC;
      group.add(riser);
    }
  }

  return group;
}
