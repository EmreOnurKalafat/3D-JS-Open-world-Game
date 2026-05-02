// assets/zoneHelpers.js — Standard zone placement helpers v2
// All complexes SHOULD use these instead of writing their own box/cylinder/slab helpers.
// Flat-parameter API — matches the style used by hospital and police zone modules.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GEO } from './resources.js';
import { getPhysicsWorld } from '../client/core/physicsManager.js';

const DEFAULT_SRC = 'assets/zoneHelpers.js';

/** Box mesh. If addPhys=true, adds static CANNON.Body. ly = bottom Y (not center). */
export function placeBox(scene, sx, sy, sz, lx, ly, lz, mat, addPhys = false, ry = 0, sourceFile = DEFAULT_SRC) {
  const m = new THREE.Mesh(GEO.BOX_1, mat);
  m.scale.set(sx, sy, sz);
  m.position.set(lx, ly + sy / 2, lz);
  if (ry !== 0) m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  m.userData.sourceFile = sourceFile;
  scene.add(m);

  if (addPhys) {
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2)));
    body.position.copy(m.position);
    if (ry !== 0) body.quaternion.setFromEuler(0, ry, 0);
    getPhysicsWorld().addBody(body);
  }
  return m;
}

/** Cylinder mesh. ly = bottom Y. */
export function placeCyl(scene, rt, rb, h, segs, mat, lx, ly, lz, sourceFile = DEFAULT_SRC) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(lx, ly + h / 2, lz);
  m.castShadow = m.receiveShadow = true;
  m.userData.sourceFile = sourceFile;
  scene.add(m);
  return m;
}

/** Flat slab (thin box at ground level). */
export function placeSlab(scene, sx, sz, lx, ly, lz, mat, sourceFile = DEFAULT_SRC) {
  const m = new THREE.Mesh(GEO.BOX_1, mat);
  m.scale.set(sx, 0.08, sz);
  m.position.set(lx, ly, lz);
  m.receiveShadow = true;
  m.userData.sourceFile = sourceFile;
  scene.add(m);
  return m;
}

/** Clone and place a prefab Group. */
export function placePrefab(scene, prefabGroup, lx, ly, lz, ry = 0) {
  const instance = prefabGroup.clone();
  instance.position.set(lx, ly, lz);
  if (ry !== 0) instance.rotation.y = ry;
  scene.add(instance);
  return instance;
}

/** Wall along X axis with optional door gaps. */
export function placeWallX(scene, lx1, lx2, lz, gaps, ly, h, mat, addPhys = false, src = DEFAULT_SRC) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lx1;
  for (const [gc, gw] of sorted) {
    const w = gc - gw / 2 - cur;
    if (w > 0.02) placeBox(scene, w, h, 0.2, cur + w / 2, ly, lz, mat, addPhys, 0, src);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lx2 - cur;
  if (rem > 0.02) placeBox(scene, rem, h, 0.2, cur + rem / 2, ly, lz, mat, addPhys, 0, src);
}

/** Wall along Z axis with optional door gaps. */
export function placeWallZ(scene, lz1, lz2, lx, gaps, ly, h, mat, addPhys = false, src = DEFAULT_SRC) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lz1;
  for (const [gc, gw] of sorted) {
    const w = gc - gw / 2 - cur;
    if (w > 0.02) placeBox(scene, 0.2, h, w, lx, ly, cur + w / 2, mat, addPhys, 0, src);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lz2 - cur;
  if (rem > 0.02) placeBox(scene, 0.2, h, rem, lx, ly, cur + rem / 2, mat, addPhys, 0, src);
}
