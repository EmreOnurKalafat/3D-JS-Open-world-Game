// assets/prefabs/complexes/police/modules/grounds.js
// Exterior grounds: parking lot, police cars, street lamps.

import * as THREE from 'three';
import { GEO, MAT } from '../../../resources.js';
import { wx, wz } from '../constants.js';
import { box, placePolisArabasi } from './helpers.js';
import { createSokakLambasi } from '../../../props/outdoor/sokakLambasi.js';

const SRC = 'assets/prefabs/complexes/police/modules/grounds.js';

const { ROOF:roofMat, WHITE:whiteLine } = MAT;

export function buildGrounds(scene, cityDataRef) {
  /* ── Parking lot ────────────────────────────────────────── */
  box(scene, false, 30.0, 0.1, 10.0, 0, 0.05, -18, roofMat);
  for (const lxP of [-8, -4, 4, 8]) {
    const line = new THREE.Mesh(GEO.PLANE_1, whiteLine);
    line.scale.set(0.15, 6.0, 1);
    line.rotation.x = -Math.PI / 2;
    line.position.set(wx(lxP), 0.11, wz(-17));
    line.userData.sourceFile = SRC;
    scene.add(line);
  }

  placePolisArabasi(scene, -6, -17, 0);
  placePolisArabasi(scene, 6, -17, 0);

  /* ── Street lamps ───────────────────────────────────────── */
  for (const lxL of [-14, 14]) {
    const lamp = createSokakLambasi();
    lamp.position.set(wx(lxL), 0, wz(-15));
    if (lxL > 0) lamp.rotation.y = Math.PI;
    scene.add(lamp);
    const lt = lamp.children.find(c => c.isPointLight);
    if (lt && cityDataRef) cityDataRef.buildingLights.push(lt);
  }
}
