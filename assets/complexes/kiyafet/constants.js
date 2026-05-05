// assets/complexes/kiyafet/constants.js — Kiyafet Magazasi grid & boyut sabitleri

// Grid konumu — kuzey bolge, diger ozel zonlarla cakismaz
export const GM_GRID_COL = 8;
export const GM_GRID_ROW = 7;

// Dunya koordinati hesaplama
const GRID = 10, BLOCK = 60, ROAD = 12;
const CELL = BLOCK + ROAD;
const WH = (GRID / 2) * CELL;
export const GM_ORIGIN_X = GM_GRID_COL * CELL - WH + CELL / 2;
export const GM_ORIGIN_Z = GM_GRID_ROW * CELL - WH + CELL / 2;

// Bina boyutlari
export const GM_W  = 14;   // Yari genislik → bina X: -14 … +14 (28m genislik)
export const GM_D  = 10;   // Yari derinlik → bina Z: -10 … +10 (20m derinlik)
export const GM_BH = 6;    // Bina yuksekligi (tek katli, 6m tavan)
export const WT    = 0.3;  // Duvar kalinligi

// Kapi ve girisler
export const MAIN_CX = 0, MAIN_W = 4;      // Ana kapi: merkez X=0, 4m genislik
export const STAFF_CX = 10, STAFF_W = 1.5;  // Personel kapisi: dogu tarafi

// Source referanslari
export const ZONE_SRC = 'assets/complexes/kiyafet/index.js';
export const MODULE_SRC_PREFIX = 'assets/complexes/kiyafet/modules';

// Koordinat donusturuculer
export function gmx(lx) { return GM_ORIGIN_X + lx; }
export function gmz(lz) { return GM_ORIGIN_Z + lz; }
