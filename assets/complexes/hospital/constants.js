// assets/prefabs/complexes/hospital/constants.js
// Layout constants + coordinate helpers for the hospital complex.

export const HOSPITAL_ORIGIN   = { x: 180, y: 0, z: -36 };
export const HOSPITAL_GRID_COL = 7;
export const HOSPITAL_GRID_ROW = 4;

export const HW = 14;        // half-width  →  x: -14 … +14  (28 m)
export const HD = 10;        // half-depth  →  z: -10 … +10  (20 m)
export const FH =  4;        // storey height
export const NS =  3;        // number of storeys
export const BH = FH * NS;   // total building height = 12 m
export const WT =  0.3;      // wall thickness

// South facade entrances (local x)
export const ER_CX = -7, ER_W = 4;   // Emergency centre=-7, gap=4 m  → x: -9…-5
export const MN_CX = +6, MN_W = 5;   // Main entry centre=+6, gap=5 m → x: +3.5…+8.5

export const ZONE_SRC = 'assets/prefabs/complexes/hospital/index.js';
export const MODULE_SRC_PREFIX = 'assets/prefabs/complexes/hospital/modules';

export function hx(lx) { return HOSPITAL_ORIGIN.x + lx; }
export function hz(lz) { return HOSPITAL_ORIGIN.z + lz; }
