// assets/complexes/supermarket/constants.js
// Grid constants + coordinate helpers for the supermarket complex.
// Grid cell: col=3, row=2 (south of centre, near beach but inland)

export const SM_GRID_COL = 3;
export const SM_GRID_ROW = 2;

const GRID = 10, BLOCK = 60, ROAD = 12;
const CELL = BLOCK + ROAD;
const WH = (GRID / 2) * CELL;
export const SM_ORIGIN_X = SM_GRID_COL * CELL - WH + CELL / 2;
export const SM_ORIGIN_Z = SM_GRID_ROW * CELL - WH + CELL / 2;

// Building dimensions (single-storey big-box retail)
export const SM_W = 20;   // half-width  → x: -20 … +20  (40 m)
export const SM_D = 22;   // half-depth  → z: -22 … +22  (44 m, clears sidewalks)
export const SM_FH = 4.5; // storey height
export const SM_BH = 8;   // total building height (tall single storey)
export const WT = 0.3;    // wall thickness

// South facade entrances (local x, relative to origin)
export const MAIN_CX = 0, MAIN_W = 6;      // Main sliding doors centre=0, gap=6m
export const STAFF_CX = 12, STAFF_W = 2;   // Staff side door east side
export const DOCK_CX = 0, DOCK_W = 5;      // Loading dock on east wall (local z)

export const ZONE_SRC = 'assets/complexes/supermarket/index.js';
export const MODULE_SRC_PREFIX = 'assets/complexes/supermarket/modules';

/** Convert local x (relative to SM origin) to world x */
export function smx(lx) { return SM_ORIGIN_X + lx; }

/** Convert local z (relative to SM origin) to world z */
export function smz(lz) { return SM_ORIGIN_Z + lz; }
