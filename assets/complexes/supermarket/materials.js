// assets/complexes/supermarket/materials.js
// Supermarket-specific materials. Imported by all modules.
import * as THREE from 'three';

const lm = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const bm = (c)             => new THREE.MeshBasicMaterial({ color: c });

export const M = {
  // Floors — polygonOffset prevents Z-fighting with ground/overlapping slabs
  floorTile   : lm(0xf5f0e8, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  floorTileGrey: lm(0xe0dcd5, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  floorConc   : lm(0xa09888, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),

  // Walls — polygonOffset prevents Z-fighting with window strips
  wall        : lm(0xfaf5ed, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  wallExt     : lm(0xe8e2da, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  conc        : lm(0xb0a898),    // structural concrete

  // Roof & Trim
  roof        : lm(0x3c3c3c),
  trim        : lm(0x787878),
  darkTrim    : lm(0x383838),

  // Metal
  shelfMetal  : lm(0xcccccc),    // aisle shelving
  metal       : lm(0xb4b4b4),

  // Glass
  glass       : lm(0x88bbff, { transparent: true, opacity: 0.30 }),
  glassFrost  : lm(0xaaccee, { transparent: true, opacity: 0.45 }),

  // Signage & accent
  signRed     : lm(0xcc2222),
  signGreen   : lm(0x22aa44),
  signBlue    : lm(0x003399),
  white       : lm(0xffffff),

  // Parking & exterior
  asphalt     : lm(0x333333),
  curb        : lm(0x909090),
  stripeW     : bm(0xffffff),
  stripeY     : bm(0xffcc00),
  stripeBlue  : bm(0x3366cc),

  // Emissive
  redEm       : lm(0xff2222, { emissive: 0xdd0000, emissiveIntensity: 1.0 }),
  greenEm     : lm(0x44ff44, { emissive: 0x00aa00, emissiveIntensity: 0.6 }),
  coolWhiteEm : lm(0xf0f8ff, { emissive: 0xaaccff, emissiveIntensity: 0.3 }),

  // Wood
  wood        : lm(0x8b6914),

  // Cabinet / appliance
  cabinetW    : lm(0xfafafa),
  cabinetGrey : lm(0xd8d8d8),
};
