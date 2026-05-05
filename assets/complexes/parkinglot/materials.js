// assets/complexes/parkinglot/materials.js — Otopark materyalleri
import * as THREE from 'three';

const sm = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1, ...o });
const bm = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });

export const M = {
  asphalt:    sm(0x3a3a3a, { roughness: 0.85, metalness: 0.05 }),
  line:       sm(0xeeeeee, { roughness: 0.4 }),
  curb:       sm(0x999999, { roughness: 0.5, metalness: 0.2 }),
  booth:      sm(0xd8d0c0, { roughness: 0.45 }),
  boothRoof:  sm(0x4a4a4a, { roughness: 0.4, metalness: 0.3 }),
  metal:      sm(0x707070, { roughness: 0.35, metalness: 0.7 }),
  signBlue:   sm(0x2244aa, { roughness: 0.3 }),
  signWhite:  sm(0xffffff, { roughness: 0.3 }),
  red:        sm(0xcc3333, { roughness: 0.35 }),
  glass:      sm(0x8899aa, { roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 }),
  warmLight:  sm(0xfff5e8, { emissive: 0xffcc88, emissiveIntensity: 0.35 }),
  stripeW:    bm(0xffffff),
  stripeY:    bm(0xffcc00),
};
