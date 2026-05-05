// assets/complexes/supermarket/modules/helpers.js
// Primitive placement helpers. ALL supermarket modules use these.
// Mirrors hospital helpers pattern — smx/smz for world-coordinate translation.
import * as THREE from 'three';
import { GEO } from '../../../resources.js';
import { smx, smz, MODULE_SRC_PREFIX } from '../constants.js';

const SRC = MODULE_SRC_PREFIX + '/helpers.js';

/** Generic box. Pushes to physicsBodies if provided. */
export function b(g, sx, sy, sz, lx, ly, lz, mat, ry = 0, physicsBodies = null) {
  const m = new THREE.Mesh(GEO.BOX_1.clone(), mat);
  m.scale.set(sx, sy, sz);
  m.position.set(smx(lx), ly, smz(lz));
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

/** Cylinder helper. Uses shared geometry for equal radii, unique for cones. */
export function cyl(g, rT, rB, h, seg, mat, lx, ly, lz, rz = 0) {
  const geo = rT === rB ? GEO.CYL_8.clone() : new THREE.CylinderGeometry(rT, rB, h, seg);
  const m = new THREE.Mesh(geo, mat);
  if (rT === rB) m.scale.set(rT * 2, h, rT * 2);
  m.position.set(smx(lx), ly, smz(lz));
  if (rz !== 0) m.rotation.z = rz;
  m.castShadow = true;
  m.userData.sourceFile = SRC;
  g.add(m);
  return m;
}

/** Point light helper. */
export function ptl(g, color, intens, dist, lx, ly, lz) {
  const l = new THREE.PointLight(color, intens, dist);
  l.position.set(smx(lx), ly, smz(lz));
  l.userData.sourceFile = SRC;
  g.add(l);
  return l;
}

/** Place a prefab Group at local coordinates, optionally rotating it. */
export function placePrefab(parent, prefabGroup, lx, ly, lz, ry = 0) {
  prefabGroup.position.set(smx(lx), ly, smz(lz));
  if (ry !== 0) prefabGroup.rotation.y = ry;
  parent.add(prefabGroup);
  return prefabGroup;
}
