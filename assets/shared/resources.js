// assets/shared/resources.js — Shared geometry & material pool
// ALL prefabs MUST import from here. NO new THREE.BoxGeometry/material in prefabs.

import * as THREE from 'three';

// ═══════════════════════════════════════
//  SHARED GEOMETRIES (created once)
// ═══════════════════════════════════════

export const GEO = {
  BOX_1:       new THREE.BoxGeometry(1, 1, 1),
  CYL_8:       new THREE.CylinderGeometry(1, 1, 1, 8),
  CYL_12:      new THREE.CylinderGeometry(1, 1, 1, 12),
  PLANE_1:     new THREE.PlaneGeometry(1, 1),
  TORUS_SMALL: new THREE.TorusGeometry(0.4, 0.08, 8, 16),
};

// ═══════════════════════════════════════
//  SHARED MATERIALS (created once)
// ═══════════════════════════════════════

export const MAT = {
  WALL:             new THREE.MeshLambertMaterial({ color: 0xd9d9d9 }),
  FLOOR:            new THREE.MeshLambertMaterial({ color: 0x8a8a8a }),
  DARK_WALL:        new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  TRIM:             new THREE.MeshLambertMaterial({ color: 0x222222 }),
  ACCENT:           new THREE.MeshLambertMaterial({ color: 0x12355B }),
  ROOF:             new THREE.MeshLambertMaterial({ color: 0x1f1f1f }),
  METAL:            new THREE.MeshLambertMaterial({ color: 0xaaaaaa }),
  WOOD:             new THREE.MeshLambertMaterial({ color: 0x3d2817 }),
  WHITE:            new THREE.MeshLambertMaterial({ color: 0xffffff }),
  RED_LIGHT:        new THREE.MeshLambertMaterial({ color: 0xff0000, emissive: 0xaa0000 }),
  BLUE_LIGHT:       new THREE.MeshLambertMaterial({ color: 0x0000ff, emissive: 0x0000aa }),
  CHALK:            new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
  PAD:              new THREE.MeshLambertMaterial({ color: 0x444444 }),
  GLASS:            new THREE.MeshLambertMaterial({ color: 0x88bbff, transparent: true, opacity: 0.35 }),
  MIRROR:           new THREE.MeshLambertMaterial({ color: 0x222222 }),
  MONITOR_EMISSIVE: new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x051020 }),
  YELLOW_EMISSIVE:  new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0x555500 }),
  FLAG:             new THREE.MeshLambertMaterial({ color: 0x1A3A6B, side: THREE.DoubleSide }),
  WHEEL:            new THREE.MeshLambertMaterial({ color: 0x111111 }),
  SEAT:             new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  HELI_BODY:        new THREE.MeshLambertMaterial({ color: 0x1a3a5c }),
  BAR_METAL:        new THREE.MeshLambertMaterial({ color: 0x555555 }),
};

// ═══════════════════════════════════════
//  MESH FACTORY HELPERS
// ═══════════════════════════════════════

/** Box mesh from shared unit-cube geometry */
export function boxMesh(sx, sy, sz, material) {
  const m = new THREE.Mesh(GEO.BOX_1, material);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Cylinder mesh from shared geometry (auto-picks 8 or 12 segments) */
export function cylMesh(rt, rb, h, segs, material) {
  const g = segs <= 8 ? GEO.CYL_8 : GEO.CYL_12;
  const m = new THREE.Mesh(g, material);
  m.scale.set(rt * 2, h, rb * 2);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Plane mesh from shared unit-plane geometry */
export function planeMesh(sx, sy, material) {
  const m = new THREE.Mesh(GEO.PLANE_1, material);
  m.scale.set(sx, sy, 1);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
