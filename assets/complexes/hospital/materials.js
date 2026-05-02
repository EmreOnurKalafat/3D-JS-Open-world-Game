// assets/prefabs/complexes/hospital/materials.js
// Hospital-specific materials. One-off building shell colours.
import * as THREE from 'three';

const lm = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const bm = c             => new THREE.MeshBasicMaterial ({ color: c });

export const M = {
  wall    : lm(0xe8e4dc),
  wallHi  : lm(0xdad6ce),
  conc    : lm(0xa09888),
  roof    : lm(0x3c3c3c),
  asphalt : lm(0x272727),
  road    : lm(0x303030),
  curb    : lm(0x909090),
  grass   : lm(0x3d6620),
  path    : lm(0xc8aa78),
  white   : lm(0xffffff),
  offWhite: lm(0xf0ede8),
  metal   : lm(0xb4b4b4),
  trim    : lm(0x686868),
  darkTrim: lm(0x383838),
  glass   : lm(0x99bbdd, { transparent: true, opacity: 0.32 }),
  glassDk : lm(0x334455, { transparent: true, opacity: 0.55 }),
  red     : lm(0xcc1111),
  redEm   : lm(0xff2222, { emissive: 0xdd0000, emissiveIntensity: 1.0 }),
  blueEm  : lm(0x3366ff, { emissive: 0x0033cc, emissiveIntensity: 0.7 }),
  yellowEm: lm(0xffdd00, { emissive: 0xddbb00, emissiveIntensity: 0.5 }),
  yellow  : lm(0xeecc00),
  signBg  : lm(0x003399),
  green   : lm(0x3a6620),
  cabinet : lm(0x9ab0c8),
  stripeW : bm(0xffffff),
  stripeY : bm(0xffcc00),
  heliW   : bm(0xffffff),
};
