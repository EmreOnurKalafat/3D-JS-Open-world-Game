// assets/prefabs/complexes/hospital/modules/helpers.js
// Primitive placement helpers. ALL hospital modules use these.
import * as THREE from 'three';
import { hx, hz, MODULE_SRC_PREFIX } from '../constants.js';

const SRC = MODULE_SRC_PREFIX + '/helpers.js';

/** Generic box. Pushes to physicsBodies if provided. */
export function b(g, sx, sy, sz, lx, ly, lz, mat, ry = 0, physicsBodies = null) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (ry !== 0) m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  m.userData.sourceFile = SRC;
  g.add(m);
  if (physicsBodies) physicsBodies.push({ mesh: m, sx, sy, sz });
  return m;
}

/** Physics-enabled box — pushes to physicsBodies. */
export function wb(g, sx, sy, sz, lx, ly, lz, mat, ry = 0, physicsBodies) {
  return b(g, sx, sy, sz, lx, ly, lz, mat, ry, physicsBodies);
}

/** Thin flat slab (height = 0.08). */
export function slab(g, sx, sz, lx, ly, lz, mat) {
  return b(g, sx, 0.08, sz, lx, ly, lz, mat, 0, null);
}

/** Cylinder helper. */
export function cyl(g, rT, rB, h, seg, mat, lx, ly, lz, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (rz !== 0) m.rotation.z = rz;
  m.castShadow = true;
  m.userData.sourceFile = SRC;
  g.add(m);
  return m;
}

/** Point light helper. */
export function ptl(g, color, intens, dist, lx, ly, lz) {
  const l = new THREE.PointLight(color, intens, dist);
  l.position.set(hx(lx), ly, hz(lz));
  l.userData.sourceFile = SRC;
  g.add(l);
  return l;
}

/** Place a prefab Group at local coordinates, optionally rotating it. */
export function placePrefab(parent, prefabGroup, lx, ly, lz, ry = 0) {
  prefabGroup.position.set(hx(lx), ly, hz(lz));
  if (ry !== 0) prefabGroup.rotation.y = ry;
  parent.add(prefabGroup);
  return prefabGroup;
}
