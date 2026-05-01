// client/hospital.js — GTA-style Hospital Complex v2.0
// ✓ physicsBodies local (no module-level accumulation)
// ✓ Thin box() for all floor/ground surfaces (PlaneGeometry removed — it was vertical!)
// ✓ Wall coordinates calculated without overlaps
// ✓ GTA5-inspired proportions: helipad, ambulance bay canopy, proper facade

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

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
   MATERIALS
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
  // Interior / props
  wood    : lm(0x8b6810),
  bed     : lm(0xd0cec6),
  cabinet : lm(0x9ab0c8),
  screen  : lm(0x001800),
  bark    : lm(0x5c3d1e),
  leaf    : lm(0x2e5a18),
  // Road markings (MeshBasic → always fully lit)
  stripeW : bm(0xffffff),
  stripeY : bm(0xffcc00),
  heliW   : bm(0xffffff),
};

/* ══════════════════════════════════════════════════════════════
   PRIMITIVE HELPERS
══════════════════════════════════════════════════════════════ */

let _pb; // physics-body accumulator — assigned fresh in createHospital()

/** Generic box.  mat can be any THREE.Material. */
function b(g, sx, sy, sz, lx, ly, lz, mat, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (ry !== 0) m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  return m;
}

/** Physics-enabled box — pushed to _pb. */
function wb(g, sx, sy, sz, lx, ly, lz, mat, ry = 0) {
  const m = b(g, sx, sy, sz, lx, ly, lz, mat, ry);
  _pb.push({ mesh: m, sx, sy, sz });
  return m;
}

/** Thin flat slab — correct alternative to PlaneGeometry (which is vertical!). */
const slab = (g, sx, sz, lx, ly, lz, mat) => b(g, sx, 0.08, sz, lx, ly, lz, mat);

/** Cylinder helper. */
function cyl(g, rT, rB, h, seg, mat, lx, ly, lz, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), mat);
  m.position.set(hx(lx), ly, hz(lz));
  if (rz !== 0) m.rotation.z = rz;
  m.castShadow = true;
  g.add(m);
  return m;
}

/** Sphere helper. */
function sph(g, r, seg, mat, lx, ly, lz) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.ceil(seg * 0.6)), mat);
  m.position.set(hx(lx), ly, hz(lz));
  m.castShadow = true;
  g.add(m);
  return m;
}

/** Point light. */
function ptl(g, color, intens, dist, lx, ly, lz) {
  const l = new THREE.PointLight(color, intens, dist);
  l.position.set(hx(lx), ly, hz(lz));
  g.add(l);
  return l;
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE PROP BUILDERS
══════════════════════════════════════════════════════════════ */

function lampPost(g, lx, lz, h = 8) {
  cyl(g, 0.07, 0.10, h, 8, M.trim, lx, h / 2, lz);
  b(g, 1.5, 0.15, 0.38, lx, h + 0.06, lz, M.darkTrim);
  b(g, 0.42, 0.12, 0.32, lx, h - 0.14, lz, M.metal);
  ptl(g, 0xfffae8, 0.7, 22, lx, h - 0.1, lz);
}

function tree(g, lx, lz, s = 1) {
  cyl(g, 0.14 * s, 0.22 * s, 2.8 * s, 8, M.bark, lx, 1.4 * s, lz);
  sph(g, 1.6 * s, 8, M.leaf, lx, 3.5 * s, lz);
}

function bench(g, lx, lz, ry = 0) {
  b(g, 1.8, 0.07, 0.42, lx, 0.44, lz, M.wood, ry);
  b(g, 1.8, 0.38, 0.06, lx, 0.72, lz - 0.18, M.wood, ry);
  for (const dx of [-0.72, 0.72]) {
    b(g, 0.06, 0.44, 0.38, lx + dx * Math.cos(ry), 0.22, lz + dx * Math.sin(ry), M.trim);
  }
}

function hospitalBed(g, lx, lz, ry = 0) {
  b(g, 2.0, 0.22, 0.9,  lx, 0.52, lz, M.metal, ry);   // frame
  b(g, 1.96, 0.16, 0.86, lx, 0.65, lz, M.bed,   ry);   // mattress
  b(g, 0.58, 0.10, 0.52, lx - 0.7, 0.74, lz, M.white, ry); // pillow
  b(g, 0.86, 0.70, 0.06, lx, 0.98, lz - 0.45, M.metal, ry); // headboard
  cyl(g, 0.03, 0.03, 1.4, 8, M.metal, lx + 0.85, 0.7, lz);  // IV pole
  b(g, 0.28, 0.18, 0.28,  lx + 0.85, 1.48, lz, M.screen);   // monitor
}

function waitingChair(g, lx, lz, ry = 0) {
  b(g, 0.5, 0.08, 0.50, lx, 0.42, lz, M.wood, ry);
  b(g, 0.46, 0.44, 0.05, lx, 0.70, lz - 0.23, M.wood, ry);
  for (const [dx, dz] of [[.2, .2], [.2, -.2], [-.2, .2], [-.2, -.2]]) {
    b(g, 0.04, 0.42, 0.04, lx + dx, 0.21, lz + dz, M.trim);
  }
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
  //
  //  x layout (local) — walls trimmed WT at corners to avoid interpenetration:
  //  -13.7 ──[Seg A: w=4.7]── -9  [ER gap 4m]  -5 ──[Seg B: w=8.5]── +3.5  [MN gap 5m]  +8.5 ──[Seg C: w=5.2]── +13.7
  //
  //  Seg A:  cx = (-13.7 + -9) / 2 = -11.35,   w = 4.7
  //  Seg B:  cx = (-5 + 3.5) / 2 = -0.75,      w = 8.5
  //  Seg C:  cx = (8.5 + 13.7) / 2 = +11.10,    w = 5.2
  //
  wb(g,  4.7, FH, WT, -11.35, FH / 2, HD + WT / 2, M.wall);   // A
  wb(g,  8.5, FH, WT,  -0.75, FH / 2, HD + WT / 2, M.wall);   // B
  wb(g,  5.2, FH, WT,  11.10, FH / 2, HD + WT / 2, M.wall);   // C

  /* ── SOUTH wall — upper 2 floors (full, no gaps) ────────── */
  //  Overlaps 0.1 m with ground floor below to kill seam Z-fighting
  wb(g, HW * 2 - WT * 2, FH * 2 + 0.10, WT, 0, FH + FH - 0.05, HD + WT / 2, M.wallHi);

  /* ── Horizontal facade trim bands ─────────────────────────
     Thin ledge at each storey line — south, north, east, west  */
  for (let f = 0; f <= NS; f++) {
    const ty = f * FH + 0.12;
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, HD  + WT / 2 + 0.40,  M.trim); // S
    b(g, HW * 2 + WT * 2 + 0.1, 0.26, 0.5,  0,           ty, -(HD + WT / 2 + 0.40), M.trim); // N
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1,  HW + WT / 2 + 0.40, ty, 0, M.trim);   // E
    b(g, 0.5, 0.26, HD * 2 + WT * 2 + 0.1, -(HW + WT / 2 + 0.40), ty, 0, M.trim); // W
  }

  /* ── Window bands (glass strips per floor) ──────────────── */
  for (let f = 0; f < NS; f++) {
    const wy = f * FH + 2.1;
    const wh = 1.7;
    // South — ground floor only on solid segments
    if (f === 0) {
      b(g,  4.2, wh, 0.04, -11.35, wy, HD + WT + 0.08, M.glass);
      b(g,  8.0, wh, 0.04,  -0.75, wy, HD + WT + 0.08, M.glass);
      b(g,  4.7, wh, 0.04,  11.10, wy, HD + WT + 0.08, M.glass);
    } else {
      b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, HD + WT + 0.08, M.glass);
    }
    // North face
    b(g, HW * 2 - 0.2, wh, 0.04, 0, wy, -(HD + WT + 0.08), M.glass);
    // East & West — 3 windows per floor
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
    b(g, 1.4, 4.2, 0.08, cx, FH * 2, HD + WT + 0.10, M.red); // vertical
    b(g, 4.2, 1.4, 0.08, cx, FH * 2, HD + WT + 0.10, M.red); // horizontal
  }

  /* ── Entrance sign board ────────────────────────────────── */
  b(g, 5.2, 0.9, 0.16, 0, 3.4, HD + WT + 0.14, M.signBg);
  b(g, 4.2, 0.28, 0.04, 0, 3.4, HD + WT + 0.23, M.white); // text bar placeholder

  /* ── Roof parapet — 4 sides, no corner overlap issues ───── */
  const px = HW + WT + 0.3,  pz = HD + WT + 0.3, ph = 0.9, pt = WT;
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2,  pz, M.conc);  // south
  wb(g, HW * 2 + 1.2, ph, pt, 0,   BH + ph / 2, -pz, M.conc);  // north
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2,  px, BH + ph / 2, 0, M.conc);  // east
  wb(g, pt, ph, HD * 2 + 0.6 - pt * 2, -px, BH + ph / 2, 0, M.conc);  // west

  /* ── Interior divider walls visible from lobby ───────────── */
  // Lobby / reception divider east-west at z=+2 (partial, leaves aisle in centre)
  b(g, 8.5, FH - WT, WT, -0.75, (FH - WT) / 2 + WT, 2, M.offWhite);
  // ER wing west divider
  b(g, WT, FH - WT, HD * 2 - WT, -1.5, (FH - WT) / 2 + WT, 0, M.offWhite);
}

/* ══════════════════════════════════════════════════════════════
   S2 — ROOF DETAILS (helipad, HVAC, water tank, antenna)
══════════════════════════════════════════════════════════════ */
function buildRoof(g) {
  const ry = BH + WT; // top of roof slab

  /* ── Roof surface ────────────────────────────────────────── */
  slab(g, HW * 2 - 0.2, HD * 2 - 0.2, 0, ry + 0.04, 0, M.roof);

  /* ── Helipad (centre) ───────────────────────────────────── */
  // Helipad base circle (darker pad)
  const hpGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.06, 32);
  const hp = new THREE.Mesh(hpGeo, lm(0x222222));
  hp.position.set(hx(0), ry + 0.06, hz(0));
  g.add(hp);

  // White circle ring
  const ringGeo = new THREE.TorusGeometry(4.2, 0.2, 8, 48);
  const ring = new THREE.Mesh(ringGeo, M.heliW);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(hx(0), ry + 0.1, hz(0));
  g.add(ring);

  // "H" marking — built from 3 boxes
  b(g, 0.5, 0.08, 3.0,  -1.0, ry + 0.1, 0, M.heliW); // left vertical
  b(g, 0.5, 0.08, 3.0,   1.0, ry + 0.1, 0, M.heliW); // right vertical
  b(g, 2.5, 0.08, 0.5,   0,   ry + 0.1, 0, M.heliW); // crossbar

  // Helipad corner lights (4 corners)
  for (const [lx2, lz2] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) {
    cyl(g, 0.08, 0.08, 0.3, 8, M.yellowEm, lx2, ry + 0.15, lz2);
  }

  /* ── HVAC units ─────────────────────────────────────────── */
  b(g, 3.5, 1.2, 2.0, -10, ry + 0.6, -7, M.metal);  // unit 1
  b(g, 2.8, 1.0, 1.6,  10, ry + 0.5, -7, M.metal);  // unit 2
  b(g, 2.0, 0.8, 1.4,  10, ry + 0.4,  7, M.metal);  // unit 3
  // Ventilation grille lines
  for (let i = 0; i < 4; i++) {
    b(g, 3.6, 0.04, 0.04, -10, ry + 0.6 + i * 0.18, -6.0, M.darkTrim);
  }

  /* ── Water tank ─────────────────────────────────────────── */
  cyl(g, 1.2, 1.2, 2.4, 12, M.metal, -11, ry + 1.2,  6);
  b(g,  2.6, 0.1, 2.6,  -11, ry + 2.4, 6, M.darkTrim); // lid

  /* ── Communications mast ────────────────────────────────── */
  cyl(g, 0.06, 0.08, 5.0, 8, M.trim, 12, ry + 2.5, -8);
  b(g, 0.8, 0.04, 0.04, 12, ry + 4.8, -8, M.metal);   // dish arm
  b(g, 0.35, 0.25, 0.04, 12.4, ry + 4.8, -8, M.trim); // dish
  // Blinking light on top of mast
  cyl(g, 0.1, 0.1, 0.2, 8, M.redEm, 12, ry + 5.1, -8);
}

/* ══════════════════════════════════════════════════════════════
   S3 — EMERGENCY WING INTERIOR (ground floor, west side)
══════════════════════════════════════════════════════════════ */
function buildEmergencyInterior(g) {
  // Interior floor
  slab(g, 13, 19, -7.5, WT + 0.09, 0, lm(0xecebe6));

  /* ── Triage counter ─────────────────────────────────────── */
  b(g, 4.0, 1.0, 0.75, -8, 0.9, 4.5, M.white);       // body
  b(g, 4.2, 0.08, 0.80, -8, 1.42, 4.5, M.wood);      // worktop
  // Counter legs
  for (const [dx, dz] of [[-1.8, 0.3], [1.8, 0.3], [-1.8, -0.3], [1.8, -0.3]]) {
    b(g, 0.07, 0.9, 0.07, -8 + dx, 0.45, 4.5 + dz, M.trim);
  }
  // Monitor on counter
  b(g, 0.48, 0.36, 0.04, -8, 1.64, 4.2, M.screen);
  b(g, 0.48, 0.04, 0.02, -8, 1.44, 4.2, M.trim);

  /* ── 3 emergency beds ───────────────────────────────────── */
  hospitalBed(g, -11, 1,  0);
  hospitalBed(g, -11, -3, 0);
  hospitalBed(g, -11, -7, 0);

  /* ── Defibrillator cabinet (west wall) ──────────────────── */
  b(g, 0.7, 1.8, 0.4, -(HW - 0.5), 0.9, -1, M.cabinet);
  b(g, 0.5, 0.06, 0.3, -(HW - 0.5), 1.5, -1, M.trim); // shelf
  b(g, 0.3, 0.22, 0.28, -(HW - 0.5), 0.9, -1, M.yellow); // defibrillator

  /* ── Emergency entrance doors (transparent) ─────────────── */
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX - ER_W / 4, FH / 2 - 0.2, HD, M.glassDk); // L
  b(g, ER_W / 2 - 0.1, FH - 0.6, 0.06, ER_CX + ER_W / 4, FH / 2 - 0.2, HD, M.glassDk); // R

  /* ── Emergency sign above entrance (emissive red strip) ─── */
  b(g, ER_W + 0.4, 0.4, 0.18, ER_CX, FH + 0.2, HD + WT + 0.14, M.redEm);
}

/* ══════════════════════════════════════════════════════════════
   S4 — MAIN LOBBY & OUTPATIENT (ground floor, east side)
══════════════════════════════════════════════════════════════ */
function buildMainLobby(g) {
  // Interior floor
  slab(g, 13, 19, 7, WT + 0.09, 0, lm(0xf4f1ec));

  /* ── Reception desk ─────────────────────────────────────── */
  b(g, 5.0, 1.05, 0.80,  8, 0.92, 3.5, M.white);
  b(g, 0.80, 1.05, 2.4,  10.6, 0.92, 2.8, M.white); // return
  b(g, 5.2, 0.08, 0.85,  8, 1.46, 3.5, M.wood);     // countertop
  b(g, 0.85, 0.08, 2.5,  10.6, 1.46, 2.8, M.wood);  // countertop return
  // Computers
  for (const [dx, dz] of [[-1.5, 0], [0, 0], [1.5, 0]]) {
    b(g, 0.42, 0.32, 0.04, 8 + dx, 1.65, 3.1 + dz, M.screen);
    b(g, 0.42, 0.03, 0.02, 8 + dx, 1.49, 3.1 + dz, M.trim);
  }

  /* ── 4 waiting chairs ───────────────────────────────────── */
  for (let i = 0; i < 4; i++) {
    waitingChair(g, 12, -4 + i * 1.1, -Math.PI / 2);
  }
  // Coffee table
  b(g, 1.1, 0.07, 0.55, 12, 0.42, -2.0, M.wood);
  for (const [dx, dz] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]]) {
    b(g, 0.04, 0.40, 0.04, 12 + dx, 0.2, -2.0 + dz, M.trim);
  }

  /* ── Floor direction stripe (corridor line) ─────────────── */
  slab(g, 1.0, 18, 4, WT + 0.12, 0, lm(0x4488cc, { transparent: true, opacity: 0.4 }));

  /* ── Main entrance doors ────────────────────────────────── */
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX - MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);
  b(g, MN_W / 2 - 0.12, FH - 0.6, 0.06, MN_CX + MN_W / 4, FH / 2 - 0.2, HD, M.glassDk);

  /* ── "OUTPATIENT" sign strip above door ─────────────────── */
  b(g, MN_W + 0.5, 0.35, 0.14, MN_CX, FH + 0.18, HD + WT + 0.14, M.signBg);
  b(g, MN_W - 0.3, 0.14, 0.03, MN_CX, FH + 0.18, HD + WT + 0.22, M.white);

  /* ── 2 patient rooms off east corridor ──────────────────── */
  for (let r = 0; r < 2; r++) {
    const rz = -6 + r * 7;
    b(g, WT, FH - 0.4, 4.5,  HW - 2.5, (FH - 0.4) / 2 + WT, rz, M.offWhite); // partition
    hospitalBed(g, HW - 1, rz, Math.PI / 2);
    b(g, 0.4, 0.5, 0.4, HW - 2.0, 0.5, rz - 1.8, M.cabinet); // bedside
  }
}

/* ══════════════════════════════════════════════════════════════
   S5 — AMBULANCE BAY (covered structure, south of ER entrance)
══════════════════════════════════════════════════════════════ */
function buildAmbulanceBay(g) {
  // Approach road (south of ER entrance, within lz 10-26)
  const roadZ = HD + 8; // centre z = 18
  slab(g, 7, 14, ER_CX, 0.10, roadZ, M.road);
  // Centre yellow dashes
  for (let i = 0; i < 4; i++) {
    slab(g, 0.20, 1.6, ER_CX, 0.12, roadZ - 5 + i * 3.0, M.stripeY);
  }
  // Side kerbs
  b(g, 0.25, 0.16, 14, ER_CX - 3.65, 0.12, roadZ, M.curb);
  b(g, 0.25, 0.16, 14, ER_CX + 3.65, 0.12, roadZ, M.curb);

  /* ── Bay canopy (compact, within bounds) ──────────────────── */
  const CY = roadZ - 1;  // 17
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

  /* ── Ambulance prop ──────────────────────────────────────── */
  const AX = ER_CX, AZ = CY + 2.5;
  b(g, 4.5, 1.9, 2.0, AX, 1.4, AZ, M.white);
  b(g, 1.8, 0.30, 1.8, AX - 1.3, 2.1, AZ, M.white);
  b(g, 0.04, 1.5, 1.9, AX + 2.26, 1.25, AZ, lm(0xdddddd));
  b(g, 0.04, 1.5, 0.04, AX + 2.28, 1.25, AZ, M.trim);
  b(g, 4.5, 0.18, 0.04, AX, 1.65, AZ - 1.01, M.redEm);
  b(g, 4.5, 0.18, 0.04, AX, 1.65, AZ + 1.01, M.redEm);
  b(g, 0.5, 0.12, 0.7, AX - 0.25, 2.38, AZ, M.redEm);
  b(g, 0.5, 0.12, 0.7, AX + 0.25, 2.38, AZ, M.blueEm);
  b(g, 0.04, 0.8, 1.4, AX - 2.27, 1.7, AZ, lm(0x99bbcc, { transparent: true, opacity: 0.5 }));
  for (const [wx, wz] of [[1.4, 1.0], [-1.4, 1.0], [1.4, -1.0], [-1.4, -1.0]]) {
    const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.24, 10);
    const wh = new THREE.Mesh(wGeo, M.darkTrim);
    wh.position.set(hx(AX + wx), 0.38, hz(AZ + wz));
    wh.rotation.z = Math.PI / 2;
    g.add(wh);
    cyl(g, 0.18, 0.18, 0.03, 8, M.metal, AX + wx, 0.38, AZ + wz + 0.13);
    cyl(g, 0.18, 0.18, 0.03, 8, M.metal, AX + wx, 0.38, AZ + wz - 0.13);
  }
}

/* ══════════════════════════════════════════════════════════════
   S6 — MAIN ENTRANCE CANOPY (south, centre-east)
══════════════════════════════════════════════════════════════ */
function buildMainCanopy(g) {
  const CX = MN_CX, CZ = HD + 3.2;
  const CW = 6.5, CD = 4.5, CH = 3.4;

  // 4 slim steel columns
  for (const [px, pz] of [
    [CX - CW / 2 + 0.2, CZ - CD / 2 + 0.2],
    [CX + CW / 2 - 0.2, CZ - CD / 2 + 0.2],
    [CX - CW / 2 + 0.2, CZ + CD / 2 - 0.2],
    [CX + CW / 2 - 0.2, CZ + CD / 2 - 0.2],
  ]) {
    cyl(g, 0.07, 0.07, CH, 8, M.metal, px, CH / 2, pz);
  }

  // Glass canopy panels
  b(g, CW, 0.1, CD, CX, CH + 0.05, CZ, lm(0xaaccee, { transparent: true, opacity: 0.35 }));
  // Canopy steel frame
  b(g, CW + 0.1, 0.18, 0.12, CX, CH + 0.09,  CZ - CD / 2, M.metal); // front rail
  b(g, CW + 0.1, 0.18, 0.12, CX, CH + 0.09,  CZ + CD / 2, M.metal); // back rail
  b(g, 0.12, 0.18, CD + 0.1, CX - CW / 2, CH + 0.09, CZ, M.metal);  // L rail
  b(g, 0.12, 0.18, CD + 0.1, CX + CW / 2, CH + 0.09, CZ, M.metal);  // R rail
  // Under-canopy warm light
  ptl(g, 0xfff5e0, 0.5, 10, CX, CH - 0.3, CZ);

  // Small step / ramp
  b(g, MN_W + 0.2, 0.12, 0.6, MN_CX, 0.06, HD + 0.5, M.conc);
}

/* ══════════════════════════════════════════════════════════════
   S7 — PARKING LOT (south of building)
══════════════════════════════════════════════════════════════ */
function buildParking(g) {
  const START_Z = HD + 1.5; // lz = 11.5, just south of building wall

  // Asphalt base (14m deep: lz 11.5 to 25.5, within 10-26)
  slab(g, 26, 13, 0, 0.05, START_Z + 6.5, M.asphalt);

  // Access road from gate (lz 23 to 26)
  slab(g, 7, 4.5, 0, 0.10, HD + 12.5, M.road);

  // ── Two rows of 5 parking stalls ──
  const STALL_W = 2.4, STALL_D = 4.2;
  const rowA_Z = START_Z + 1.8;  // lz ~13.3
  const rowB_Z = START_Z + 8.3;  // lz ~19.8

  for (let i = 0; i < 5; i++) {
    const sx = -6 + i * STALL_W;
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowA_Z, M.stripeW);
    slab(g, 0.08, STALL_D, sx - STALL_W / 2, 0.07, rowB_Z, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowA_Z - STALL_D / 2, M.stripeW);
    slab(g, STALL_W - 0.1, 0.08, sx, 0.07, rowB_Z - STALL_D / 2, M.stripeW);
  }
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowA_Z, M.stripeW);
  slab(g, 0.08, STALL_D, 6 + STALL_W / 2, 0.07, rowB_Z, M.stripeW);

  // Drive aisle dashes (between rows)
  for (let i = 0; i < 5; i++) {
    slab(g, 0.12, 1.6, -6 + i * 2.6, 0.07, rowA_Z + STALL_D / 2 + 1.0, M.stripeY);
  }

  // 3 lamp posts
  lampPost(g, -11, rowA_Z);
  lampPost(g,  11, rowA_Z);
  lampPost(g,   0, rowB_Z + 1.5);

  // Disabled bay
  slab(g, STALL_W - 0.1, STALL_D - 0.1, -6 + STALL_W / 2, 0.08, rowA_Z,
    lm(0x1144aa, { transparent: true, opacity: 0.45 }));
}

/* ══════════════════════════════════════════════════════════════
   S8 — GARDEN (east side of building)
══════════════════════════════════════════════════════════════ */
function buildGarden(g) {
  // Grass area east of building, lx 15-25, lz -8 to +8
  slab(g, 10, 16, HW + 5, 0.04, 0, M.grass);

  // Paved walking path
  slab(g, 1.0, 10, HW + 2, 0.07, 2, M.path);
  slab(g, 6, 1.0, HW + 5, 0.10, 7, M.path);

  // Trees
  tree(g, HW + 3, -4, 0.75);
  tree(g, HW + 7,  2, 0.85);
  tree(g, HW + 4,  6, 0.7);

  // Benches
  bench(g, HW + 2.5, -2, 0);
  bench(g, HW + 5.5,  5, -Math.PI / 6);

  // Flower bed
  b(g, 3.5, 0.15, 2.2, HW + 7.5, 0.14, -3, lm(0x7a5c3a));
  slab(g, 3.1, 1.9, HW + 7.5, 0.14, -3, lm(0x4a8830));

  // Garden lamp
  lampPost(g, HW + 4, 3, 5.5);
}

/* ══════════════════════════════════════════════════════════════
   S9 — NORTH SERVICE AREA (generator, dumpsters)
══════════════════════════════════════════════════════════════ */
function buildServiceArea(g) {
  // Service road
  slab(g, 10, 8, 0, 0.06, -(HD + 5), M.road);

  // Generator unit
  b(g, 2.5, 1.4, 1.6,  -8, 0.7, -(HD + 4), M.metal);
  b(g, 2.5, 0.1, 1.6,  -8, 1.45, -(HD + 4), M.darkTrim);
  // Ventilation slats
  for (let i = 0; i < 4; i++) {
    b(g, 2.4, 0.06, 0.04, -8, 0.5 + i * 0.25, -(HD + 3.2), M.trim);
  }

  // 2 dumpsters
  for (const [dx, c] of [[0, 0x1a5e1a], [2.4, 0x5e1a1a]]) {
    b(g, 2.0, 1.1, 1.0, 5 + dx, 0.55, -(HD + 4.5), lm(c));
    b(g, 2.0, 0.1, 1.0, 5 + dx, 1.1,  -(HD + 4.5), M.darkTrim); // lid
  }

  // Chain-link fence around service area
  b(g, 0.06, 1.6, 10, -14.0, 0.8, -(HD + 5), M.metal);  // west fence
  b(g, 10,   1.6, 0.06,  -9, 0.8, -(HD + 9.5), M.metal); // north fence
}

/* ══════════════════════════════════════════════════════════════
   S10 — PERIMETER WALL & GATE
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

  // Corner lamp posts
  lampPost(g, PX - 1, PZN + 1, 6);
  lampPost(g, PX - 1, PZS - 1, 6);
  lampPost(g, -(PX - 1), PZN + 1, 6);
  lampPost(g, -(PX - 1), PZS - 1, 6);

  // Security cameras at building corners
  for (const [cx, cz] of [[HW + 1, HD + 0.5], [HW + 1, -(HD + 0.5)], [-(HW + 1), HD + 0.5], [-(HW + 1), -(HD + 0.5)]]) {
    cyl(g, 0.04, 0.06, 0.5, 8, M.trim, cx, BH - 0.3, cz);
    b(g, 0.14, 0.08, 0.22, cx, BH - 0.22, cz + (cz > 0 ? 0.14 : -0.14), M.trim);
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
  _pb = []; // ← local reset — no cross-call accumulation

  const group = new THREE.Group();
  group.name = 'hospital';
  group.userData.sourceFile = 'client/hospital.js';

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

  /* ── Interaction zones (for game logic) ─────────────────── */
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
    '[HOSPITAL v2] Built at origin (%d, %d) — %d physics bodies, %d interaction zones',
    HOSPITAL_ORIGIN.x, HOSPITAL_ORIGIN.z, _pb.length, interactionZones.length
  );

  return { group, interactionZones };
}