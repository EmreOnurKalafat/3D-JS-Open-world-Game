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
