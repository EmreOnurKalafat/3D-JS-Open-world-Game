// client/policeStation.js — Optimized Police Station Complex
// Physics ONLY on exterior shell + fence rails (~20 bodies)
//
// v3 — 8 improvements from TODOO/GÖREV: Polis Karakolu.md (revised)
//   R1: Full perimeter fence    R5: Deduplicate staircase railings
//   R2: Remove center pillar    R6: N/A
//   R3: Sign faces outward      R7: Larger helicopter
//   R4: Deduplicate furniture   R8: Custom concrete wall texture

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from './physics.js';
import { cityData } from './world.js';

export const POLICE_GRID_COL = 1;
export const POLICE_GRID_ROW = 5;
const GRID = 10, BLOCK = 60, ROAD = 12;
const CELL = BLOCK + ROAD;
const WH = (GRID / 2) * CELL;
const HALF = CELL / 2;
const COMPLEX_X = POLICE_GRID_COL * CELL - WH + HALF;
const COMPLEX_Z = POLICE_GRID_ROW * CELL - WH + HALF;

function wx(lx) { return COMPLEX_X + lx; }
function wz(lz) { return COMPLEX_Z + lz; }

// ═══════════════════════════════════════
//  LAMBERT MATERIALS
// ═══════════════════════════════════════

const wallMat   = new THREE.MeshLambertMaterial({ color: 0xd9d9d9 });
const floorMat  = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
const darkWall  = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
const trimMat   = new THREE.MeshLambertMaterial({ color: 0x222222 });
const accentMat = new THREE.MeshLambertMaterial({ color: 0x12355B });
const roofMat   = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });
const metalMat  = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const woodMat   = new THREE.MeshLambertMaterial({ color: 0x3d2817 });
const whiteLine = new THREE.MeshLambertMaterial({ color: 0xffffff });
const redLight  = new THREE.MeshLambertMaterial({ color: 0xff0000, emissive: 0xaa0000 });
const blueLight = new THREE.MeshLambertMaterial({ color: 0x0000ff, emissive: 0x0000aa });
const chalkMat  = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const padMat    = new THREE.MeshLambertMaterial({ color: 0x444444 });

const glassMat  = new THREE.MeshLambertMaterial({
  color: 0x88bbff, transparent: true, opacity: 0.35,
});
const mirrorMat  = new THREE.MeshLambertMaterial({ color: 0x222222 });
const emissiveMonitor = new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x051020 });
const emissiveYellow = new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0x555500 });
const flagMat   = new THREE.MeshLambertMaterial({ color: 0x1A3A6B, side: THREE.DoubleSide });
const wheelMat  = new THREE.MeshLambertMaterial({ color: 0x111111 });
const seatMat   = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
const heliBody  = new THREE.MeshLambertMaterial({ color: 0x1a3a5c });

// ═══════════════════════════════════════
//  SHARED GEOMETRY POOL
// ═══════════════════════════════════════
const geo = {
  box_1x1x1:     new THREE.BoxGeometry(1, 1, 1),
  cyl_1x1x8:     new THREE.CylinderGeometry(1, 1, 1, 8),
  cyl_1x1x12:    new THREE.CylinderGeometry(1, 1, 1, 12),
  plane_1x1:     new THREE.PlaneGeometry(1, 1),
  torusSmall:    new THREE.TorusGeometry(0.4, 0.08, 8, 16),
};

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════

/** Box with shared unit-cube geometry, optional STATIC cannon body */
function box(scene, addPhys, sx, sy, sz, lx, ly, lz, mat, mass = 0) {
  const m = new THREE.Mesh(geo.box_1x1x1, mat);
  m.scale.set(sx, sy, sz);
  m.position.set(wx(lx), ly, wz(lz));
  m.castShadow = true; m.receiveShadow = true;
  m.userData.sourceFile = 'client/policeStation.js';
  scene.add(m);

  if (addPhys) {
    const phys = getPhysicsWorld();
    const shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(wx(lx), ly, wz(lz));
    if (mass === 0) body.type = CANNON.Body.STATIC;
    phys.addBody(body);
    return body;
  }
  return null;
}

/** Visual-only mesh with shared geometry + optional scale */
function add(scene, g, mat, lx, ly, lz, ry, scale) {
  const m = new THREE.Mesh(g, mat);
  m.position.set(wx(lx), ly, wz(lz));
  if (ry) m.rotation.y = ry;
  if (scale) m.scale.set(scale.sx, scale.sy, scale.sz);
  m.castShadow = true; m.receiveShadow = true;
  m.userData.sourceFile = 'client/policeStation.js';
  scene.add(m);
  return m;
}

/** Scaled cylinder helper */
function addCyl(scene, rt, rb, h, segs, mat, lx, ly, lz) {
  const g = segs <= 8 ? geo.cyl_1x1x8 : geo.cyl_1x1x12;
  const m = new THREE.Mesh(g, mat);
  m.scale.set(rt * 2, h, rb * 2);
  m.position.set(wx(lx), ly, wz(lz));
  m.castShadow = true; m.receiveShadow = true;
  m.userData.sourceFile = 'client/policeStation.js';
  scene.add(m);
  return m;
}

/** Wall along X with door gaps */
function wallX(scene, addPhys, lx1, lx2, lz, gaps, ly, h, mat, thickness = 0.2) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lx1;
  for (const [gc, gw] of sorted) {
    const g1 = gc - gw / 2;
    const w = g1 - cur;
    if (w > 0.02) box(scene, addPhys, w, h, thickness, cur + w / 2, ly, lz, mat);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lx2 - cur;
  if (rem > 0.02) box(scene, addPhys, rem, h, thickness, cur + rem / 2, ly, lz, mat);
}

/** Wall along Z with door gaps */
function wallZ(scene, addPhys, lz1, lz2, lx, gaps, ly, h, mat, thickness = 0.2) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cur = lz1;
  for (const [gc, gw] of sorted) {
    const g1 = gc - gw / 2;
    const d = g1 - cur;
    if (d > 0.02) box(scene, addPhys, thickness, h, d, lx, ly, cur + d / 2, mat);
    cur = Math.max(cur, gc + gw / 2);
  }
  const rem = lz2 - cur;
  if (rem > 0.02) box(scene, addPhys, thickness, h, rem, lx, ly, cur + rem / 2, mat);
}

// ═══════════════════════════════════════
//  PROPS
// ═══════════════════════════════════════

/** Office chair (visual only) */
function buildChair(scene, lx, ly, lz, ry = 0) {
  // Seat
  add(scene, geo.box_1x1x1, seatMat, lx, ly + 0.45, lz, ry, { sx: 0.5, sy: 0.05, sz: 0.5 });
  // Backrest
  add(scene, geo.box_1x1x1, seatMat, lx, ly + 0.7, lz - 0.25, ry, { sx: 0.45, sy: 0.5, sz: 0.05 });
  // Pedestal
  addCyl(scene, 0.04, 0.04, 0.4, 8, metalMat, lx, ly + 0.2, lz);
  // Base (cross)
  add(scene, geo.box_1x1x1, metalMat, lx, ly + 0.05, lz, ry, { sx: 0.5, sy: 0.03, sz: 0.08 });
  add(scene, geo.box_1x1x1, metalMat, lx, ly + 0.05, lz, ry, { sx: 0.08, sy: 0.03, sz: 0.5 });
}

/** Detailed desk with chair */
function detailedDesk(scene, lx, ly, lz, facing) {
  const ry = facing === 'e' ? -Math.PI / 2 : facing === 'w' ? Math.PI / 2 : facing === 'n' ? Math.PI : 0;
  const dirX = facing === 'w' ? 1 : facing === 'e' ? -1 : 0;
  const dirZ = facing === 'n' ? 1 : facing === 's' ? -1 : 0;

  // Desktop
  add(scene, geo.box_1x1x1, woodMat, lx, ly + 0.75, lz, ry, { sx: 1.6, sy: 0.05, sz: 0.8 });

  // Legs (4 corners)
  for (const [dx, dz] of [[0.75, 0.35], [0.75, -0.35], [-0.75, 0.35], [-0.75, -0.35]]) {
    add(scene, geo.box_1x1x1, trimMat, lx + dx, ly + 0.375, lz + dz, ry, { sx: 0.05, sy: 0.75, sz: 0.05 });
  }

  // Monitor
  add(scene, geo.box_1x1x1, trimMat, lx + dirX * 0.15, ly + 0.95, lz + dirZ * 0.15, ry, { sx: 0.5, sy: 0.3, sz: 0.05 });
  add(scene, geo.box_1x1x1, emissiveMonitor, lx + dirX * 0.15, ly + 0.95, lz + dirZ * 0.15 + (dirZ === 0 ? 0.03 : dirZ * 0.03), ry, { sx: 0.48, sy: 0.28, sz: 0.01 });
  add(scene, geo.box_1x1x1, trimMat, lx + dirX * 0.15, ly + 0.825, lz + dirZ * 0.15, ry, { sx: 0.1, sy: 0.15, sz: 0.1 });

  // Keyboard
  add(scene, geo.box_1x1x1, trimMat, lx, ly + 0.77, lz, ry, { sx: 0.4, sy: 0.02, sz: 0.15 });

  // Drawer unit (right side)
  const cx = lx - dirX * 0.5, cz = lz - dirZ * 0.5;
  add(scene, geo.box_1x1x1, trimMat, cx, ly + 0.45, cz, ry, { sx: 0.5, sy: 0.08, sz: 0.5 });
  add(scene, geo.box_1x1x1, trimMat, cx - dirX * 0.2, ly + 0.75, cz - dirZ * 0.2, ry, { sx: 0.45, sy: 0.5, sz: 0.08 });
  addCyl(scene, 0.05, 0.05, 0.4, 8, metalMat, cx, ly + 0.2, cz);
  add(scene, geo.box_1x1x1, trimMat, cx, ly + 0.05, cz, ry, { sx: 0.6, sy: 0.05, sz: 0.6 });

  // Chair behind desk
  buildChair(scene, lx - dirX * 1.2, ly, lz - dirZ * 1.2, ry);
}

/** Filing cabinet with visible handles */
function detailedCabinet(scene, lx, ly, lz, ry = 0) {
  add(scene, geo.box_1x1x1, metalMat, lx, ly + 0.9, lz, ry, { sx: 0.9, sy: 1.8, sz: 0.5 });

  for (let i = 0; i < 4; i++) {
    // Drawer face
    add(scene, geo.box_1x1x1, trimMat, lx, ly + 0.3 + i * 0.45, lz + 0.26, ry, { sx: 0.8, sy: 0.4, sz: 0.02 });
    // Handle bar
    add(scene, geo.box_1x1x1, metalMat, lx, ly + 0.3 + i * 0.45, lz + 0.29, ry, { sx: 0.3, sy: 0.03, sz: 0.04 });
  }
}

/** Static police car prop */
function detailedPoliceCar(scene, lx, lz, ry) {
  const b1 = new THREE.Mesh(geo.box_1x1x1, wallMat);
  b1.scale.set(4.8, 0.8, 2.0);
  b1.position.set(wx(lx), 0.5, wz(lz)); b1.castShadow = true; b1.receiveShadow = true; scene.add(b1);

  const b2 = new THREE.Mesh(geo.box_1x1x1, trimMat);
  b2.scale.set(2.4, 0.6, 1.8);
  b2.position.set(wx(lx - 0.2), 1.2, wz(lz)); b2.castShadow = true; b2.receiveShadow = true; scene.add(b2);

  add(scene, geo.box_1x1x1, metalMat, lx - 0.2, 1.55, lz, ry, { sx: 0.1, sy: 0.1, sz: 1.6 });
  add(scene, geo.box_1x1x1, redLight, lx - 0.2, 1.55, lz - 0.5, ry, { sx: 0.3, sy: 0.15, sz: 0.5 });
  add(scene, geo.box_1x1x1, blueLight, lx - 0.2, 1.55, lz + 0.5, ry, { sx: 0.3, sy: 0.15, sz: 0.5 });

  for (const [dx, dz] of [[-1.4, 1.0], [1.4, 1.0], [-1.4, -1.0], [1.4, -1.0]]) {
    const w = new THREE.Mesh(geo.cyl_1x1x12, wheelMat);
    w.scale.set(0.7, 0.25, 0.7);
    w.rotation.x = Math.PI / 2;
    w.position.set(wx(lx + dx), 0.35, wz(lz + dz));
    if (ry) w.rotation.y = ry;
    w.castShadow = true;
    scene.add(w);
  }
}

/** Static police helicopter (R7) — scaled 1.6× */
function buildHelicopter(scene, lx, ly, lz) {
  const hg = new THREE.Group();
  hg.position.set(wx(lx), ly, wz(lz));
  hg.userData.sourceFile = 'client/policeStation.js';
  hg.name = 'police_helicopter';

  // Fuselage
  const body = new THREE.Mesh(geo.box_1x1x1, heliBody);
  body.scale.set(4.8, 1.92, 2.24);
  body.position.set(0, 1.3, 0);
  body.castShadow = true; body.receiveShadow = true;
  hg.add(body);

  // Cockpit nose
  const nose = new THREE.Mesh(geo.box_1x1x1, glassMat);
  nose.scale.set(1.92, 1.44, 1.92);
  nose.position.set(2.9, 1.45, 0);
  hg.add(nose);

  // Tail boom
  const tail = new THREE.Mesh(geo.box_1x1x1, heliBody);
  tail.scale.set(4.8, 0.64, 0.64);
  tail.position.set(-4.5, 1.0, 0);
  tail.castShadow = true;
  hg.add(tail);

  // Tail fin
  const fin = new THREE.Mesh(geo.box_1x1x1, heliBody);
  fin.scale.set(0.16, 1.28, 0.96);
  fin.position.set(-6.7, 1.45, 0);
  hg.add(fin);

  // Main rotor
  const rotor = new THREE.Mesh(geo.box_1x1x1, trimMat);
  rotor.scale.set(0.24, 0.08, 11.2);
  rotor.position.set(0, 2.4, 0);
  rotor.castShadow = true;
  hg.add(rotor);

  // Rotor hub
  const hub = new THREE.Mesh(geo.cyl_1x1x8, metalMat);
  hub.scale.set(0.32, 0.24, 0.32);
  hub.position.set(0, 2.4, 0);
  hg.add(hub);

  // Tail rotor
  const tRotor = new THREE.Mesh(geo.box_1x1x1, trimMat);
  tRotor.scale.set(0.06, 1.3, 0.06);
  tRotor.position.set(-6.7, 1.45, 0.56);
  hg.add(tRotor);

  // Skids
  for (const sx of [-0.8, 0.8]) {
    const skid = new THREE.Mesh(geo.box_1x1x1, metalMat);
    skid.scale.set(5.1, 0.13, 0.13);
    skid.position.set(0, 0.24, sx);
    skid.castShadow = true;
    hg.add(skid);

    // Skid risers
    for (const rz of [-1.6, 1.6]) {
      addCylInGroup(hg, 0.05, 0.05, 0.8, 8, metalMat, rz, 0.64, sx);
    }
  }

  scene.add(hg);
  return hg;
}

function addCylInGroup(group, rt, rb, h, segs, mat, lx, ly, lz) {
  const g = segs <= 8 ? geo.cyl_1x1x8 : geo.cyl_1x1x12;
  const m = new THREE.Mesh(g, mat);
  m.scale.set(rt * 2, h, rb * 2);
  m.position.set(lx, ly, lz);
  m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  return m;
}

/** Creates a CanvasTexture with sign text (R3) */
function makeSignTexture(text, bgColor, fgColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 96);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 88);

  // Text
  ctx.fillStyle = fgColor;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/** Creates reinforced concrete wall texture (R8) */
function makePoliceWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base grey concrete
  ctx.fillStyle = '#6e6e6e';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise for concrete texture
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i] += n; data[i + 1] += n; data[i + 2] += n;
  }
  ctx.putImageData(imageData, 0, 0);

  // Reinforced concrete panel grid (large panels)
  const panelSize = 64;
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += panelSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y <= 512; y += panelSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  // Subtle horizontal reinforcement lines within each panel
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const bx = px * panelSize, by = py * panelSize;
      for (let ry = 16; ry < panelSize; ry += 20) {
        ctx.beginPath();
        ctx.moveTo(bx + 4, by + ry);
        ctx.lineTo(bx + panelSize - 4, by + ry);
        ctx.stroke();
      }
    }
  }

  // Darker edge band at top
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, 512, 8);
  ctx.fillRect(0, 504, 512, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

// ═══════════════════════════════════════
//  BUILD GENERATOR
// ═══════════════════════════════════════

export function buildPoliceStationComplex(scene, occ) {
  console.log('[POLICE] Constructing Police Department v2...');

  const GH = 4.5, TH = 9.0;
  const uY = 4.5;

  const iX1 = -13.5, iX2 = 13.5;
  const iZ1 = -12.5, iZ2 = 4.5;

  const WL = -4.5, WR = 4.5;
  const DIV = -2.5;

  const door12 = 1.2;
  const door20 = 2.0;

  const GF_DIV_GAPS = [[0, door20], [-8.5, door12], [8.5, door12]];
  const GF_WL_GAPS = [[-8.5, door12], [1.0, door12]];
  const GF_WR_GAPS = [[-8.5, door12], [1.0, door12]];
  const UF_DIV_GAPS = [[0, door20], [-8.5, door12], [8.5, door12]];
  const UF_WL_GAPS = [[-8.5, door12], [1.0, door12]];
  const UF_WR_GAPS = [[-8.5, door12], [1.0, door12]];

  // ─── R8: CUSTOM CONCRETE WALL TEXTURE ───
  const wallTex = makePoliceWallTexture();
  const facadeMat = new THREE.MeshLambertMaterial({ map: wallTex });

  // ─── 1. FOUNDATION & GROUND FLOOR ───
  box(scene, true, 30.0, 0.4, 20.0, 0, 0.2, -4, darkWall);

  const fl = new THREE.Mesh(geo.plane_1x1, floorMat);
  fl.scale.set(28.0, 18.0, 1);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(wx(0), 0.41, wz(-4));
  fl.receiveShadow = true;
  scene.add(fl);

  // ─── 2. EXTERIOR ARCHITECTURE ───

  // Solid exterior walls WITH facade texture (R8)
  // North back wall — facaded
  const northWall = new THREE.Mesh(geo.box_1x1x1, facadeMat);
  northWall.scale.set(28.0, TH, 0.4);
  northWall.position.set(wx(0), TH / 2, wz(iZ2 + 0.2));
  northWall.castShadow = true; northWall.receiveShadow = true;
  scene.add(northWall);
  // Physics for north wall
  {
    const phys = getPhysicsWorld();
    const shape = new CANNON.Box(new CANNON.Vec3(14.0, TH / 2, 0.2));
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(shape);
    body.position.set(wx(0), TH / 2, wz(iZ2 + 0.2));
    phys.addBody(body);
  }

  // East + West walls — with facade
  box(scene, true, 0.4, TH, 18.0, iX2 + 0.2, TH / 2, -4, facadeMat);  // East
  box(scene, true, 0.4, TH, 18.0, iX1 - 0.2, TH / 2, -4, facadeMat);  // West

  // Front structural pillars (skip entrance at px=0 — R2: remove "stun")
  for (let px = -13.5; px <= 13.5; px += 4.5) {
    if (px === 0) continue; // R2: remove center "stun" pillar
    box(scene, true, 0.6, TH, 0.6, px, TH / 2, iZ1, trimMat);
  }
  box(scene, true, 28.0, 0.6, 0.6, 0, uY, iZ1, trimMat);

  // ─── R2: MAIN ENTRANCE DOOR ───
  // Glass panels skip the wider entrance area
  for (let px = -11.25; px <= 11.25; px += 4.5) {
    if (Math.abs(px) < 3.5) continue; // R2: wider entrance gap (was 2.0)

    box(scene, false, 3.9, 1.0, 0.4, px, 0.9, iZ1, darkWall);
    add(scene, geo.box_1x1x1, glassMat, px, 2.75, iZ1, 0, { sx: 3.9, sy: 3.5, sz: 0.1 });

    box(scene, false, 3.9, 0.8, 0.4, px, uY + 0.7, iZ1, darkWall);
    add(scene, geo.box_1x1x1, glassMat, px, uY + 2.95, iZ1, 0, { sx: 3.9, sy: 3.7, sz: 0.1 });
  }

  // Door frame pillars (on either side of entrance, visual only)
  for (const dx of [-3.0, 3.0]) {
    box(scene, false, 0.4, GH, 0.4, dx, GH / 2, iZ1, trimMat);
    box(scene, false, 0.4, GH, 0.4, dx, uY + GH / 2, iZ1, trimMat);
  }

  // Door top frame
  box(scene, false, 6.5, 0.15, 0.3, 0, GH + 0.075, iZ1, trimMat);

  // Main entrance overhang
  box(scene, false, 8.0, 0.5, 3.0, 0, 4.25, iZ1 - 1.5, trimMat);

  // ─── R3: POLICE STATION SIGN (plane facing outward) ───
  box(scene, false, 8.2, 1.2, 0.4, 0, 5.25, iZ1 + 0.15, accentMat);
  // Glass on sign block (upper floor, behind sign)
  add(scene, geo.box_1x1x1, glassMat, 0, uY + 2.95, iZ1, 0, { sx: 7.2, sy: 3.7, sz: 0.1 });
  const signTex = makeSignTexture('POLICE STATION', '#0a1a3a', '#ffffff');
  const signMesh = new THREE.Mesh(geo.plane_1x1, new THREE.MeshLambertMaterial({ map: signTex, side: THREE.DoubleSide }));
  signMesh.scale.set(7.0, 0.8, 1);
  signMesh.rotation.y = Math.PI; // face south toward street
  signMesh.position.set(wx(0), 5.25, wz(iZ1 - 0.24));
  scene.add(signMesh);

  // ─── 3. ROOF & UPPER FLOOR SLAB ───
  box(scene, true, 29.0, 0.5, 19.0, 0, TH + 0.25, -4, roofMat);

  // Parapets + HVAC
  box(scene, false, 29.0, 1.0, 0.2, 0, TH + 1.0, iZ2 + 0.4, trimMat);
  box(scene, false, 29.0, 1.0, 0.2, 0, TH + 1.0, iZ1 - 0.4, trimMat);
  box(scene, false, 3.0, 1.5, 2.0, -5, TH + 1.25, 0, metalMat);
  box(scene, false, 2.0, 1.2, 2.0, 6, TH + 1.1, -5, metalMat);

  // Upper floor slab — 4 parts around stair hole
  const ufH = 0.2;
  const holeX1 = -4.5, holeX2 = -1.5, holeZ1 = -7.0, holeZ2 = -2.5;
  box(scene, true, 27.0, ufH, holeZ1 - iZ1, 0, uY, (iZ1 + holeZ1) / 2, floorMat);
  box(scene, true, 27.0, ufH, iZ2 - holeZ2, 0, uY, (holeZ2 + iZ2) / 2, floorMat);
  box(scene, true, holeX1 - iX1, ufH, holeZ2 - holeZ1, (iX1 + holeX1) / 2, uY, (holeZ1 + holeZ2) / 2, floorMat);
  box(scene, true, iX2 - holeX2, ufH, holeZ2 - holeZ1, (holeX2 + iX2) / 2, uY, (holeZ1 + holeZ2) / 2, floorMat);

  // ─── 4. INTERIOR WALLS ───
  wallX(scene, false, iX1, iX2, DIV, GF_DIV_GAPS, GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WL, GF_WL_GAPS, GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WR, GF_WR_GAPS, GH / 2, GH, darkWall);
  wallX(scene, false, iX1, iX2, DIV, UF_DIV_GAPS, uY + GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WL, UF_WL_GAPS, uY + GH / 2, GH, darkWall);
  wallZ(scene, false, iZ1, iZ2, WR, UF_WR_GAPS, uY + GH / 2, GH, darkWall);

  // ─── 5. STAIRCASE (R6: fixed railings) ───
  const stepsPerFlight = 12;
  const stepRise = uY / (stepsPerFlight * 2);
  const stepTread = 0.28;
  const stepW = 1.2;

  // Flight 1: goes North
  const f1X = -2.2;
  for (let i = 0; i < stepsPerFlight; i++) {
    box(scene, false, stepW, stepRise, stepTread, f1X, i * stepRise + stepRise / 2, -6.5 + i * stepTread, trimMat);
  }

  // Landing
  const landingY = stepsPerFlight * stepRise;
  box(scene, false, 2.8, 0.2, 1.2, -3.0, landingY - 0.1, -2.8, trimMat);

  // Flight 2: goes South
  const f2X = -3.8;
  for (let i = 0; i < stepsPerFlight; i++) {
    box(scene, false, stepW, stepRise, stepTread, f2X, landingY + i * stepRise + stepRise / 2, -3.1 - i * stepTread, trimMat);
  }

  // ─── R6: PROPER STAIRCASE RAILINGS ───
  // Flight 1 handrail + posts (every 2nd step)
  const f1RailZ1 = -6.5, f1RailZn = -6.5 + (stepsPerFlight - 1) * stepTread;
  const f1RailX = f1X - stepW / 2 + 0.1;
  // Top handrail (continuous bar)
  box(scene, false, 0.04, 0.04, f1RailZn - f1RailZ1 + 0.3, f1RailX, stepsPerFlight * stepRise + 0.55,
    (f1RailZ1 + f1RailZn) / 2, metalMat);
  // Posts every 2 steps
  for (let i = 0; i <= stepsPerFlight; i += 2) {
    addCyl(scene, 0.02, 0.02, 1.0, 8, metalMat, f1RailX, i * stepRise + 0.5, -6.5 + i * stepTread);
  }

  // Flight 2 handrail + posts
  const f2RailX = f2X + stepW / 2 - 0.1;
  const f2RailZ1 = -3.1 - (stepsPerFlight - 1) * stepTread, f2RailZ2 = -3.1;
  box(scene, false, 0.04, 0.04, f2RailZ2 - f2RailZ1 + 0.3,
    f2RailX, landingY + stepsPerFlight * stepRise + 0.55,
    (f2RailZ1 + f2RailZ2) / 2, metalMat);
  for (let i = 0; i <= stepsPerFlight; i += 2) {
    addCyl(scene, 0.02, 0.02, 1.0, 8, metalMat, f2RailX,
      landingY + i * stepRise + 0.5, -3.1 - i * stepTread);
  }

  // Landing railings (short posts at landing edges)
  for (const lx of [-3.0, -1.5]) {
    addCyl(scene, 0.02, 0.02, 1.0, 8, metalMat, lx, landingY + 0.5, -2.8);
  }
  // Landing top bar
  box(scene, false, 1.6, 0.04, 0.04, -2.25, landingY + 1.0, -2.8, metalMat);

  // ─── 6. GROUND FLOOR DECOR (R4: improved furniture) ───

  // LOBBY
  box(scene, false, 4.0, 1.1, 0.8, 1.5, 0.95, -8.5, trimMat);     // front desk
  box(scene, false, 4.2, 0.1, 0.9, 1.5, 1.5, -8.5, woodMat);       // desk top
  for (const dx of [-0.8, 0.8]) box(scene, false, 0.1, 2.5, 0.6, dx, 1.65, -11.5, metalMat); // pillars
  box(scene, false, 1.7, 0.1, 0.6, 0, 2.95, -11.5, metalMat);       // sign board

  // Lobby bench
  box(scene, false, 3.0, 0.15, 0.6, -6, 0.5, -11.0, woodMat);
  for (const bx of [-7, -5]) box(scene, false, 0.1, 0.5, 0.1, bx, 0.3, -11.0, metalMat);
  // Water cooler
  addCyl(scene, 0.15, 0.15, 1.0, 8, glassMat, -11, 0.5, -11.0);
  add(scene, geo.box_1x1x1, wallMat, -11, 1.1, -11.0, 0, { sx: 0.4, sy: 0.3, sz: 0.4 });

  // WEST OFFICE
  detailedDesk(scene, -10, 0, -7.5, 's');
  detailedCabinet(scene, -13.0, 0, -11.0, Math.PI / 2);
  detailedCabinet(scene, -13.0, 0, -10.0, Math.PI / 2);
  // Bulletin board on west wall
  add(scene, geo.box_1x1x1, chalkMat, iX1 + 0.1, 1.8, -8.0, Math.PI / 2, { sx: 0.02, sy: 1.2, sz: 2.0 });

  // EAST OFFICE
  detailedDesk(scene, 10, 0, -7.5, 's');
  // Meeting table with 4 chairs (one per side, facing table)
  add(scene, geo.box_1x1x1, woodMat, 10, 0.8, -3.5, 0, { sx: 2.5, sy: 0.1, sz: 1.2 });
  for (const dx of [-1.1, 1.1]) for (const dz of [-0.4, 0.4]) box(scene, false, 0.05, 0.75, 0.05, 10 + dx, 0.4, -3.5 + dz, trimMat);
  // North side — faces south toward table
  buildChair(scene, 10, 0, -2.5, 0);
  // South side — faces north toward table
  buildChair(scene, 10, 0, -4.5, Math.PI);
  // East side — faces west toward table
  buildChair(scene, 11.7, 0, -3.5, Math.PI / 2);
  // West side — faces east toward table
  buildChair(scene, 8.3, 0, -3.5, -Math.PI / 2);

  // INTERROGATION
  const mir = new THREE.Mesh(geo.plane_1x1, mirrorMat);
  mir.scale.set(2.4, 1.5, 1);
  mir.position.set(wx(WL - 0.11), 1.6, wz(1.0));
  mir.rotation.y = Math.PI / 2;
  scene.add(mir);
  box(scene, false, 2.0, 0.1, 1.0, -9, 0.8, 1.0, metalMat);        // table
  box(scene, false, 0.1, 0.7, 0.1, -9, 0.4, 1.0, trimMat);          // table leg
  // South side — faces north toward table
  buildChair(scene, -9, 0, -0.2, Math.PI);
  // North side — faces south toward table
  buildChair(scene, -9, 0, 2.2, 0);

  // ─── R5: CELL BLOCK ───
  // Central divider walls
  for (const cx of [-1.5, 1.5]) box(scene, false, 0.2, GH, 7.0, cx, GH / 2, 1.0, darkWall);

  // Cell bars (front, at DIV)
  const barMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const cellEdges = [-4.4, -1.6, -1.4, 1.4, 1.6, 4.4];
  for (let ci = 0; ci < 3; ci++) {
    const cx1 = cellEdges[ci * 2], cx2 = cellEdges[ci * 2 + 1];
    const cx = (cx1 + cx2) / 2;

    for (let bx = cx1; bx <= cx2; bx += 0.2) addCyl(scene, 0.015, 0.015, GH, 8, barMat, bx, GH / 2, DIV);
    add(scene, geo.box_1x1x1, barMat, cx, 1.0, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });
    add(scene, geo.box_1x1x1, barMat, cx, 2.5, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });

    // Beds in cells
    add(scene, geo.box_1x1x1, barMat, cx1 + 0.5, 0.5, iZ2 - 1.2, 0, { sx: 1.0, sy: 0.05, sz: 2.0 });
    // Pillow
    addCyl(scene, 0.2, 0.2, 0.4, 8, barMat, cx2 - 0.4, 0.4, iZ2 - 0.4);
    addCyl(scene, 0.2, 0.2, 0.5, 8, barMat, cx2 - 0.4, 0.7, iZ2 - 0.6);
  }

  // R5: LEFT CELL BLOCK WALL (along WL at z=DIV..iZ2)
  // Solid wall with small barred window
  wallZ(scene, false, DIV, iZ2, WL - 0.2, [], GH / 2, GH, darkWall);
  // Small barred window cutout in the left wall (visual bars)
  const lWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, geo.box_1x1x1, barMat, WL, wy, lWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  // R5: RIGHT CELL BLOCK WALL (along WR at z=DIV..iZ2)
  wallZ(scene, false, DIV, iZ2, WR + 0.2, [], GH / 2, GH, darkWall);
  const rWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, geo.box_1x1x1, barMat, WR, wy, rWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  // ─── ARMORY ───
  detailedCabinet(scene, 13.0, 0, -1.0, -Math.PI / 2);
  for (let wy = 1.0; wy <= 2.5; wy += 0.7) {
    add(scene, geo.box_1x1x1, metalMat, 9.0, wy, iZ2 - 0.2, 0, { sx: 4.0, sy: 0.05, sz: 0.3 });
    for (let gx = 7.5; gx <= 10.5; gx += 0.6) add(scene, geo.box_1x1x1, trimMat, gx, wy + 0.25, iZ2 - 0.2, 0, { sx: 0.05, sy: 0.5, sz: 0.15 });
  }
  const torus = new THREE.Mesh(geo.torusSmall, emissiveYellow);
  torus.position.set(wx(9), 1.5, wz(DIV + 2.0));
  torus.userData.interactionZone = 'armory_pickup';
  torus.userData.tag = 'armory_pickup';
  scene.add(torus);

  // ─── 7. UPPER FLOOR DECOR ───

  // Captain's Office
  detailedDesk(scene, 0, uY, -8.0, 's');
  detailedCabinet(scene, 3.5, uY, -12.0);
  addCyl(scene, 0.02, 0.02, 2.5, 8, metalMat, -3.5, uY + 1.25, -12.0);
  const flag = new THREE.Mesh(geo.plane_1x1, flagMat);
  flag.scale.set(0.6, 0.4, 1);
  flag.position.set(wx(-3.2), uY + 2.0, wz(-12.0));
  scene.add(flag);

  // Briefing Room
  add(scene, geo.box_1x1x1, woodMat, -9.0, uY + 0.8, -8.0, 0, { sx: 4.0, sy: 0.1, sz: 1.6 });
  for (const dx of [-1.8, 1.8]) for (const dz of [-0.6, 0.6]) box(scene, false, 0.1, 0.75, 0.1, -9.0 + dx, uY + 0.4, -8.0 + dz, trimMat);
  add(scene, geo.box_1x1x1, chalkMat, -9.0, uY + 2.0, -12.4, 0, { sx: 3.0, sy: 1.5, sz: 0.05 });
  // Chairs for briefing table
  // South side — faces north toward table
  for (const [cx, cz] of [[-10.5, -9.5], [-7.5, -9.5]]) { buildChair(scene, cx, uY, cz, Math.PI); }

  // Detectives Open Area (4 desks)
  detailedDesk(scene, 8, uY, -10.0, 's');
  detailedDesk(scene, 11, uY, -10.0, 's');
  detailedDesk(scene, 8, uY, -6.0, 's');
  detailedDesk(scene, 11, uY, -6.0, 's');

  // ─── 8. EXTERIOR GROUNDS ───

  // Parking lot
  box(scene, false, 30.0, 0.1, 10.0, 0, 0.05, -18, roofMat);
  for (const lxP of [-8, -4, 4, 8]) {
    const line = new THREE.Mesh(geo.plane_1x1, whiteLine);
    line.scale.set(0.15, 6.0, 1);
    line.rotation.x = -Math.PI / 2;
    line.position.set(wx(lxP), 0.11, wz(-17));
    scene.add(line);
  }

  detailedPoliceCar(scene, -6, -17, 0);
  detailedPoliceCar(scene, 6, -17, 0);

  // Street Lamps
  for (const lxL of [-14, 14]) {
    addCyl(scene, 0.1, 0.15, 7.0, 12, trimMat, lxL, 3.5, -15);
    add(scene, geo.box_1x1x1, trimMat, lxL + (lxL > 0 ? -0.6 : 0.6), 6.9, -15, 0, { sx: 1.5, sy: 0.1, sz: 0.3 });
    const lt = new THREE.PointLight(0xfff5e6, 0.4, 20);
    lt.position.set(wx(lxL + (lxL > 0 ? -1.0 : 1.0)), 6.8, wz(-15));
    lt.castShadow = false;
    scene.add(lt);
    cityData.buildingLights.push(lt);
  }

  // ─── R7: HELIPAD + HELICOPTER ───
  const heliPadZ = 20;
  // Pad base
  box(scene, false, 10.0, 0.15, 10.0, 0, 0.075, heliPadZ, padMat);
  // Pad edge stripes
  for (const s of [-1, 1]) {
    box(scene, false, 10.0, 0.01, 0.3, 0, 0.16, heliPadZ + s * 5.0, whiteLine);
    box(scene, false, 0.3, 0.01, 10.0, s * 5.0, 0.16, heliPadZ, whiteLine);
  }
  // "H" marking (made from thin boxes)
  box(scene, false, 0.3, 0.01, 4.0, -1.2, 0.16, heliPadZ, whiteLine);  // left vertical
  box(scene, false, 0.3, 0.01, 4.0, 1.2, 0.16, heliPadZ, whiteLine);   // right vertical
  box(scene, false, 2.4, 0.01, 0.3, 0, 0.16, heliPadZ, whiteLine);      // crossbar

  // Helicopter
  buildHelicopter(scene, 0, 0.25, 14.5);

  // ─── R1: FULL PERIMETER FENCE ───
  // Zone is 58×58 — fence at ±27 wraps the entire compound
  const F_NORTH = 27, F_SOUTH = -27;
  const F_EAST = 27, F_WEST = -27;
  const FH = 3.0;
  const gateX1 = -3, gateX2 = 3;

  function fenceRun(scene, addPhys, axis, fixedCoord, start, end) {
    const len = end - start;
    const step = 1.0;
    const mid = (start + end) / 2;

    // Base rail
    if (axis === 'x') {
      box(scene, addPhys, len + 0.3, 0.15, 0.15, mid, 0.5, fixedCoord, darkWall, 0);
    } else {
      box(scene, addPhys, 0.15, 0.15, len + 0.3, fixedCoord, 0.5, mid, darkWall, 0);
    }

    // Posts
    for (let p = start; p <= end + 0.01; p += step) {
      if (axis === 'x') {
        addCyl(scene, 0.03, 0.03, FH, 8, metalMat, p, FH / 2 + 0.1, fixedCoord);
      } else {
        addCyl(scene, 0.03, 0.03, FH, 8, metalMat, fixedCoord, FH / 2 + 0.1, p);
      }
    }

    // Horizontal rails (top + middle)
    for (const rh of [1.0, 3.0]) {
      if (axis === 'x') {
        box(scene, false, len + 0.3, 0.04, 0.04, mid, rh, fixedCoord, metalMat);
      } else {
        box(scene, false, 0.04, 0.04, len + 0.3, fixedCoord, rh, mid, metalMat);
      }
    }
  }

  // Front fence (SOUTH, z=F_SOUTH) — split at gate, no rail across entrance
  fenceRun(scene, true, 'x', F_SOUTH, F_WEST, gateX1);
  fenceRun(scene, true, 'x', F_SOUTH, gateX2, F_EAST);
  // Gate posts
  for (const gx of [gateX1, gateX2]) {
    addCyl(scene, 0.04, 0.04, FH + 0.4, 8, metalMat, gx, (FH + 0.4) / 2, F_SOUTH);
  }

  // Back fence (NORTH, z=F_NORTH)
  fenceRun(scene, true, 'x', F_NORTH, F_WEST, F_EAST);

  // East fence (x=F_EAST)
  fenceRun(scene, true, 'z', F_EAST, F_SOUTH, F_NORTH);

  // West fence (x=F_WEST)
  fenceRun(scene, true, 'z', F_WEST, F_SOUTH, F_NORTH);

  // ─── FINALIZE ───
  occ.fill(COMPLEX_X, COMPLEX_Z, 58, 58, 2);
  cityData.buildings.push({
    position: { x: COMPLEX_X, y: 0, z: COMPLEX_Z },
    body: null, w: 28, h: TH, d: 18,
    type: 'police_station_complex',
  });

  // R8: Register custom wall texture
  cityData._policeFacade = { texture: wallTex };

  console.log('[POLICE] v3 Ready. Fence, door (no center pillar), outward-facing sign, deduplicated furniture/railings, larger helicopter, custom concrete texture.');
}
