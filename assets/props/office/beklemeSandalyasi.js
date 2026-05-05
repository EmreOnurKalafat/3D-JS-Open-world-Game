// assets/props/office/beklemeSandalyasi.js — Waiting Room Chair (A-grade)
// Padded seat + backrest with CanvasTexture fabric, metal armrests, chrome legs.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/beklemeSandalyasi.js';

function makeFabricTexture(colorBase) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorBase;
  ctx.fillRect(0, 0, size, size);

  // Subtle weave pattern
  for (let y = 0; y < size; y += 6) {
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.fillRect(0, y, size, 3);
  }
  for (let x = 0; x < size; x += 6) {
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(x, 0, 3, size);
  }

  // Stitching seam lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(size - 10, 10);
  ctx.moveTo(10, size - 10);
  ctx.lineTo(size - 10, size - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTexture() {
  if (!cachedTex) cachedTex = makeFabricTexture('#3a5068');
  return cachedTex;
}

export function createBeklemeSandalyasi() {
  const group = new THREE.Group();
  group.name = 'BeklemeSandalyasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bekleme Sandalyesi';

  const tex = getTexture();
  const fabricMat = new THREE.MeshLambertMaterial({ map: tex });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });

  // Seat cushion (thick padded)
  const seat = boxMesh(0.52, 0.1, 0.5, fabricMat);
  seat.position.set(0, 0.44, 0);
  seat.userData.sourceFile = SRC;
  group.add(seat);

  // Backrest (thick padded)
  const back = boxMesh(0.48, 0.4, 0.08, fabricMat);
  back.position.set(0, 0.68, -0.23);
  back.userData.sourceFile = SRC;
  group.add(back);

  // Metal armrests
  for (const dx of [-0.26, 0.26]) {
    // Arm pad
    const pad = boxMesh(0.06, 0.03, 0.3, fabricMat);
    pad.position.set(dx, 0.5, 0.06);
    pad.userData.sourceFile = SRC;
    group.add(pad);

    // Arm support bar
    const support = boxMesh(0.03, 0.12, 0.03, metalMat);
    support.position.set(dx, 0.44, 0.18);
    support.userData.sourceFile = SRC;
    group.add(support);
  }

  // 4 chrome legs
  const legOffsets = [[0.18, 0.18], [0.18, -0.18], [-0.18, 0.18], [-0.18, -0.18]];
  for (const [dx, dz] of legOffsets) {
    const leg = cylMesh(0.02, 0.02, 0.43, 8, metalMat);
    leg.position.set(dx, 0.21, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);

    // Rubber foot cap
    const cap = boxMesh(0.03, 0.02, 0.03, darkMetalMat);
    cap.position.set(dx, 0.01, dz);
    cap.userData.sourceFile = SRC;
    group.add(cap);
  }

  // Cross brace under seat
  const braceX = boxMesh(0.4, 0.02, 0.03, metalMat);
  braceX.position.set(0, 0.25, 0);
  braceX.userData.sourceFile = SRC;
  group.add(braceX);
  const braceZ = boxMesh(0.03, 0.02, 0.4, metalMat);
  braceZ.position.set(0, 0.25, 0);
  braceZ.userData.sourceFile = SRC;
  group.add(braceZ);

  return group;
}
