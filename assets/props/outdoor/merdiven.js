// assets/props/outdoor/merdiven.js — Fire Escape Staircase (A-grade)
// Two-flight steel staircase with CanvasTexture metal steps, landing, railings.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/merdiven.js';

function makeSteelTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, size, size);

  // Checker plate pattern
  for (let y = 0; y < size; y += 12) {
    for (let x = 0; x < size; x += 12) {
      ctx.fillStyle = '#888';
      ctx.fillRect(x, y, 6, 6);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(x + 6, y + 6, 6, 6);
    }
  }

  // Wear
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = 'rgba(180,180,180,0.08)';
    ctx.fillRect(Math.random() * size, Math.random() * size, 8, 8);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeSteelTex(); return cachedTex; }

export function createMerdiven(opts = {}) {
  const {
    totalHeight = 4.5,
    stepsPerFlight = 12,
    stepTread = 0.28,
    stepWidth = 1.2,
    flight1X = -2.2,
    flight2X = -3.8,
    landingX = -3.0,
  } = opts;

  const group = new THREE.Group();
  group.name = 'Merdiven';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Merdiven';

  const stepRise = totalHeight / (stepsPerFlight * 2);
  const f1StartZ = -6.5;
  const landingZ = -2.8;
  const steelMat = new THREE.MeshLambertMaterial({ map: getTex() });
  const railMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });

  // Flight 1 — goes +Z
  for (let i = 0; i < stepsPerFlight; i++) {
    const step = boxMesh(stepWidth, stepRise, stepTread, steelMat);
    step.position.set(flight1X, i * stepRise + stepRise / 2, f1StartZ + i * stepTread);
    step.userData.sourceFile = SRC;
    group.add(step);

    // Step nosing
    const nosing = boxMesh(stepWidth, 0.012, 0.02, MAT.DARK_METAL);
    nosing.position.set(flight1X, (i + 1) * stepRise, f1StartZ + i * stepTread + stepTread / 2);
    nosing.userData.sourceFile = SRC;
    group.add(nosing);
  }

  // Landing
  const landingY = stepsPerFlight * stepRise;
  const landing = boxMesh(2.8, 0.12, 1.2, steelMat);
  landing.position.set(landingX, landingY - 0.06, landingZ);
  landing.userData.sourceFile = SRC;
  group.add(landing);

  // Landing edge trim
  for (const dz of [landingZ - 0.58, landingZ + 0.58]) {
    const trim = boxMesh(2.76, 0.03, 0.03, MAT.DARK_METAL);
    trim.position.set(landingX, landingY - 0.02, dz);
    trim.userData.sourceFile = SRC;
    group.add(trim);
  }

  // Support columns
  for (const sx of [flight1X + stepWidth / 2 + 0.05, flight1X - stepWidth / 2 - 0.05]) {
    const col = cylMesh(0.04, 0.04, landingY + 0.5, 8, railMat);
    col.position.set(sx, landingY / 2, f1StartZ + stepsPerFlight * stepTread / 2);
    col.userData.sourceFile = SRC;
    group.add(col);
  }

  // Flight 2 — goes -Z
  const f2StartZ = -3.1;
  const f2EndZ = f2StartZ - (stepsPerFlight - 1) * stepTread;
  for (let i = 0; i < stepsPerFlight; i++) {
    const step = boxMesh(stepWidth, stepRise, stepTread, steelMat);
    step.position.set(flight2X, landingY + i * stepRise + stepRise / 2, f2StartZ - i * stepTread);
    step.userData.sourceFile = SRC;
    group.add(step);

    const nosing = boxMesh(stepWidth, 0.012, 0.02, MAT.DARK_METAL);
    nosing.position.set(flight2X, landingY + (i + 1) * stepRise, f2StartZ - i * stepTread - stepTread / 2);
    nosing.userData.sourceFile = SRC;
    group.add(nosing);
  }

  // Railings — Flight 1
  const r1x = flight1X - stepWidth / 2 + 0.08;
  for (let i = 0; i <= stepsPerFlight; i++) {
    const rx = r1x;
    const ry = i * stepRise + 0.55;
    const rz = f1StartZ + Math.min(i, stepsPerFlight - 1) * stepTread;
    const post = cylMesh(0.02, 0.02, 1.0, 8, railMat);
    post.position.set(rx, ry, rz);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  const r1StartZ = f1StartZ;
  const r1EndZ = f1StartZ + (stepsPerFlight - 1) * stepTread;
  const r1rail = boxMesh(0.03, 0.03, r1EndZ - r1StartZ + 0.3, railMat);
  r1rail.position.set(r1x, stepsPerFlight * stepRise + 0.55, (r1StartZ + r1EndZ) / 2);
  r1rail.userData.sourceFile = SRC;
  group.add(r1rail);

  // Mid-rail
  const r1mid = boxMesh(0.02, 0.02, r1EndZ - r1StartZ + 0.3, railMat);
  r1mid.position.set(r1x, stepsPerFlight * stepRise * 0.55, (r1StartZ + r1EndZ) / 2);
  r1mid.userData.sourceFile = SRC;
  group.add(r1mid);

  // Railings — Flight 2
  const r2x = flight2X + stepWidth / 2 - 0.08;
  for (let i = 0; i <= stepsPerFlight; i++) {
    const post = cylMesh(0.02, 0.02, 1.0, 8, railMat);
    post.position.set(r2x, landingY + i * stepRise + 0.55, f2StartZ - Math.min(i, stepsPerFlight - 1) * stepTread);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  const r2rail = boxMesh(0.03, 0.03, r1EndZ - r1StartZ + 0.3, railMat);
  r2rail.position.set(r2x, landingY + stepsPerFlight * stepRise + 0.55, (f2StartZ + r1EndZ - r1StartZ + f2StartZ) / 2);
  r2rail.position.set(r2x, landingY + stepsPerFlight * stepRise + 0.55, (f2StartZ + f2EndZ) / 2);
  r2rail.userData.sourceFile = SRC;
  group.add(r2rail);

  // Landing railing
  const lrx = landingX - 1.35;
  for (const lz of [landingZ - 0.55, landingZ + 0.55]) {
    const lpost = cylMesh(0.02, 0.02, 1.0, 8, railMat);
    lpost.position.set(lrx, landingY + 0.5, lz);
    lpost.userData.sourceFile = SRC;
    group.add(lpost);
  }
  const lrail = boxMesh(0.03, 0.03, 1.2, railMat);
  lrail.position.set(lrx, landingY + 1.0, landingZ);
  lrail.userData.sourceFile = SRC;
  group.add(lrail);

  return group;
}
