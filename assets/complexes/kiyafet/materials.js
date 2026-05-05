// assets/complexes/kiyafet/materials.js — Magazaya ozel materyaller
import * as THREE from 'three';

const lm = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });

export const M = {
  // Zeminler
  floorWood:    lm(0xc4a87c),
  floorTile:    lm(0xe8e0d5, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  floorConc:    lm(0x888888),

  // Duvarlar
  wallExt:      lm(0xe0d8cc, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  wallInt:      lm(0xf5f0e8, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  accent:       lm(0x2c3e50),

  // Vitrin & Cam
  glass:        lm(0xccddff, { transparent: true, opacity: 0.25 }),
  glassFrost:   lm(0xaaccee, { transparent: true, opacity: 0.40 }),

  // Metal & Cerceve
  metal:        lm(0xb4b4b4),
  metalDark:    lm(0x555555),
  rack:         lm(0xcccccc),
  hanger:       lm(0xd4d4d4),

  // Kumas / Tekstil renkleri
  fabricRed:    lm(0xcc3333),
  fabricBlue:   lm(0x3366aa),
  fabricGreen:  lm(0x339955),
  fabricBeige:  lm(0xd4c8a8),

  // Tabela & Marka
  signBg:       lm(0x1a1a2e),
  signGold:     lm(0xd4a843),
  white:        lm(0xffffff),

  // Kabin (soyunma odasi)
  cabinWood:    lm(0x9b7653),
  cabinCurtain: lm(0x885566, { transparent: true, opacity: 0.7 }),

  // Otopark
  asphalt:      lm(0x333333),
  curb:         lm(0x909090),

  // Emissive (isik yayan)
  warmLight:    lm(0xfff5e8, { emissive: 0xffcc88, emissiveIntensity: 0.4 }),
  spotLight:    lm(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }),
};
