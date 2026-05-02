// assets/prefabs/props/outdoor/copKonteyneri.js — Dumpster Prefab
// Built at origin (0,0,0). Rectangular bin with lid.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/outdoor/copKonteyneri.js';

export function createCopKonteyneri(color = 0x1a5e1a) {
  const group = new THREE.Group();
  group.name = 'CopKonteyneri';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çöp Konteyneri Prefab';

  // Bin body
  const body = boxMesh(2.0, 1.1, 1.0, new THREE.MeshLambertMaterial({ color }));
  body.position.set(0, 0.55, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Lid
  const lid = boxMesh(2.0, 0.1, 1.0, MAT.DARK_METAL);
  lid.position.set(0, 1.1, 0);
  lid.userData.sourceFile = SRC;
  group.add(lid);

  return group;
}
