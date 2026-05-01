// client/zones/zone_police.js — Optimized Police Station Complex
// Physics ONLY on exterior shell + fence rails (~20 bodies)
//
// v3 — 8 improvements (revised)
//   R1: Full perimeter fence    R5: Deduplicate staircase railings
//   R2: Remove center pillar    R6: N/A
//   R3: Sign faces outward      R7: Larger helicopter
//   R4: Deduplicate furniture   R8: Custom concrete wall texture

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../core/physicsManager.js';
import { cityData } from './world.js';
import { GEO, MAT, boxMesh, cylMesh } from '../../assets/shared/resources.js';
import { createSandalye } from '../../assets/prefabs/props/sandalye.js';
import { createMasa } from '../../assets/prefabs/props/masa.js';
import { createDolap } from '../../assets/prefabs/props/dolap.js';
import { createSuSebili } from '../../assets/prefabs/props/suSebili.js';
import { createBayrak } from '../../assets/prefabs/props/bayrak.js';
import { createHucreYatagi } from '../../assets/prefabs/props/hucreYatagi.js';
import { createToplantiMasasi } from '../../assets/prefabs/props/toplantiMasasi.js';
import { createSokakLambasi } from '../../assets/prefabs/structures/sokakLambasi.js';
import { createPolisArabasi } from '../../assets/prefabs/vehicles/polisArabasi.js';
import { createHelikopter } from '../../assets/prefabs/vehicles/helikopter.js';
import { createHelipad } from '../../assets/prefabs/structures/helipad.js';
import { createMerdiven } from '../../assets/prefabs/structures/merdiven.js';
import { createCitFenceRun } from '../../assets/prefabs/structures/cit.js';

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
//  MATERIALS & GEOMETRIES → resources.js
// ═══════════════════════════════════════
// Local aliases for brevity (all sourced from MAT/GEO in resources.js)
const { WALL:wallMat, FLOOR:floorMat, DARK_WALL:darkWall, TRIM:trimMat,
        ACCENT:accentMat, ROOF:roofMat, METAL:metalMat, WOOD:woodMat,
        WHITE:whiteLine, CHALK:chalkMat, GLASS:glassMat,
        MIRROR:mirrorMat, YELLOW_EMISSIVE:emissiveYellow,
        BAR_METAL:barMat } = MAT;

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════

/** Box with shared unit-cube geometry, optional STATIC cannon body */
function box(scene, addPhys, sx, sy, sz, lx, ly, lz, mat, mass = 0) {
  const m = boxMesh(sx, sy, sz, mat);
  m.position.set(wx(lx), ly, wz(lz));
  m.userData.sourceFile = 'client/zones/zone_police.js';
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
  m.userData.sourceFile = 'client/zones/zone_police.js';
  scene.add(m);
  return m;
}

/** Scaled cylinder helper */
function addCyl(scene, rt, rb, h, segs, mat, lx, ly, lz) {
  const m = cylMesh(rt, rb, h, segs, mat);
  m.position.set(wx(lx), ly, wz(lz));
  m.userData.sourceFile = 'client/zones/zone_police.js';
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
//  PROPS (prefabs in assets/prefabs/)
// ═══════════════════════════════════════

// buildChair → createSandalye() from assets/prefabs/sandalye.js
// detailedDesk → createMasa() from assets/prefabs/masa.js

/** Place a prefab chair at world position */
function placeChair(scene, lx, ly, lz, ry = 0) {
  const c = createSandalye();
  c.position.set(wx(lx), ly, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place a prefab desk (includes chair) at world position.
 *  facing: 's'=south(default), 'n'=north, 'e'=east, 'w'=west */
function placeDesk(scene, lx, ly, lz, facing) {
  const ry = facing === 'e' ? -Math.PI / 2 : facing === 'w' ? Math.PI / 2 : facing === 'n' ? Math.PI : 0;
  const d = createMasa();
  d.position.set(wx(lx), ly, wz(lz));
  d.rotation.y = ry;
  scene.add(d);
}

/** Place filing cabinet prefab */
function placeDolap(scene, lx, ly, lz, ry = 0) {
  const c = createDolap();
  c.position.set(wx(lx), ly, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place police car prefab */
function placePolisArabasi(scene, lx, lz, ry) {
  const c = createPolisArabasi();
  c.position.set(wx(lx), 0, wz(lz));
  c.rotation.y = ry;
  scene.add(c);
}

/** Place helicopter prefab */
function placeHelikopter(scene, lx, ly, lz) {
  const h = createHelikopter();
  h.position.set(wx(lx), ly, wz(lz));
  h.name = 'police_helicopter';
  scene.add(h);
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

  const fl = new THREE.Mesh(GEO.PLANE_1, floorMat);
  fl.scale.set(28.0, 18.0, 1);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(wx(0), 0.41, wz(-4));
  fl.receiveShadow = true;
  scene.add(fl);

  // ─── 2. EXTERIOR ARCHITECTURE ───

  // Solid exterior walls WITH facade texture (R8)
  // North back wall — facaded
  const northWall = new THREE.Mesh(GEO.BOX_1, facadeMat);
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
    add(scene, GEO.BOX_1, glassMat, px, 2.75, iZ1, 0, { sx: 3.9, sy: 3.5, sz: 0.1 });

    box(scene, false, 3.9, 0.8, 0.4, px, uY + 0.7, iZ1, darkWall);
    add(scene, GEO.BOX_1, glassMat, px, uY + 2.95, iZ1, 0, { sx: 3.9, sy: 3.7, sz: 0.1 });
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
  add(scene, GEO.BOX_1, glassMat, 0, uY + 2.95, iZ1, 0, { sx: 7.2, sy: 3.7, sz: 0.1 });
  const signTex = makeSignTexture('POLICE STATION', '#0a1a3a', '#ffffff');
  const signMesh = new THREE.Mesh(GEO.PLANE_1, new THREE.MeshLambertMaterial({ map: signTex, side: THREE.DoubleSide }));
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

  // ─── 5. STAIRCASE ───
  const stair = createMerdiven({ totalHeight: uY });
  stair.position.set(wx(0), 0, wz(0));
  scene.add(stair);

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
  const cooler = createSuSebili();
  cooler.position.set(wx(-11), 0, wz(-11.0));
  scene.add(cooler);

  // WEST OFFICE
  placeDesk(scene, -10, 0, -7.5, 's');
  placeDolap(scene, -13.0, 0, -11.0, Math.PI / 2);
  placeDolap(scene, -13.0, 0, -10.0, Math.PI / 2);
  // Bulletin board on west wall
  add(scene, GEO.BOX_1, chalkMat, iX1 + 0.1, 1.8, -8.0, Math.PI / 2, { sx: 0.02, sy: 1.2, sz: 2.0 });

  // EAST OFFICE
  placeDesk(scene, 10, 0, -7.5, 's');
  // Meeting table with 4 chairs (one per side, facing table)
  const eTable = createToplantiMasasi();
  eTable.position.set(wx(10), 0, wz(-3.5));
  scene.add(eTable);
  // North side — faces south toward table
  placeChair(scene, 10, 0, -2.5, 0);
  // South side — faces north toward table
  placeChair(scene, 10, 0, -4.5, Math.PI);
  // East side — faces west toward table
  placeChair(scene, 11.7, 0, -3.5, Math.PI / 2);
  // West side — faces east toward table
  placeChair(scene, 8.3, 0, -3.5, -Math.PI / 2);

  // INTERROGATION
  const mir = new THREE.Mesh(GEO.PLANE_1, mirrorMat);
  mir.scale.set(2.4, 1.5, 1);
  mir.position.set(wx(WL - 0.11), 1.6, wz(1.0));
  mir.rotation.y = Math.PI / 2;
  scene.add(mir);
  box(scene, false, 2.0, 0.1, 1.0, -9, 0.8, 1.0, metalMat);        // table
  box(scene, false, 0.1, 0.7, 0.1, -9, 0.4, 1.0, trimMat);          // table leg
  // South side — faces north toward table
  placeChair(scene, -9, 0, -0.2, Math.PI);
  // North side — faces south toward table
  placeChair(scene, -9, 0, 2.2, 0);

  // ─── R5: CELL BLOCK ───
  // Central divider walls
  for (const cx of [-1.5, 1.5]) box(scene, false, 0.2, GH, 7.0, cx, GH / 2, 1.0, darkWall);

  // Cell bars (front, at DIV) — barMat from MAT
  const cellEdges = [-4.4, -1.6, -1.4, 1.4, 1.6, 4.4];
  for (let ci = 0; ci < 3; ci++) {
    const cx1 = cellEdges[ci * 2], cx2 = cellEdges[ci * 2 + 1];
    const cx = (cx1 + cx2) / 2;

    for (let bx = cx1; bx <= cx2; bx += 0.2) addCyl(scene, 0.015, 0.015, GH, 8, barMat, bx, GH / 2, DIV);
    add(scene, GEO.BOX_1, barMat, cx, 1.0, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });
    add(scene, GEO.BOX_1, barMat, cx, 2.5, DIV, 0, { sx: 2.8, sy: 0.05, sz: 0.05 });

    // Bed in cell
    const bed = createHucreYatagi();
    bed.position.set(wx(cx1 + 0.5), 0, wz(iZ2 - 1.2));
    scene.add(bed);
  }

  // R5: LEFT CELL BLOCK WALL (along WL at z=DIV..iZ2)
  // Solid wall with small barred window
  wallZ(scene, false, DIV, iZ2, WL - 0.2, [], GH / 2, GH, darkWall);
  // Small barred window cutout in the left wall (visual bars)
  const lWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, GEO.BOX_1, barMat, WL, wy, lWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  // R5: RIGHT CELL BLOCK WALL (along WR at z=DIV..iZ2)
  wallZ(scene, false, DIV, iZ2, WR + 0.2, [], GH / 2, GH, darkWall);
  const rWinZ = (DIV + iZ2) / 2;
  for (let wy = 1.5; wy <= 3.0; wy += 0.15) {
    add(scene, GEO.BOX_1, barMat, WR, wy, rWinZ, Math.PI / 2, { sx: 0.01, sy: 0.01, sz: 1.0 });
  }

  // ─── ARMORY ───
  placeDolap(scene, 13.0, 0, -1.0, -Math.PI / 2);
  for (let wy = 1.0; wy <= 2.5; wy += 0.7) {
    add(scene, GEO.BOX_1, metalMat, 9.0, wy, iZ2 - 0.2, 0, { sx: 4.0, sy: 0.05, sz: 0.3 });
    for (let gx = 7.5; gx <= 10.5; gx += 0.6) add(scene, GEO.BOX_1, trimMat, gx, wy + 0.25, iZ2 - 0.2, 0, { sx: 0.05, sy: 0.5, sz: 0.15 });
  }
  const torus = new THREE.Mesh(GEO.TORUS_SMALL, emissiveYellow);
  torus.position.set(wx(9), 1.5, wz(DIV + 2.0));
  torus.userData.interactionZone = 'armory_pickup';
  torus.userData.tag = 'armory_pickup';
  scene.add(torus);

  // ─── 7. UPPER FLOOR DECOR ───

  // Captain's Office
  placeDesk(scene, 0, uY, -8.0, 's');
  placeDolap(scene, 3.5, uY, -12.0);
  addCyl(scene, 0.02, 0.02, 2.5, 8, metalMat, -3.5, uY + 1.25, -12.0);
  const flag = createBayrak();
  flag.position.set(wx(-3.2), uY + 2.0, wz(-12.0));
  scene.add(flag);

  // Briefing Room
  const bTable = createToplantiMasasi({ width: 4.0, depth: 1.6, legInsetX: 0.2, legInsetZ: 0.2 });
  bTable.position.set(wx(-9.0), uY, wz(-8.0));
  scene.add(bTable);
  add(scene, GEO.BOX_1, chalkMat, -9.0, uY + 2.0, -12.4, 0, { sx: 3.0, sy: 1.5, sz: 0.05 });
  // Chairs for briefing table
  // South side — faces north toward table
  for (const [cx, cz] of [[-10.5, -9.5], [-7.5, -9.5]]) { placeChair(scene, cx, uY, cz, Math.PI); }

  // Detectives Open Area (4 desks)
  placeDesk(scene, 8, uY, -10.0, 's');
  placeDesk(scene, 11, uY, -10.0, 's');
  placeDesk(scene, 8, uY, -6.0, 's');
  placeDesk(scene, 11, uY, -6.0, 's');

  // ─── 8. EXTERIOR GROUNDS ───

  // Parking lot
  box(scene, false, 30.0, 0.1, 10.0, 0, 0.05, -18, roofMat);
  for (const lxP of [-8, -4, 4, 8]) {
    const line = new THREE.Mesh(GEO.PLANE_1, whiteLine);
    line.scale.set(0.15, 6.0, 1);
    line.rotation.x = -Math.PI / 2;
    line.position.set(wx(lxP), 0.11, wz(-17));
    scene.add(line);
  }

  placePolisArabasi(scene, -6, -17, 0);
  placePolisArabasi(scene, 6, -17, 0);

  // Street Lamps
  for (const lxL of [-14, 14]) {
    const lamp = createSokakLambasi();
    lamp.position.set(wx(lxL), 0, wz(-15));
    if (lxL > 0) lamp.rotation.y = Math.PI;
    scene.add(lamp);
    const lt = lamp.children.find(c => c.isPointLight);
    if (lt) cityData.buildingLights.push(lt);
  }

  // ─── R7: HELIPAD + HELICOPTER ───
  const heliPadZ = 20;
  const pad = createHelipad();
  pad.position.set(wx(0), 0, wz(heliPadZ));
  scene.add(pad);

  // Helicopter
  placeHelikopter(scene, 0, 0.25, 14.5);

  // ─── R1: FULL PERIMETER FENCE ───
  // Zone is 58×58 — fence at ±27 wraps the entire compound
  const F_NORTH = 27, F_SOUTH = -27;
  const F_EAST = 27, F_WEST = -27;
  const FH = 3.0;
  const gateX1 = -3, gateX2 = 3;

  function placeFenceRun(axis, fixedCoord, start, end) {
    const run = createCitFenceRun({ axis, start, end, fixedCoord, fenceHeight: FH });
    run.position.set(wx(0), 0, wz(0));
    scene.add(run);

    // Physics for base rail
    const len = end - start;
    const mid = (start + end) / 2;
    const phys = getPhysicsWorld();
    if (axis === 'x') {
      const shape = new CANNON.Box(new CANNON.Vec3((len + 0.3) / 2, 0.075, 0.075));
      const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      body.addShape(shape);
      body.position.set(wx(mid), 0.5, wz(fixedCoord));
      phys.addBody(body);
    } else {
      const shape = new CANNON.Box(new CANNON.Vec3(0.075, 0.075, (len + 0.3) / 2));
      const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      body.addShape(shape);
      body.position.set(wx(fixedCoord), 0.5, wz(mid));
      phys.addBody(body);
    }
  }

  // Front fence (SOUTH) — split at gate
  placeFenceRun('x', F_SOUTH, F_WEST, gateX1);
  placeFenceRun('x', F_SOUTH, gateX2, F_EAST);
  // Gate posts
  for (const gx of [gateX1, gateX2]) {
    addCyl(scene, 0.04, 0.04, FH + 0.4, 8, metalMat, gx, (FH + 0.4) / 2, F_SOUTH);
  }

  // Back fence (NORTH)
  placeFenceRun('x', F_NORTH, F_WEST, F_EAST);

  // East + West fences
  placeFenceRun('z', F_EAST, F_SOUTH, F_NORTH);
  placeFenceRun('z', F_WEST, F_SOUTH, F_NORTH);

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
