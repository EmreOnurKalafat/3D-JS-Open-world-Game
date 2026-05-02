// assets/prefabs/complexes/police/modules/interiorGround.js
// Ground floor interior: lobby, offices, interrogation, cell block, armory.

import * as THREE from 'three';
import { GEO, MAT } from '../../../resources.js';
import { wx, wz } from '../constants.js';
import { box, add, addCyl, wallZ, placeChair, placeDesk, placeDolap } from './helpers.js';
import { createSuSebili } from '../../../props/office/suSebili.js';
import { createToplantiMasasi } from '../../../props/office/toplantiMasasi.js';
import { createHucreYatagi } from '../../../props/office/hucreYatagi.js';

const SRC = 'assets/prefabs/complexes/police/modules/interiorGround.js';

const { DARK_WALL:darkWall, TRIM:trimMat, WOOD:woodMat, METAL:metalMat,
        CHALK:chalkMat, MIRROR:mirrorMat, YELLOW_EMISSIVE:emissiveYellow,
        BAR_METAL:barMat } = MAT;

export function buildGroundFloorInterior(scene, params) {
  const { GH, iX1, iZ1, iZ2, WL, WR, DIV } = params;

  /* ── Lobby ──────────────────────────────────────────────── */
  box(scene, false, 4.0, 1.1, 0.8, 1.5, 0.95, -8.5, trimMat);
  box(scene, false, 4.2, 0.1, 0.9, 1.5, 1.5, -8.5, woodMat);
  for (const dx of [-0.8, 0.8]) box(scene, false, 0.1, 2.5, 0.6, dx, 1.65, -11.5, metalMat);
  box(scene, false, 1.7, 0.1, 0.6, 0, 2.95, -11.5, metalMat);

  // Lobby bench
  box(scene, false, 3.0, 0.15, 0.6, -6, 0.5, -11.0, woodMat);
  for (const bx of [-7, -5]) box(scene, false, 0.1, 0.5, 0.1, bx, 0.3, -11.0, metalMat);

  // Water cooler
  const cooler = createSuSebili();
  cooler.position.set(wx(-11), 0, wz(-11.0));
  scene.add(cooler);

  /* ── West office ────────────────────────────────────────── */
  placeDesk(scene, -10, 0, -7.5, 's');
  placeDolap(scene, -13.0, 0, -11.0, Math.PI / 2);
  placeDolap(scene, -13.0, 0, -10.0, Math.PI / 2);
  add(scene, GEO.BOX_1, chalkMat, iX1 + 0.1, 1.8, -8.0, Math.PI / 2, { sx: 0.02, sy: 1.2, sz: 2.0 });

  /* ── East office ────────────────────────────────────────── */
  placeDesk(scene, 10, 0, -7.5, 's');
  const eTable = createToplantiMasasi();
  eTable.position.set(wx(10), 0, wz(-3.5));
  scene.add(eTable);
  placeChair(scene, 10, 0, -2.5, 0);
  placeChair(scene, 10, 0, -4.5, Math.PI);
  placeChair(scene, 11.7, 0, -3.5, Math.PI / 2);
  placeChair(scene, 8.3, 0, -3.5, -Math.PI / 2);

  /* ── Interrogation ──────────────────────────────────────── */
  const mir = new THREE.Mesh(GEO.PLANE_1, mirrorMat);
  mir.scale.set(2.4, 1.5, 1);
  mir.position.set(wx(WL - 0.11), 1.6, wz(1.0));
  mir.rotation.y = Math.PI / 2;
  mir.userData.sourceFile = SRC;
  scene.add(mir);
  box(scene, false, 2.0, 0.1, 1.0, -9, 0.8, 1.0, metalMat);
  box(scene, false, 0.1, 0.7, 0.1, -9, 0.4, 1.0, trimMat);
  placeChair(scene, -9, 0, -0.2, Math.PI);
  placeChair(scene, -9, 0, 2.2, 0);

  /* ── Cell block ─────────────────────────────────────────── */
  for (const cx of [-1.5, 1.5]) box(scene, false, 0.2, GH, 7.0, cx, GH / 2, 1.0, darkWall);

  const cellEdges = [-4.4, -1.6, -1.4, 1.4, 1.6, 4.4];
  for (let ci = 0; ci < 3; ci++) {
    const cx1 = cellEdges[ci * 2], cx2 = cellEdges[ci * 2 + 1];
    const cx = (cx1 + cx2) / 2;
    for (let bx = cx1; bx <= cx2; bx += 0.2) addCyl(scene, 0.015, 0.015, GH, 8, barMat, bx, GH / 2, DIV);
    add(scene, GEO.BOX_1, barMat, cx, 1.0, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });
    add(scene, GEO.BOX_1, barMat, cx, 2.5, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });
    const bed = createHucreYatagi();
    bed.position.set(wx(cx1 + 0.5), 0, wz(iZ2 - 1.2));
    scene.add(bed);
  }

  // Left cell block wall
  wallZ(scene, false, DIV, iZ2, WL - 0.2, [], GH / 2, GH, darkWall);
  const lWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, GEO.BOX_1, barMat, WL, wy, lWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  // Right cell block wall
  wallZ(scene, false, DIV, iZ2, WR + 0.2, [], GH / 2, GH, darkWall);
  const rWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, GEO.BOX_1, barMat, WR, wy, rWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  /* ── Armory ─────────────────────────────────────────────── */
  placeDolap(scene, 13.0, 0, -1.0, -Math.PI / 2);
  for (let wy = 1.0; wy <= 2.5; wy += 0.7) {
    add(scene, GEO.BOX_1, metalMat, 9.0, wy, iZ2 - 0.2, 0, { sx: 4.0, sy: 0.05, sz: 0.3 });
    for (let gx = 7.5; gx <= 10.5; gx += 0.6) add(scene, GEO.BOX_1, trimMat, gx, wy + 0.25, iZ2 - 0.2, 0, { sx: 0.05, sy: 0.5, sz: 0.15 });
  }
  const torus = new THREE.Mesh(GEO.TORUS_SMALL, emissiveYellow);
  torus.position.set(wx(9), 1.5, wz(DIV + 2.0));
  torus.userData.interactionZone = 'armory_pickup';
  torus.userData.tag = 'armory_pickup';
  torus.userData.sourceFile = SRC;
  scene.add(torus);
}
