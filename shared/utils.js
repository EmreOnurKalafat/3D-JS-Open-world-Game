// client/utils.js — Math helpers and geometry utilities

import * as THREE from 'three';

const scratchVec3s = [];

/**
 * Gets a reusable Vector3, creating a new one if the pool is empty
 * @returns {THREE.Vector3}
 */
export function getScratchVec3() {
  if (scratchVec3s.length > 0) {
    return scratchVec3s.pop();
  }
  return new THREE.Vector3();
}

/**
 * Returns a Vector3 to the pool for reuse
 * @param {THREE.Vector3} v
 */
export function releaseScratchVec3(v) {
  scratchVec3s.push(v);
}

/** Linear interpolation between a and b by factor t */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Clamps value between min and max */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Converts degrees to radians */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/** Converts radians to degrees */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/** Returns a random integer between min (inclusive) and max (inclusive) */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Returns a random float between min (inclusive) and max (exclusive) */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Grid-based occupancy tracker — prevents object overlap during procedural placement.
 * Cells are stored at 2× resolution for finer-grained queries.
 */
export class OccupancyGrid {
  constructor() { this.cells = new Map(); }
  fill(cx, cz, w, d, extra = 0) {
    const hw = w / 2 + extra, hd = d / 2 + extra;
    const sx = Math.round((cx - hw) * 2), ex = Math.round((cx + hw) * 2);
    const sz = Math.round((cz - hd) * 2), ez = Math.round((cz + hd) * 2);
    for (let x = sx; x <= ex; x++)
      for (let z = sz; z <= ez; z++)
        this.cells.set(`${x},${z}`, true);
  }
  isFree(x, z, gap = 1.0) {
    const g = Math.round(gap * 2);
    const sx = Math.round(x * 2), sz = Math.round(z * 2);
    for (let dx = -g; dx <= g; dx++)
      for (let dz = -g; dz <= g; dz++)
        if (this.cells.has(`${sx + dx},${sz + dz}`)) return false;
    return true;
  }
}
