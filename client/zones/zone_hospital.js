// client/zones/zone_hospital.js — GTA-style Hospital Complex v4.0 (Full Modular Prefab Architecture)
// ✓ All reusable props extracted to assets/prefabs/
// ✓ All structures using prefabs (cit.js for fence)
// ✓ Building shell kept zone-local (one-off architecture)
// ✓ Freecam-compatible: every mesh has sourceFile

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// ── Prefab imports ──────────────────────────────────────────
import { createSokakLambasi }       from '../../assets/prefabs/structures/sokakLambasi.js';
import { createCitFenceRun }        from '../../assets/prefabs/structures/cit.js';
import { createBank }               from '../../assets/prefabs/props/bank.js';
import { createAgac }               from '../../assets/prefabs/props/agac.js';
import { createHastaneYatagi }      from '../../assets/prefabs/props/hastaneYatagi.js';
import { createBeklemeSandalyasi }  from '../../assets/prefabs/props/beklemeSandalyasi.js';
import { createSehpa }              from '../../assets/prefabs/props/sehpa.js';
import { createBanko }              from '../../assets/prefabs/props/banko.js';
import { createGuvenlikKamerasi }   from '../../assets/prefabs/props/guvenlikKamerasi.js';
import { createCopKonteyneri }      from '../../assets/prefabs/props/copKonteyneri.js';
import { createJenerator }          from '../../assets/prefabs/props/jenerator.js';
import { createAmbulans }           from '../../assets/prefabs/vehicles/ambulans.js';

/* ══════════════════════════════════════════════════════════════
   EXPORTED CONSTANTS
══════════════════════════════════════════════════════════════ */
export const HOSPITAL_ORIGIN   = { x: 180, y: 0, z: -36 };
export const HOSPITAL_GRID_COL = 7;
export const HOSPITAL_GRID_ROW = 4;

/* ══════════════════════════════════════════════════════════════
   BUILDING LAYOUT CONSTANTS  (all in local/metres)
══════════════════════════════════════════════════════════════ */
const HW = 14;        // half-width  →  x: -14 … +14  (28 m)
const HD = 10;        // half-depth  →  z: -10 … +10  (20 m)
const FH =  4;        // storey height
const NS =  3;        // number of storeys
const BH = FH * NS;   // total building height = 12 m
const WT =  0.3;      // wall thickness

// South facade entrances (local x)
const ER_CX = -7,  ER_W = 4;   // Emergency centre=-7, gap=4 m  → x: -9…-5
const MN_CX = +6,  MN_W = 5;   // Main entry centre=+6, gap=5 m → x: +3.5…+8.5

/* ══════════════════════════════════════════════════════════════
   COORDINATE HELPERS
══════════════════════════════════════════════════════════════ */
const hx = lx => HOSPITAL_ORIGIN.x + lx;
const hz = lz => HOSPITAL_ORIGIN.z + lz;

/* ══════════════════════════════════════════════════════════════
   SOURCE FILE CONSTANT (freecam compatibility)
══════════════════════════════════════════════════════════════ */
const ZONE_SRC = 'client/zones/zone_hospital.js';

/* ══════════════════════════════════════════════════════════════
   ZONE-LOCAL MATERIALS (building shell — not reusable props)
══════════════════════════════════════════════════════════════ */
const lm = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const bm = c             => new THREE.MeshBasicMaterial ({ color: c });

const M = {
  // Structure
  wall    : lm(0xe8e4dc),
  wallHi  : lm(0xdad6ce),
  conc    : lm(0xa09888),
  roof    : lm(0x3c3c3c),
  // Ground / roads
  asphalt : lm(0x272727),
  road    : lm(0x303030),
  curb    : lm(0x909090),
  grass   : lm(0x3d6620),
  path    : lm(0xc8aa78),
  // Trim / metal
  white   : lm(0xffffff),
  offWhite: lm(0xf0ede8),
  metal   : lm(0xb4b4b4),
  trim    : lm(0x686868),
  darkTrim: lm(0x383838),
  // Glass
  glass   : lm(0x99bbdd, { transparent: true, opacity: 0.32 }),
  glassDk : lm(0x334455, { transparent: true, opacity: 0.55 }),
  // Colour accents
  red     : lm(0xcc1111),
  redEm   : lm(0xff2222, { emissive: 0xdd0000, emissiveIntensity: 1.0 }),
  blueEm  : lm(0x3366ff, { emissive: 0x0033cc, emissiveIntensity: 0.7 }),
  yellowEm: lm(0xffdd00, { emissive: 0xddbb00, emissiveIntensity: 0.5 }),
  yellow  : lm(0xeecc00),
  signBg  : lm(0x003399),
  green   : lm(0x3a6620),
  cabinet : lm(0x9ab0c8),
  // Road markings (MeshBasic → always fully lit)
  stripeW : bm(0xffffff),
  stripeY : bm(0xffcc00),
  heliW   : bm(0xffffff),
};

/* ══════════════════════════════════════════════════════════════
   PRIMITIVE HELPERS
══════════════════════════════════════════════════════════════ */

let _pb; // physics-body accumulator — assigned fresh in createHospital()

/** Generic box. mat can be any THREE.Material. Sets sourceFile for freecam. */
function b(g, sx, sy, sz, lx, ly, lz, mat, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (ry !== 0) m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  m.userData.sourceFile = ZONE_SRC;
  g.add(m);
  return m;
}

/** Physics-enabled box — pushed to _pb. */
function wb(g, sx, sy, sz, lx, ly, lz, mat, ry = 0) {
  const m = b(g, sx, sy, sz, lx, ly, lz, mat, ry);
  _pb.push({ mesh: m, sx, sy, sz });
  return m;
}

/** Thin flat slab. */
const slab = (g, sx, sz, lx, ly, lz, mat) => b(g, sx, 0.08, sz, lx, ly, lz, mat);

/** Cylinder helper. */
function cyl(g, rT, rB, h, seg, mat, lx, ly, lz, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (rz !== 0) m.rotation.z = rz;
  m.castShadow = true;
  m.userData.sourceFile = ZONE_SRC;
  g.add(m);
  return m;
}

/** Point light. */
function ptl(g, color, intens, dist, lx, ly, lz) {
  const l = new THREE.PointLight(color, intens, dist);
  l.position.set(hx(lx), ly, hz(lz));
  l.userData.sourceFile = ZONE_SRC;
  g.add(l);
  return l;
}

/** Places a prefab Group at local coordinates, optionally rotating it. */
function placePrefab(parent, prefabGroup, lx, ly, lz, ry = 0) {
  prefabGroup.position.set(hx(lx), ly, hz(lz));
  if (ry !== 0) prefabGroup.rotation.y = ry;
  parent.add(prefabGroup);
  return prefabGroup;
}

/* ══════════════════════════════════════════════════════════════
   S1 — MAIN BUILDING SHELL
══════════════════════════════════════════════════════════════ */
function buildShell(g) {
  /* ── Ground floor slab ──────────────────────────────────── */
  wb(g, HW * 2, WT, HD * 2, 0, WT / 2, 0, M.conc);

  /* ── Inter-floor & roof slabs ───────────────────────────── */
  for (let f = 1; f <= NS; f++) {
    wb(g, HW * 2 + WT * 2, WT, HD * 2 + WT * 2, 0, f * FH - WT / 2, 0, M.conc);
  }

  /* ── Interior floor surfaces (cream tile) ──────────────── */
  for (let f = 0; f < NS; f++) {
    slab(g, HW * 2 - 0.1, HD * 2 - 0.1, 0, f * FH + WT + 0.10, 0, M.offWhite);
  }

  /* ── NORTH wall — full, no openings ─────────────────────── */
  wb(g, HW * 2 - WT * 2, BH, WT, 0, BH / 2, -(HD + WT / 2), M.wall);

  /* ── EAST wall — full ───────────────────────────────────── */
  wb(g, WT, BH, HD * 2 - WT * 2, HW + WT / 2, BH / 2, 0, M.wall);

  /* ── WEST wall — full ───────────────────────────────────── */
  wb(g, WT, BH, HD * 2 - WT * 2, -(HW + WT / 2), BH / 2, 0, M.wall);

  /* ── SOUTH wall — ground floor with entrance gaps ───────── */
  wb(g,  4.7, FH, WT, -11.35, FH / 2, HD + WT / 2, M.wall);   // A
  wb(g,  8.5, FH, WT,  -0.75, FH / 2, HD + WT / 2, M.wall);   // B
  wb(g,  5.2, FH, WT,  11.10, FH / 2, HD + WT / 2, M.wall);   // C

  /* ── SOUTH wall — upper 2 floors (full, no gaps) ────────── */
  wb(g, HW * 2 - WT * 2, FH * 2 + 0.10, WT, 0, FH + FH - 0.05, HD + WT / 2, M.wallHi);

  /* ── Horizontal facade trim bands ───────────────────────── */
  for (let f = 0; f <= NS; f++) {
    const ty = f * FH + 0.12;
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, HD  + WT / 2 + 0.40,  M.trim);
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, -(HD + WT / 2 + 0.40), M.trim);
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1,  HW + WT / 2 + 0.40, ty, 0, M.trim);
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1, -(HW + WT / 2 + 0.40), ty, 0, M.trim);
  }

  /* ── Window bands (glass strips per floor) ──────────────── */
  for (let f = 0; f < NS; f++) {
    const wy = f * FH + 2.1;
    const wh = 1.7;
    if (f === 0) {
      b(g,  4.2, wh, 0.04, -11.35, wy, HD + WT + 0.08, M.glass);
      b(g,  8.0, wh, 0.04,  -0.75, wy, HD + WT + 0.08, M.glass);
      b(g,  4.7, wh, 0.04,  11.10, wy, HD + WT + 0.08, M.glass);
    } else {
      b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, HD + WT + 0.08, M.glass);
    }
    b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, -(HD + WT + 0.08), M.glass);
    for (const wz of [-6.5, 0, 6.5]) {
      b(g, 0.04, wh, 3.0,  HW + WT + 0.08, wy, wz, M.glass);
      b(g, 0.04, wh, 3.0, -(HW + WT + 0.08), wy, wz, M.glass);
    }
  }

  /* ── Corner pillar accents ──────────────────────────────── */
  for (const [px, pz] of [[-(HW + WT), HD + WT], [-(HW + WT), -(HD + WT)], [HW + WT, HD + WT], [HW + WT, -(HD + WT)]]) {
    b(g, 0.6, BH + 0.6, 0.6, px, BH / 2, pz, M.conc);
  }

  /* ── Red cross emblems on south upper facade ────────────── */
  for (const cx of [-4.5, 4.5]) {
    b(g, 1.4, 4.2, 0.08, cx, FH * 2, HD + WT + 0.10, M.red);
    b(g, 4.2, 1.4, 0.08, cx, FH * 2, HD + WT + 0.10, M.red);
  }

  /* ── Entrance sign board ────────────────────────────────── */
  b(g, 5.2, 0.9, 0.16, 0, 3.4, HD + WT + 0.14, M.signBg);
  b(g, 4.2, 0.28, 0.04, 0, 3.4, HD + WT + 0.23, M.white);

  /* ── Roof parapet — 4 sides ─────────────────────────────── */
  const px = HW + WT + 0.3,  pz = HD + WT + 0.3, ph = 0.9, pt = WT;
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2,  pz, M.conc);
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2, -pz, M.conc);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2,  px, BH + ph / 2, 0, M.conc);
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2, -px, BH + ph / 2, 0, M.conc);

  /* ── Interior divider walls ─────────────────────────────── */
  b(g, 8.5, FH - WT, WT, -0.75, (FH - WT) / 2 + WT, 2, M.offWhite);
  b(g, WT, FH - WT, HD * 2 - WT, -1.5, (FH - WT) / 2 + WT, 0, M.offWhite);
}

/* ══════════════════════════════════════════════════════════════
   S2 — ROOF DETAILS (helipad, HVAC, water tank, antenna)
   Helipad is zone-specific (circular, roof-mounted) — kept local.
══════════════════════════════════════════════════════════════ */
function buildRoof(g) {
  const ry = BH + WT;

  /* ── Roof surface ────────────────────────────────────────── */
  slab(g, HW * 2 - 0.2, HD * 2 - 0.2, 0, ry + 0.04, 0, M.roof);

  /* ── Helipad (circular, centre) ──────────────────────────── */
  const hpGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.06, 32);
  const hp = new THREE.Mesh(hpGeo, lm(0x222222));
  hp.position.set(hx(0), ry + 0.06, hz(0));
  hp.userData.sourceFile = ZONE_SRC;
  g.add(hp);

  const ringGeo = new THREE.TorusGeometry(4.2, 0.2, 8, 48);
  const ring = new THREE.Mesh(ringGeo, M.heliW);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(hx(0), ry + 0.1, hz(0));
  ring.userData.sourceFile = ZONE_SRC;
  g.add(ring);

  b(g, 0.5, 0.08, 3.0,  -1.0, ry + 0.1, 0, M.heliW);
  b(g, 0.5, 0.08, 3.0,   1.0, ry + 0.1, 0, M.heliW);
  b(g, 2.5, 0.08, 0.5,   0,   ry + 0.1, 0, M.heliW);

  for (const [lx2, lz2] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) {
    cyl(g, 0.08, 0.08, 0.3, 8, M.yellowEm, lx2, ry + 0.15, lz2);
  }

  /* ── HVAC units ─────────────────────────────────────────── */
  b(g, 3.5, 1.2, 2.0, -10, ry + 0.6, -7, M.metal);
  b(g, 2.8, 1.0, 1.6,  10, ry + 0.5, -7, M.metal);
  b(g, 2.0, 0.8, 1.4,  10, ry + 0.4,  7, M.metal);
  for (let i = 0; i < 4; i++) {
    b(g, 3.6, 0.04, 0.04, -10, ry + 0.6 + i * 0.18, -6.0, M.darkTrim);
  }

  /* ── Water tank ─────────────────────────────────────────── */
  cyl(g, 1.2, 1.2, 2.4, 12, M.metal, -11, ry + 1.2,  6);
  b(g,  2.6, 0.1, 2.6,  -11, ry + 2.4, 6, M.darkTrim);

  /* ── Communications mast ────────────────────────────────── */
  cyl(g, 0.06, 0.08, 5.0, 8, M.trim, 12, ry + 2.5, -8);
  b(g, 0.8, 0.04, 0.04, 12, ry + 4.8, -8, M.metal);
  b(g, 0.35, 0.25, 0.04, 12.4, ry + 4.8, -8, M.trim);
  cyl(g, 0.1, 0.1, 0.2, 8, M.redEm, 12, ry + 5.1, -8);
}

/* ══════════════════════════════════════════════════════════════
   S3 — EMERGENCY WING INTERIOR (ground floor, west side)
   Uses: createBanko, createHastaneYatagi prefabs
══════════════════════════════════════════════════════════════ */
function buildEmergencyInterior(g) {
  slab(g, 13, 19, -7.5, WT + 0.09, 0, lm(0xecebe6));

  /* ── Triage counter — via Banko prefab ──────────────────── */
  const counter = createBanko();
  placePrefab(g, counter, -8, 0, 4.5, 0);

  // Monitor on counter
  b(g, 0.48, 0.36, 0.04, -8, 1.64, 4.2, lm(0x001800));
  b(g, 0.48, 0.04, 0.02, -8, 1.44, 4.2, M.trim);

  /* ── 3 emergency beds — via prefab ──────────────────────── */
  const bedPositions = [[-11, 1], [-11, -3], [-11, -7]];
  for (const [bx, bz] of bedPositions) {
    const bed = createHastaneYatagi();
    placePrefab(g, bed, bx, 0, bz, 0);
  }

  /* ── Defibrillator cabinet (west wall, hospital-specific) ── */
  b(g, 0.7, 1.8, 0.4, -(HW - 0.5), 0.9, -1, M.cabinet);
  b(g, 0.5, 0.06, 0.3, -(HW - 0.5), 1.5, -1, M.trim);
  b(g, 0.3, 0.22, 0.28, -(HW - 0.5), 0.9, -1, M.yellow);

  /* ── Emergency entrance doors ───────────────────────────── */
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX - ER_W / 4, FH / 2 - 0.2, HD, M.glassDk);
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX + ER_W / 4, FH / 2 - 0.2, HD, M.glassDk);

  /* ── Emergency sign above entrance ──────────────────────── */
  b(g, ER_W + 0.4, 0.4, 0.18, ER_CX, FH + 0.2, HD + WT + 0.14, M.redEm);
}

/* ══════════════════════════════════════════════════════════════
   S4 — MAIN LOBBY & OUTPATIENT (ground floor, east side)
   Uses: createBeklemeSandalyasi, createSehpa, createHastaneYatagi
══════════════════════════════════════════════════════════════ */
function buildMainLobby(g) {
  slab(g, 13, 19, 7, WT + 0.09, 0, lm(0xf4f1ec));

  /* ── Reception desk (L-shaped, hospital-specific) ────────── */
  b(g, 5.0, 1.05, 0.80,  8, 0.92, 3.5, M.white);
  b(g, 0.80, 1.05, 2.4,  10.6, 0.92, 2.8, M.white);
  b(g, 5.2, 0.08, 0.85,  8, 1.46, 3.5, M.trim);
  b(g, 0.85, 0.08, 2.5,  10.6, 1.46, 2.8, M.trim);
  for (const [dx, dz] of [[-1.5, 0], [0, 0], [1.5, 0]]) {
    b(g, 0.42, 0.32, 0.04, 8 + dx, 1.65, 3.1 + dz, lm(0x001800));
    b(g, 0.42, 0.03, 0.02, 8 + dx, 1.49, 3.1 + dz, M.trim);
  }

  /* ── 4 waiting chairs — via prefab ──────────────────────── */
  for (let i = 0; i < 4; i++) {
    const chair = createBeklemeSandalyasi();
    placePrefab(g, chair, 12, 0, -4 + i * 1.1, -Math.PI / 2);
  }

  /* ── Coffee table — via Sehpa prefab ────────────────────── */
  const sehpa = createSehpa();
  placePrefab(g, sehpa, 12, 0, -2.0, 0);

  /* ── Floor direction stripe ─────────────────────────────── */
  slab(g, 1.0, 18, 4, WT + 0.12, 0, lm(0x4488cc, { transparent: true, opacity: 0.4 }));

  /* ── Main entrance doors ────────────────────────────────── */
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX - MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX + MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);

  /* ── "OUTPATIENT" sign strip ────────────────────────────── */
  b(g, MN_W + 0.5, 0.35, 0.14, MN_CX, FH + 0.18, HD + WT + 0.14, M.signBg);
  b(g, MN_W - 0.3, 0.14, 0.03, MN_CX, FH + 0.18, HD + WT + 0.22, M.white);

  /* ── 2 patient rooms off east corridor ──────────────────── */
  for (let r = 0; r < 2; r++) {
    const rz = -6 + r * 7;
    b(g, WT, FH - 0.4, 4.5,  HW - 2.5, (FH - 0.4) / 2 + WT, rz, M.offWhite);
    const bed = createHastaneYatagi();
    placePrefab(g, bed, HW - 1, 0, rz, Math.PI / 2);
    b(g, 0.4, 0.5, 0.4, HW - 2.0, 0.5, rz - 1.8, M.cabinet);
  }
}

/* ══════════════════════════════════════════════════════════════
   S5 — AMBULANCE BAY (covered structure, south of ER entrance)
   Uses: createAmbulans prefab
══════════════════════════════════════════════════════════════ */
function buildAmbulanceBay(g) {
  const roadZ = HD + 8;
  slab(g, 7, 14, ER_CX, 0.10, roadZ, M.road);
  for (let i = 0; i < 4; i++) {
    slab(g, 0.20, 1.6, ER_CX, 0.12, roadZ - 5 + i * 3.0, M.stripeY);
  }
  b(g, 0.25, 0.16, 14, ER_CX - 3.65, 0.12, roadZ, M.curb);
  b(g, 0.25, 0.16, 14, ER_CX + 3.65, 0.12, roadZ, M.curb);

  /* ── Bay canopy ─────────────────────────────────────────── */
  const CY = roadZ - 1;
  const CW = 7.0, CD = 4.5, CH = 3.4;

  for (const [px, pz] of [
    [ER_CX - CW / 2 + 0.25, CY - CD / 2],
    [ER_CX + CW / 2 - 0.25, CY - CD / 2],
    [ER_CX - CW / 2 + 0.25, CY + CD / 2],
    [ER_CX + CW / 2 - 0.25, CY + CD / 2],
  ]) {
    wb(g, 0.28, CH, 0.28, px, CH / 2, pz, M.conc);
  }
  b(g, CW, 0.20, CD, ER_CX, CH + 0.10, CY, M.conc);
  b(g, CW + 0.3, 0.32, 0.18, ER_CX, CH + 0.16, CY - CD / 2 - 0.08, M.trim);
  b(g, CW + 0.3, 0.32, 0.18, ER_CX, CH + 0.16, CY + CD / 2 + 0.08, M.trim);
  b(g, 0.18, 0.32, CD + 0.3, ER_CX - CW / 2 - 0.08, CH + 0.16, CY, M.trim);
  b(g, 0.18, 0.32, CD + 0.3, ER_CX + CW / 2 + 0.08, CH + 0.16, CY, M.trim);

  b(g, CW - 0.3, 0.10, 0.14, ER_CX, CH - 0.04, CY - CD / 2 + 0.3, M.redEm);
  ptl(g, 0xff4444, 0.5, 10, ER_CX, CH - 0.2, CY);

  /* ── Ambulance — via prefab ─────────────────────────────── */
  const ambulans = createAmbulans();
  placePrefab(g, ambulans, ER_CX, 0, CY + 2.5, 0);
}

/* ══════════════════════════════════════════════════════════════
   S6 — MAIN ENTRANCE CANOPY (south, centre-east)
══════════════════════════════════════════════════════════════ */
function buildMainCanopy(g) {
  const CX = MN_CX, CZ = HD + 3.2;
  const CW = 6.5, CD = 4.5, CH = 3.4;

  for (const [px, pz] of [
    [CX - CW / 2 + 0.2, CZ - CD / 2 + 0.2],
    [CX + CW / 2 - 0.2, CZ - CD / 2 + 0.2],
    [CX - CW / 2 + 0.2, CZ + CD / 2 - 0.2],
    [CX + CW / 2 - 0.2, CZ + CD / 2 - 0.2],
  ]) {
    cyl(g, 0.07, 0.07, CH, 8, M.metal, px, CH / 2, pz);
  }

  b(g, CW, 0.1, CD, CX, CH + 0.05, CZ, lm(0xaaccee, { transparent: true, opacity: 0.35 }));
  b(g, CW + 0.1, 0.18, 0.12, CX, CH + 0.09,  CZ - CD / 2, M.metal);
  b(g, CW + 0.1, 0.18, 0.12, CX, CH + 0.09,  CZ + CD / 2, M.metal);
  b(g, 0.12, 0.18, CD + 0.1, CX - CW / 2, CH + 0.09, CZ, M.metal);
  b(g, 0.12, 0.18, CD + 0.1, CX + CW / 2, CH + 0.09, CZ, M.metal);
  ptl(g, 0xfff5e0, 0.5, 10, CX, CH - 0.3, CZ);

  b(g, MN_W + 0.2, 0.12, 0.6, MN_CX, 0.06, HD + 0.5, M.conc);
}

/* ══════════════════════════════════════════════════════════════
   S7 — PARKING LOT (south of building)
   Uses: createSokakLambasi prefab
══════════════════════════════════════════════════════════════ */
function buildParking(g) {
  const START_Z = HD + 1.5;

  slab(g, 26, 13, 0, 0.05, START_Z + 6.5, M.asphalt);
  slab(g, 7, 4.5, 0, 0.10, HD + 12.5, M.road);

  const STALL_W = 2.4, STALL_D = 4.2;
  const rowA_Z = START_Z + 1.8;
  const rowB_Z = START_Z + 8.3;

  for (let i = 0; i < 5; i++) {
    const sx = -6 + i * STALL_W;
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowA_Z, M.stripeW);
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowB_Z, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowA_Z - STALL_D / 2, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowB_Z - STALL_D / 2, M.stripeW);
  }
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowA_Z, M.stripeW);
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowB_Z, M.stripeW);

  for (let i = 0; i < 5; i++) {
    slab(g, 0.12, 1.6, -6 + i * 2.6, 0.07, rowA_Z + STALL_D / 2 + 1.0, M.stripeY);
  }

  /* ── 3 lamp posts — via SokakLambasi prefab ─────────────── */
  const lampPositions = [[-11, rowA_Z], [11, rowA_Z], [0, rowB_Z + 1.5]];
  for (const [llx, llz] of lampPositions) {
    const lamp = createSokakLambasi();
    placePrefab(g, lamp, llx, 0, llz, 0);
  }

  // Disabled bay
  slab(g, STALL_W - 0.1, STALL_D - 0.1, -6 + STALL_W / 2, 0.08, rowA_Z,
    lm(0x1144aa, { transparent: true, opacity: 0.45 }));
}

/* ══════════════════════════════════════════════════════════════
   S8 — GARDEN (east side of building)
   Uses: createAgac, createBank, createSokakLambasi prefabs
══════════════════════════════════════════════════════════════ */
function buildGarden(g) {
  slab(g, 10, 16, HW + 5, 0.04, 0, M.grass);

  slab(g, 1.0, 10, HW + 2, 0.07, 2, M.path);
  slab(g, 6, 1.0, HW + 5, 0.10, 7, M.path);

  /* ── Trees — via Agac prefab ────────────────────────────── */
  const treePlacements = [[HW + 3, -4, 0.75], [HW + 7, 2, 0.85], [HW + 4, 6, 0.7]];
  for (const [tx, tz, ts] of treePlacements) {
    const t = createAgac(ts);
    placePrefab(g, t, tx, 0, tz, 0);
  }

  /* ── Benches — via Bank prefab ──────────────────────────── */
  const bench1 = createBank();
  placePrefab(g, bench1, HW + 2.5, 0, -2, 0);
  const bench2 = createBank();
  placePrefab(g, bench2, HW + 5.5, 0, 5, -Math.PI / 6);

  // Flower bed
  b(g, 3.5, 0.15, 2.2, HW + 7.5, 0.14, -3, lm(0x7a5c3a));
  slab(g, 3.1, 1.9, HW + 7.5, 0.14, -3, lm(0x4a8830));

  /* ── Garden lamp — via SokakLambasi prefab ──────────────── */
  const gardenLamp = createSokakLambasi();
  placePrefab(g, gardenLamp, HW + 4, 0, 3, 0);
}

/* ══════════════════════════════════════════════════════════════
   S9 — NORTH SERVICE AREA
   Uses: createJenerator, createCopKonteyneri, createCitFenceRun
══════════════════════════════════════════════════════════════ */
function buildServiceArea(g) {
  slab(g, 10, 8, 0, 0.06, -(HD + 5), M.road);

  /* ── Generator — via Jenerator prefab ───────────────────── */
  const gen = createJenerator();
  placePrefab(g, gen, -8, 0, -(HD + 4), 0);

  /* ── 2 dumpsters — via CopKonteyneri prefab ─────────────── */
  const d1 = createCopKonteyneri(0x1a5e1a);
  placePrefab(g, d1, 5, 0, -(HD + 4.5), 0);
  const d2 = createCopKonteyneri(0x5e1a1a);
  placePrefab(g, d2, 7.4, 0, -(HD + 4.5), 0);

  /* ── Chain-link fence — via CitFenceRun prefab ──────────── */
  // Cit builds in group-local space; group positioned at hospital origin
  // so children land at correct world coords (= hx(localX), hz(localZ))
  const westFence = createCitFenceRun({
    axis: 'z', start: -20, end: -10, fixedCoord: -14.0, fenceHeight: 1.6,
  });
  placePrefab(g, westFence, 0, 0, 0, 0);

  const northFence = createCitFenceRun({
    axis: 'x', start: -14, end: -4, fixedCoord: -19.5, fenceHeight: 1.6,
  });
  placePrefab(g, northFence, 0, 0, 0, 0);
}

/* ══════════════════════════════════════════════════════════════
   S10 — PERIMETER WALL & GATE
   Uses: createSokakLambasi, createGuvenlikKamerasi
══════════════════════════════════════════════════════════════ */
function buildPerimeter(g) {
  const PH = 1.1, PT = 0.28;
  const PX = 26, PZN = -26, PZS = 26;

  // ── South gate (centre): gap x = -4 to +4 ──
  const gw = 6.0;
  wb(g, PX - gw, PH, PT, -(gw + (PX - gw) / 2), PH / 2, PZS, M.conc);
  wb(g, PX - gw, PH, PT,  (gw + (PX - gw) / 2), PH / 2, PZS, M.conc);

  // North wall
  wb(g, PX * 2, PH, PT, 0, PH / 2, PZN, M.conc);
  // East wall
  wb(g, PT, PH, PZS - PZN, PX, PH / 2, (PZS + PZN) / 2, M.conc);
  // West wall
  wb(g, PT, PH, PZS - PZN, -PX, PH / 2, (PZS + PZN) / 2, M.conc);

  /* ── Corner lamp posts — via SokakLambasi prefab ──────────── */
  const cornerLamps = [[PX - 1, PZN + 1], [PX - 1, PZS - 1], [-(PX - 1), PZN + 1], [-(PX - 1), PZS - 1]];
  for (const [clx, clz] of cornerLamps) {
    const lamp = createSokakLambasi();
    placePrefab(g, lamp, clx, 0, clz, 0);
  }

  /* ── Security cameras — via GuvenlikKamerasi prefab ──────── */
  const cameraPositions = [
    [ HW + 1,  HD + 0.5, 0],
    [ HW + 1, -(HD + 0.5), Math.PI],
    [-(HW + 1),  HD + 0.5, 0],
    [-(HW + 1), -(HD + 0.5), Math.PI],
  ];
  for (const [cx, cz, cry] of cameraPositions) {
    const cam = createGuvenlikKamerasi();
    placePrefab(g, cam, cx, BH - 0.22, cz, cry);
  }
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */

/**
 * Builds the full hospital complex and attaches it to `scene`.
 * @param {THREE.Scene}  scene
 * @param {CANNON.World} physicsWorld
 * @returns {{ group: THREE.Group, interactionZones: Array }}
 */
export function createHospital(scene, physicsWorld) {
  _pb = [];

  const group = new THREE.Group();
  group.name = 'hospital';
  group.userData.sourceFile = ZONE_SRC;

  /* Build order (back-to-front, ground-up) */
  buildShell(group);
  buildRoof(group);
  buildEmergencyInterior(group);
  buildMainLobby(group);
  buildAmbulanceBay(group);
  buildMainCanopy(group);
  buildParking(group);
  buildGarden(group);
  buildServiceArea(group);
  buildPerimeter(group);

  /* ── Register physics bodies ──────────────────────────── */
  for (const pb of _pb) {
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(new CANNON.Box(new CANNON.Vec3(pb.sx / 2, pb.sy / 2, pb.sz / 2)));
    body.position.copy(pb.mesh.position);
    if (pb.mesh.rotation.y !== 0) {
      body.quaternion.setFromEuler(0, pb.mesh.rotation.y, 0);
    }
    physicsWorld.addBody(body);
  }

  scene.add(group);

  /* ── Interaction zones ────────────────────────────────── */
  const interactionZones = [
    {
      type: 'emergency_checkin',
      label: '[E] Acil Servis',
      position: { x: hx(ER_CX), y: 0, z: hz(HD + 2) },
      radius: 3,
    },
    {
      type: 'ambulance',
      label: '[E] Ambulans Çağır',
      position: { x: hx(ER_CX), y: 0, z: hz(HD + 8) },
      radius: 4,
    },
    {
      type: 'main_reception',
      label: '[E] Kayıt / Poliklinik',
      position: { x: hx(MN_CX), y: 0, z: hz(HD + 2) },
      radius: 3,
    },
  ];

  console.log(
    '[HOSPITAL v4] Built at origin (%d, %d) — %d physics bodies, %d interaction zones',
    HOSPITAL_ORIGIN.x, HOSPITAL_ORIGIN.z, _pb.length, interactionZones.length
  );

  return { group, interactionZones };
}
