// assets/prefabs/complexes/police/modules/mainBuilding.js
// Building shell, exterior architecture, roof, interior walls, staircase.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../../../../client/core/physicsManager.js';
import { GEO, MAT } from '../../../resources.js';
import { makeSignTexture } from '../textures.js';
import { wx, wz } from '../constants.js';
import { box, add, addCyl, wallX, wallZ } from './helpers.js';
import { createMerdiven } from '../../../props/outdoor/merdiven.js';

const SRC = 'assets/prefabs/complexes/police/modules/mainBuilding.js';

const { FLOOR:floorMat, DARK_WALL:darkWall, TRIM:trimMat,
        ACCENT:accentMat, ROOF:roofMat, METAL:metalMat,
        GLASS:glassMat } = MAT;

const door12 = 1.2;
const door20 = 2.0;

/** Gap arrays for interior wall runs */
function makeGaps(WL, WR, DIV) {
  return {
    GF_DIV: [[0, door20], [-8.5, door12], [8.5, door12]],
    GF_WL:  [[-8.5, door12], [1.0, door12]],
    GF_WR:  [[-8.5, door12], [1.0, door12]],
    UF_DIV: [[0, door20], [-8.5, door12], [8.5, door12]],
    UF_WL:  [[-8.5, door12], [1.0, door12]],
    UF_WR:  [[-8.5, door12], [1.0, door12]],
  };
}

export function buildMainBuilding(scene, params) {
  const { facadeMat, GH, TH, uY, iX1, iX2, iZ1, iZ2, WL, WR, DIV } = params;
  const gaps = makeGaps(WL, WR, DIV);

  /* ── Foundation & ground floor slab ────────────────────── */
  box(scene, true, 30.0, 0.4, 20.0, 0, 0.2, -4, darkWall);

  const fl = new THREE.Mesh(GEO.PLANE_1, floorMat);
  fl.scale.set(28.0, 18.0, 1);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(wx(0), 0.41, wz(-4));
  fl.receiveShadow = true;
  fl.userData.sourceFile = SRC;
  scene.add(fl);

  /* ── Exterior architecture ─────────────────────────────── */

  // North back wall — facaded
  const northWall = new THREE.Mesh(GEO.BOX_1, facadeMat);
  northWall.scale.set(28.0, TH, 0.4);
  northWall.position.set(wx(0), TH / 2, wz(iZ2 + 0.2));
  northWall.castShadow = true; northWall.receiveShadow = true;
  northWall.userData.sourceFile = SRC;
  scene.add(northWall);
  {
    const phys = getPhysicsWorld();
    const shape = new CANNON.Box(new CANNON.Vec3(14.0, TH / 2, 0.2));
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(shape);
    body.position.set(wx(0), TH / 2, wz(iZ2 + 0.2));
    phys.addBody(body);
  }

  // East + West walls — with facade
  box(scene, true, 0.4, TH, 18.0, iX2 + 0.2, TH / 2, -4, facadeMat);
  box(scene, true, 0.4, TH, 18.0, iX1 - 0.2, TH / 2, -4, facadeMat);

  // Front structural pillars (skip entrance at px=0)
  for (let px = -13.5; px <= 13.5; px += 4.5) {
    if (px === 0) continue;
    box(scene, true, 0.6, TH, 0.6, px, TH / 2, iZ1, trimMat);
  }
  box(scene, true, 28.0, 0.6, 0.6, 0, uY, iZ1, trimMat);

  // Main entrance — glass panels (skip wider entrance)
  for (let px = -11.25; px <= 11.25; px += 4.5) {
    if (Math.abs(px) < 3.5) continue;
    box(scene, false, 3.9, 1.0, 0.4, px, 0.9, iZ1, darkWall);
    add(scene, GEO.BOX_1, glassMat, px, 2.75, iZ1, 0, { sx: 3.9, sy: 3.5, sz: 0.1 });
    box(scene, false, 3.9, 0.8, 0.4, px, uY + 0.7, iZ1, darkWall);
    add(scene, GEO.BOX_1, glassMat, px, uY + 2.95, iZ1, 0, { sx: 3.9, sy: 3.7, sz: 0.1 });
  }

  // Door frame pillars
  for (const dx of [-3.0, 3.0]) {
    box(scene, false, 0.4, GH, 0.4, dx, GH / 2, iZ1, trimMat);
    box(scene, false, 0.4, GH, 0.4, dx, uY + GH / 2, iZ1, trimMat);
  }

  // Door top frame
  box(scene, false, 6.5, 0.15, 0.3, 0, GH + 0.075, iZ1, trimMat);

  // Main entrance overhang
  box(scene, false, 8.0, 0.5, 3.0, 0, 4.25, iZ1 - 1.5, trimMat);

  /* ── Police station sign (faces outward) ───────────────── */
  box(scene, false, 8.2, 1.2, 0.4, 0, 5.25, iZ1 + 0.15, accentMat);
  add(scene, GEO.BOX_1, glassMat, 0, uY + 2.95, iZ1, 0, { sx: 7.2, sy: 3.7, sz: 0.1 });

  const signTex = makeSignTexture('POLICE STATION', '#0a1a3a', '#ffffff');
  const signMesh = new THREE.Mesh(GEO.PLANE_1, new THREE.MeshLambertMaterial({ map: signTex, side: THREE.DoubleSide }));
  signMesh.scale.set(7.0, 0.8, 1);
  signMesh.rotation.y = Math.PI;
  signMesh.position.set(wx(0), 5.25, wz(iZ1 - 0.24));
  signMesh.userData.sourceFile = SRC;
  scene.add(signMesh);

  /* ── Roof & upper floor slab ───────────────────────────── */
  box(scene, true, 29.0, 0.5, 19.0, 0, TH + 0.25, -4, roofMat);

  // Parapets + HVAC
  box(scene, false, 29.0, 1.0, 0.2, 0, TH + 1.0, iZ2 + 0.4, trimMat);
  box(scene, false, 29.0, 1.0, 0.2, 0, TH + 1.0, iZ1 - 0.4, trimMat);
  box(scene, false, 3.0, 1.5, 2.0, -5, TH + 1.25, 0, metalMat);
  box(scene, false, 2.0, 1.2, 2.0, 6, TH + 1.1, -5, metalMat);

  // Upper floor slab — 4 parts around stair hole
  const ufH = 0.2;
  const holeX1 = -4.5, holeX2 = -1.5, holeZ1 = -7.0, holeZ2 = -2.5;
  box(scene, true, 27.0, ufH, holeZ1 - iZ1, 0, uY, (iZ1 + holeZ1) / 2, floorMat);
  box(scene, true, 27.0, ufH, iZ2 - holeZ2, 0, uY, (holeZ2 + iZ2) / 2, floorMat);
  box(scene, true, holeX1 - iX1, ufH, holeZ2 - holeZ1, (iX1 + holeX1) / 2, uY, (holeZ1 + holeZ2) / 2, floorMat);
  box(scene, true, iX2 - holeX2, ufH, holeZ2 - holeZ1, (holeX2 + iX2) / 2, uY, (holeZ1 + holeZ2) / 2, floorMat);

  /* ── Interior walls ────────────────────────────────────── */
  wallX(scene, false, iX1, iX2, DIV, gaps.GF_DIV, GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WL, gaps.GF_WL, GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WR, gaps.GF_WR, GH / 2, GH, darkWall);
  wallX(scene, false, iX1, iX2, DIV, gaps.UF_DIV, uY + GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WL, gaps.UF_WL, uY + GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WR, gaps.UF_WR, uY + GH / 2, GH, darkWall);

  /* ── Staircase ──────────────────────────────────────────── */
  const stair = createMerdiven({ totalHeight: uY });
  stair.position.set(wx(0), 0, wz(0));
  scene.add(stair);
}
