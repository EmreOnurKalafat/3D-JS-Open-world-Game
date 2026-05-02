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
  // ── Structure ──────────────────────────
  WALL:             new THREE.MeshLambertMaterial({ color: 0xd9d9d9 }),
  FLOOR:            new THREE.MeshLambertMaterial({ color: 0x8a8a8a }),
  DARK_WALL:        new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  TRIM:             new THREE.MeshLambertMaterial({ color: 0x222222 }),
  ACCENT:           new THREE.MeshLambertMaterial({ color: 0x12355B }),
  ROOF:             new THREE.MeshLambertMaterial({ color: 0x1f1f1f }),
  CONCRETE:         new THREE.MeshLambertMaterial({ color: 0xa09888 }),

  // ── Metal / Trim ───────────────────────
  METAL:            new THREE.MeshLambertMaterial({ color: 0xaaaaaa }),
  DARK_METAL:       new THREE.MeshLambertMaterial({ color: 0x383838 }),
  FURNITURE_TRIM:   new THREE.MeshLambertMaterial({ color: 0x686868 }),
  BAR_METAL:        new THREE.MeshLambertMaterial({ color: 0x555555 }),
  PIPE_METAL:       new THREE.MeshLambertMaterial({ color: 0xb4b4b4 }),

  // ── Wood ───────────────────────────────
  WOOD:             new THREE.MeshLambertMaterial({ color: 0x3d2817 }),
  FURNITURE_WOOD:   new THREE.MeshLambertMaterial({ color: 0x8b6810 }),

  // ── White / Light ──────────────────────
  WHITE:            new THREE.MeshLambertMaterial({ color: 0xffffff }),
  CHALK:            new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
  OFF_WHITE:        new THREE.MeshLambertMaterial({ color: 0xf0ede8 }),

  // ── Glass ──────────────────────────────
  GLASS:            new THREE.MeshLambertMaterial({ color: 0x88bbff, transparent: true, opacity: 0.35 }),
  DARK_GLASS:       new THREE.MeshLambertMaterial({ color: 0x334455, transparent: true, opacity: 0.55 }),
  AMBER_GLASS:      new THREE.MeshLambertMaterial({ color: 0x99bbcc, transparent: true, opacity: 0.5 }),

  // ── Emissive lights ────────────────────
  RED_LIGHT:        new THREE.MeshLambertMaterial({ color: 0xff0000, emissive: 0xaa0000 }),
  RED_EMISSIVE:     new THREE.MeshLambertMaterial({ color: 0xff2222, emissive: 0xdd0000, emissiveIntensity: 1.0 }),
  BLUE_LIGHT:       new THREE.MeshLambertMaterial({ color: 0x0000ff, emissive: 0x0000aa }),
  BLUE_EMISSIVE:    new THREE.MeshLambertMaterial({ color: 0x3366ff, emissive: 0x0033cc, emissiveIntensity: 0.7 }),
  YELLOW_EMISSIVE:  new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0x555500 }),

  // ── Surfaces / Pads ────────────────────
  PAD:              new THREE.MeshLambertMaterial({ color: 0x444444 }),
  MIRROR:           new THREE.MeshLambertMaterial({ color: 0x222222 }),
  SIGN_BLUE:        new THREE.MeshLambertMaterial({ color: 0x003399 }),

  // ── Seating ────────────────────────────
  SEAT:             new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  MATTRESS:         new THREE.MeshLambertMaterial({ color: 0xd0cec6 }),
  PILLOW_WHITE:     new THREE.MeshLambertMaterial({ color: 0xffffff }),

  // ── Electronics ────────────────────────
  MONITOR_EMISSIVE: new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x051020 }),
  SCREEN_DARK:      new THREE.MeshLambertMaterial({ color: 0x001800 }),

  // ── Nature ─────────────────────────────
  BARK:             new THREE.MeshLambertMaterial({ color: 0x5c3d1e }),
  LEAF:             new THREE.MeshLambertMaterial({ color: 0x2e5a18 }),
  GRASS:            new THREE.MeshLambertMaterial({ color: 0x3d6620 }),

  // ── Vehicles ───────────────────────────
  WHEEL:            new THREE.MeshLambertMaterial({ color: 0x111111 }),
  HELI_BODY:        new THREE.MeshLambertMaterial({ color: 0x1a3a5c }),
  AMBULANCE_WHITE:  new THREE.MeshLambertMaterial({ color: 0xffffff }),
  AMBULANCE_BODY:   new THREE.MeshLambertMaterial({ color: 0xdddddd }),
  POLICE_BODY:      new THREE.MeshLambertMaterial({ color: 0x111111 }),

  // ── Flag ───────────────────────────────
  FLAG:             new THREE.MeshLambertMaterial({ color: 0x1A3A6B, side: THREE.DoubleSide }),
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
