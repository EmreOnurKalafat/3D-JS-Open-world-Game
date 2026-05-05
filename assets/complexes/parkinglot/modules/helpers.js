// assets/complexes/parkinglot/modules/helpers.js — Standart helpers
import * as THREE from 'three';
import { GEO } from '../../../resources.js';
import { plx, plz } from '../constants.js';

/** Box mesh at world coords (local lx, ly, lz → world x, z) */
export function b(g, w, h, d, lx, ly, lz, mat) {
  const mesh = new THREE.Mesh(GEO.BOX_1.clone(), mat);
  mesh.scale.set(w, h, d);
  mesh.position.set(plx(lx), ly, plz(lz));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

/** Box with physics registration */
export function wb(g, w, h, d, lx, ly, lz, mat, mass, physicsBodies) {
  const mesh = b(g, w, h, d, lx, ly, lz, mat);
  if (mass !== 0) physicsBodies.push({ mesh, sx: w, sy: h, sz: d });
  return mesh;
}

/** Flat plane slab */
export function slab(g, w, d, lx, ly, lz, mat) {
  const mesh = new THREE.Mesh(GEO.PLANE_1.clone(), mat);
  mesh.scale.set(w, d, 1);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(plx(lx), ly, plz(lz));
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

/** Cylinder - uses shared geometry for equal radii */
export function cyl(g, rTop, rBot, h, seg, mat, lx, ly, lz) {
  const geo = rTop === rBot ? GEO.CYL_8.clone() : new THREE.CylinderGeometry(rTop, rBot, h, seg);
  const mesh = new THREE.Mesh(geo, mat);
  if (rTop === rBot) mesh.scale.set(rTop * 2, h, rTop * 2);
  mesh.position.set(plx(lx), ly, plz(lz));
  mesh.castShadow = true;
  g.add(mesh);
  return mesh;
}

/** PointLight at world coords */
export function ptl(g, color, intensity, dist, lx, ly, lz) {
  const light = new THREE.PointLight(color, intensity, dist);
  light.position.set(plx(lx), ly, plz(lz));
  g.add(light);
  return light;
}

/** Place a prefab (THREE.Group) at world coords */
export function placePrefab(g, prefab, lx, ly, lz, rotY) {
  prefab.position.set(plx(lx), ly, plz(lz));
  prefab.rotation.y = rotY;
  g.add(prefab);
}
