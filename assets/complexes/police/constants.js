// assets/prefabs/complexes/police/constants.js
// Grid constants + coordinate helpers for the police station complex.

export const POLICE_GRID_COL = 1;
export const POLICE_GRID_ROW = 5;

const GRID = 10, BLOCK = 60, ROAD = 12;
const CELL = BLOCK + ROAD;
const WH = (GRID / 2) * CELL;
export const COMPLEX_X = POLICE_GRID_COL * CELL - WH + CELL / 2;
export const COMPLEX_Z = POLICE_GRID_ROW * CELL - WH + CELL / 2;

export function wx(lx) { return COMPLEX_X + lx; }
export function wz(lz) { return COMPLEX_Z + lz; }
