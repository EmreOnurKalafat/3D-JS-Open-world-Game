// assets/complexes/parkinglot/constants.js — Kuzey otopark grid & boyut sabitleri

// Grid konumu — kuzey bolge, diger ozel zonlarla cakismaz
export const PL_GRID_COL = 5;
export const PL_GRID_ROW = 9;

// Dunya koordinati hesaplama
const GRID = 10, BLOCK = 60, ROAD = 12;
const CELL = BLOCK + ROAD;
const WH = (GRID / 2) * CELL;
export const PL_ORIGIN_X = PL_GRID_COL * CELL - WH + CELL / 2;
export const PL_ORIGIN_Z = PL_GRID_ROW * CELL - WH + CELL / 2;

// Otopark boyutlari
export const PL_W  = 25;   // Yari genislik → X: -25 … +25 (50m genislik)
export const PL_D  = 17.5; // Yari derinlik → Z: -17.5 … +17.5 (35m derinlik)

export function plx(lx) { return PL_ORIGIN_X + lx; }
export function plz(lz) { return PL_ORIGIN_Z + lz; }
