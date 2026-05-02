// assets/prefabs/complexes/police/modules/helpers.js
// Primitive placement helpers + prop wrappers for police station.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../../../../client/core/physicsManager.js';
import { GEO, MAT, boxMesh, cylMesh } from '../../../resources.js';
import { wx, wz } from '../constants.js';
import { createSandalye } from '../../../props/office/sandalye.js';
import { createMasa } from '../../../props/office/masa.js';
import { createDolap } from '../../../props/office/dolap.js';
import { createPolisArabasi } from '../../../vehicles/polisArabasi.js';
import { createHelikopter } from '../../../vehicles/helikopter.js';

const SRC = 'assets/prefabs/complexes/police/modules/helpers.js';

/** Box with shared unit-cube geometry, optional STATIC cannon body */
export function box(scene, addPhys, sx, sy, sz, lx, ly, lz, mat, mass = 0) {
  const m = boxMesh(sx, sy, sz, mat);
  m.position.set(wx(lx), ly, wz(lz));
  m.userData.sourceFile = SRC;
  scene.add(m);

  if (addPhys) {
    const phys = getPhysicsWorld();
    const shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(wx(lx), ly, wz(lz));
    if (mass === 0) body.type = CANNON.Body.STATIC;
    phys.addBody(body);
    return body;
  }
  return null;
}

/** Visual-only mesh with shared geometry + optional scale */
export function add(scene, g, mat, lx, ly, lz, ry, scale) {
  const m = new THREE.Mesh(g, mat);
  m.position.set(wx(lx), ly, wz(lz));
  if (ry) m.rotation.y = ry;
  if (scale) m.scale.set(scale.sx, scale.sy, scale.sz);
  m.castShadow = true; m.receiveShadow = true;
  m.userData.sourceFile = SRC;
  scene.add(m);
  return m;
}

/** Scaled cylinder helper */
export function addCyl(scene, rt, rb, h, segs, mat, lx, ly, lz) {
  const m = cylMesh(rt, rb, h, segs, mat);
  m.position.set(wx(lx), ly, wz(lz));
  m.userData.sourceFile = SRC;
  scene.add(m);
  return m;
}

/** Wall along X with door gaps */
export function wallX(scene, addPhys, lx1, lx2, lz, gaps, ly, h, mat, thickness = 0.2) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lx1;
  for (const [gc, gw] of sorted) {
    const g1 = gc - gw / 2;
    const w = g1 - cur;
    if (w > 0.02) box(scene, addPhys, w, h, thickness, cur + w / 2, ly, lz, mat);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lx2 - cur;
  if (rem > 0.02) box(scene, addPhys, rem, h, thickness, cur + rem / 2, ly, lz, mat);
}

/** Wall along Z with door gaps */
export function wallZ(scene, addPhys, lz1, lz2, lx, gaps, ly, h, mat, thickness = 0.2) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lz1;
  for (const [gc, gw] of sorted) {
    const g1 = gc - gw / 2;
    const d = g1 - cur;
    if (d > 0.02) box(scene, addPhys, thickness, h, d, lx, ly, cur + d / 2, mat);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lz2 - cur;
  if (rem > 0.02) box(scene, addPhys, thickness, h, rem, lx, ly, cur + rem / 2, mat);
}

/** Place a prefab chair at world position */
export function placeChair(scene, lx, ly, lz, ry = 0) {
  const c = createSandalye();
  c.position.set(wx(lx), ly, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place a prefab desk (includes chair) at world position */
export function placeDesk(scene, lx, ly, lz, facing) {
  const ry = facing === 'e' ? -Math.PI / 2 : facing === 'w' ? Math.PI / 2 : facing === 'n' ? Math.PI : 0;
  const d = createMasa();
  d.position.set(wx(lx), ly, wz(lz));
  d.rotation.y = ry;
  scene.add(d);
}

/** Place filing cabinet prefab */
export function placeDolap(scene, lx, ly, lz, ry = 0) {
  const c = createDolap();
  c.position.set(wx(lx), ly, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place police car prefab */
export function placePolisArabasi(scene, lx, lz, ry) {
  const c = createPolisArabasi();
  c.position.set(wx(lx), 0, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place helicopter prefab */
export function placeHelikopter(scene, lx, ly, lz) {
  const h = createHelikopter();
  h.position.set(wx(lx), ly, wz(lz));
  h.name = 'police_helicopter';
  scene.add(h);
}
