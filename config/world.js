// config/world.js — Procedural city data (zone configs, vehicle weights, colors)
// Extracted from data/config/world.js for clean architecture.

import * as THREE from 'three';
import { WORLD } from '../shared/constants.js';

/** Zone determination by grid position */
export function getZone(row, col) {
  const c = (WORLD.GRID_SIZE - 1) / 2;
  const d = Math.sqrt((row - c) ** 2 + (col - c) ** 2);
  if (row === 0) return 'beach';
  if (row >= WORLD.GRID_SIZE - 2 && col >= WORLD.GRID_SIZE - 2) return 'industrial';
  if (row >= WORLD.GRID_SIZE - 2) return 'industrial';
  if (d < 1.5) return 'downtown_core';
  if (d < 2.8) return 'downtown';
  if (d < 5.0) return 'commercial';
  if (d < 7.0) return 'residential';
  return 'suburban';
}

/** Car type weights for random selection */
export const CAR_WEIGHTS = [
  { type: 'sedan',  weight: 0.5 },
  { type: 'sports', weight: 0.2 },
  { type: 'suv',    weight: 0.3 },
];

/** Car body colors (InstancedMesh instanceColor compatible) */
export const CAR_COLORS = [
  new THREE.Color(0xFF3030), new THREE.Color(0xFF8800),
  new THREE.Color(0x3366FF), new THREE.Color(0xEEEEEE),
  new THREE.Color(0x222222), new THREE.Color(0x44AA44),
];

/**
 * Custom / one-off building placements.
 * These are placed BEFORE zone buildings, so OccupancyGrid reserves their space.
 * Add your own buildings here!
 *
 * @type {Array<{typeName:string, w:number, h:number, d:number, x:number, z:number, rotY?:number, label?:string, sourceFile?:string}>}
 */
export const CUSTOM_BUILDINGS = [
  // Örnek — kendi binalarını buraya ekle:
  // { typeName: 'mustakilEv', w: 14, h: 9, d: 16, x: 250, z: -120, rotY: 0.3, label: 'Benim Malikanem' },
  // { typeName: 'gokdelen',   w: 20, h: 75, d: 20, x: -300, z: 200, rotY: 0,   label: 'Yeni Plaza' },
];
