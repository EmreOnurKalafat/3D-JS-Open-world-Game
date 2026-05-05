// assets/props/office/toplantiMasasi.js — Meeting Table (A-grade)
// Large conference table with CanvasTexture wood top, metal legs, cable management.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/toplantiMasasi.js';

function makeTableWoodTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.5);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#5c3a1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 50; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = `rgba(30,10,0,${0.08 + Math.random() * 0.1})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < canvas.width; x += 15) {
      ctx.lineTo(x, y + Math.sin(x * 0.04) * 4);
    }
    ctx.stroke();
  }

  // Center line for conference table
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeTableWoodTex(); return cachedTex; }

export function createToplantiMasasi(opts = {}) {
  const {
    width = 2.5,
    depth = 1.2,
    topY = 0.8,
    legH = 0.75,
    legInsetX = 0.15,
    legInsetZ = 0.2,
  } = opts;

  const group = new THREE.Group();
  group.name = 'ToplantiMasasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Toplantı Masası';

  const woodMat = new THREE.MeshLambertMaterial({ map: getTex() });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  const halfW = width / 2, halfD = depth / 2;

  // Main table top
  const top = boxMesh(width, 0.08, depth, woodMat);
  top.position.set(0, topY, 0);
  top.userData.sourceFile = SRC;
  group.add(top);

  // Edge banding around top
  for (const dz of [-halfD - 0.01, halfD + 0.01]) {
    const band = boxMesh(width, 0.06, 0.025, metalMat);
    band.position.set(0, topY - 0.02, dz);
    band.userData.sourceFile = SRC;
    group.add(band);
  }

  // 4 metal legs (box-section)
  const legOffsets = [
    [halfW - legInsetX, halfD - legInsetZ],
    [halfW - legInsetX, -(halfD - legInsetZ)],
    [-(halfW - legInsetX), halfD - legInsetZ],
    [-(halfW - legInsetX), -(halfD - legInsetZ)],
  ];
  for (const [dx, dz] of legOffsets) {
    const leg = boxMesh(0.05, legH, 0.05, metalMat);
    leg.position.set(dx, legH / 2 + 0.04, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);

    // Rubber foot
    const foot = boxMesh(0.06, 0.02, 0.06, MAT.DARK_METAL);
    foot.position.set(dx, 0.01, dz);
    foot.userData.sourceFile = SRC;
    group.add(foot);
  }

  // Cross beam (longitudinal)
  const beam = boxMesh(0.04, 0.04, depth - legInsetZ * 2, metalMat);
  beam.position.set(0, legH / 2 + 0.04, 0);
  beam.userData.sourceFile = SRC;
  group.add(beam);

  // Cable management tray (under center)
  const tray = boxMesh(width * 0.4, 0.06, depth * 0.4, MAT.DARK_METAL);
  tray.position.set(0, topY - 0.14, 0);
  tray.userData.sourceFile = SRC;
  group.add(tray);

  return group;
}
