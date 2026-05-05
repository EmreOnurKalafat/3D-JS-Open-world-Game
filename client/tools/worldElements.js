// client/tools/worldElements.js — Standalone world element factories for Asset Viewer
// Each function returns a THREE.Group, usable directly in the catalog UI.
// Mirrors elements from world.js builders: roads, sidewalks, buildings, trees, grass, cars.

import * as THREE from 'three';
import { makeSidewalkTexture, makeGrassTexture, makeSandTexture, makeWaterTexture } from '../builders/textureBuilder.js';
import { createSedan } from '../../assets/vehicles/sedan.js';

const SRC = 'client/tools/worldElements.js';

// ═══════════════════════════════════════════
//  ROAD SEGMENT (with markings)
// ═══════════════════════════════════════════

function makeRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#555555';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(128, 0); ctx.lineTo(128, 256);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 0); ctx.lineTo(8, 256);
  ctx.moveTo(248, 0); ctx.lineTo(248, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

// ═══════════════════════════════════════════
//  ROAD SEGMENT (with markings)
// ═══════════════════════════════════════════

export function createRoadSegment() {
  const group = new THREE.Group();
  group.name = 'RoadSegment';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Yol Parçası';

  const roadTex = makeRoadTexture();
  roadTex.wrapS = THREE.RepeatWrapping;
  roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(1, 2);

  // Asphalt base
  const asphalt = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.2, 12),
    new THREE.MeshLambertMaterial({ color: 0x444444 }));
  asphalt.position.y = 0.1;
  asphalt.receiveShadow = true;
  asphalt.userData.sourceFile = SRC;
  group.add(asphalt);

  // Yellow center line
  const yellow = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.005, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
  yellow.position.set(0, 0.203, 0);
  yellow.userData.sourceFile = SRC;
  group.add(yellow);

  // White edge lines
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(60, 0.005, 0.15),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    edge.position.set(0, 0.203, side * 5.5);
    edge.userData.sourceFile = SRC;
    group.add(edge);
  }

  return group;
}

// ═══════════════════════════════════════════
//  SIDEWALK SEGMENT
// ═══════════════════════════════════════════

export function createSidewalkSegment() {
  const group = new THREE.Group();
  group.name = 'Sidewalk';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Kaldırım';

  const swTex = makeSidewalkTexture();
  swTex.wrapS = THREE.RepeatWrapping;
  swTex.wrapT = THREE.RepeatWrapping;
  swTex.repeat.set(4, 1);

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.2, 3),
    new THREE.MeshLambertMaterial({ map: swTex }));
  slab.position.y = 0.1;
  slab.receiveShadow = true;
  slab.userData.sourceFile = SRC;
  group.add(slab);

  return group;
}

// ═══════════════════════════════════════════
//  BLOCK FILL (green/brown fill between roads)
// ═══════════════════════════════════════════

export function createBlockFill() {
  const group = new THREE.Group();
  group.name = 'BlockFill';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Zemin Dolgu';

  const grassTex = makeGrassTexture();
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(6, 6);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshLambertMaterial({ map: grassTex }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.01;
  plane.receiveShadow = true;
  plane.userData.sourceFile = SRC;
  group.add(plane);

  return group;
}

// ═══════════════════════════════════════════
//  GRASS PLANE (dense grass, for parks)
// ═══════════════════════════════════════════

export function createGrassPlane() {
  const group = new THREE.Group();
  group.name = 'GrassPlane';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çimen / Park Zemini';

  const grassTex = makeGrassTexture();
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(8, 8);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshLambertMaterial({ map: grassTex }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.03;
  plane.receiveShadow = true;
  plane.userData.sourceFile = SRC;
  group.add(plane);

  return group;
}

// ═══════════════════════════════════════════
//  TRAFFIC LIGHT
// ═══════════════════════════════════════════

export function createTrafficLight() {
  const group = new THREE.Group();
  group.name = 'TrafficLight';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Trafik Lambası';

  const darkMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5, 8), poleMat);
  pole.position.y = 2.5;
  pole.userData.sourceFile = SRC;
  group.add(pole);

  // Horizontal arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 2.5), poleMat);
  arm.position.set(0, 4.8, 1.0);
  arm.userData.sourceFile = SRC;
  group.add(arm);

  // Traffic light housing
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 0.35), darkMat);
  housing.position.set(0, 4.2, 2.05);
  housing.userData.sourceFile = SRC;
  group.add(housing);

  // Red light
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
  red.position.set(0, 4.55, 2.25);
  red.userData.sourceFile = SRC;
  group.add(red);

  // Yellow light
  const yellowLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xFFAA00 }));
  yellowLight.position.set(0, 4.2, 2.25);
  yellowLight.userData.sourceFile = SRC;
  group.add(yellowLight);

  // Green light
  const green = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00CC00 }));
  green.position.set(0, 3.85, 2.25);
  green.userData.sourceFile = SRC;
  group.add(green);

  return group;
}

// ═══════════════════════════════════════════
//  PARKED CAR (uses real sedan prefab)
// ═══════════════════════════════════════════

export function createParkedCar() {
  // Realistic sedan with random procedural metallic paint hue
  const hues = [0, 30, 210, 120, 280, 40];
  const group = createSedan(hues[Math.floor(Math.random() * hues.length)]);
  group.name = 'ParkedCar';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Park Edilmiş Araba (Sedan)';
  return group;
}

// ═══════════════════════════════════════════
//  BEACH / SAND SEGMENT
// ═══════════════════════════════════════════

export function createBeachSegment() {
  const group = new THREE.Group();
  group.name = 'Beach';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Plaj / Kum';

  const sandTex = makeSandTexture();
  sandTex.wrapS = THREE.RepeatWrapping;
  sandTex.wrapT = THREE.RepeatWrapping;
  sandTex.repeat.set(6, 2);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 20),
    new THREE.MeshLambertMaterial({ map: sandTex }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.04;
  plane.receiveShadow = true;
  plane.userData.sourceFile = SRC;
  group.add(plane);

  return group;
}

// ═══════════════════════════════════════════
//  WATER PLANE (animated compatible)
// ═══════════════════════════════════════════

export function createWaterPlane() {
  const group = new THREE.Group();
  group.name = 'Water';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Su Yüzeyi';

  const { texture } = makeWaterTexture();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 50),
    new THREE.MeshLambertMaterial({ map: texture, color: 0x3388BB, transparent: true, opacity: 0.75 }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  plane.receiveShadow = true;
  plane.userData.sourceFile = SRC;
  group.add(plane);

  return group;
}

// ═══════════════════════════════════════════
//  BUILDING (generic block with roof)
// ═══════════════════════════════════════════

export function createBuilding() {
  const group = new THREE.Group();
  group.name = 'Building';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bina (Prosedürel)';

  const w = 10 + Math.random() * 15;
  const h = 8 + Math.random() * 40;
  const d = 10 + Math.random() * 15;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  // Dark facade
  const hues = [0.6, 0.55, 0.08, 0.12, 0.0];
  const hue = hues[Math.floor(Math.random() * hues.length)];
  ctx.fillStyle = `hsl(${hue * 360}, 15%, 30%)`;
  ctx.fillRect(0, 0, 128, 256);

  // Windows
  const rows = Math.floor(h / 5);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 4; c++) {
      const lit = Math.random() > 0.3;
      ctx.fillStyle = lit ? 'rgba(255,240,200,0.8)' : 'rgba(20,30,50,0.7)';
      const wx = 8 + c * 30, wy = 10 + r * 18;
      ctx.fillRect(wx, wy, 20, 12);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, Math.max(1, Math.round(h / 10)));
  tex.magFilter = THREE.NearestFilter;

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ map: tex }));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Roof
  const roofH = 1.2;
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, w / 2 + 0.5, roofH, 4),
    new THREE.MeshLambertMaterial({ color: 0x3c3c3c }));
  roof.position.y = h + roofH / 2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.userData.sourceFile = SRC;
  group.add(roof);

  return group;
}

// ═══════════════════════════════════════════
//  CROSSWALK
// ═══════════════════════════════════════════

export function createCrosswalk() {
  const group = new THREE.Group();
  group.name = 'Crosswalk';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Yaya Geçidi';

  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  for (let i = 0; i < 8; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.005, 4),
      stripeMat);
    stripe.position.set(-3.5 + i * 1.0, 0.205, 0);
    stripe.userData.sourceFile = SRC;
    group.add(stripe);
  }

  return group;
}
