// assets/prefabs/merdiven.js — Staircase Prefab (parameterized)
// Built at origin (0,0,0). Two flights + landing + railings.
//
// Parameters (passed as object):
//   totalHeight  — vertical rise of the full staircase (default 4.5)
//   stepsPerFlight — steps in each flight (default 12)
//   stepTread    — depth of each step (default 0.28)
//   stepWidth    — width of each step (default 1.2)
//   flight1X     — X centre of first flight (default -2.2)
//   flight2X     — X centre of second flight (default -3.8)
//   landingX     — X centre of landing (default -3.0)

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/prefabs/props/outdoor/merdiven.js';

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
  group.userData.editorLabel = 'Merdiven Prefab';

  const stepRise = totalHeight / (stepsPerFlight * 2);
  const f1StartZ = -6.5;
  const landingZ = -2.8;

  // Flight 1 — goes North (+Z)
  for (let i = 0; i < stepsPerFlight; i++) {
    const step = boxMesh(stepWidth, stepRise, stepTread, MAT.TRIM);
    step.position.set(flight1X, i * stepRise + stepRise / 2, f1StartZ + i * stepTread);
    step.userData.sourceFile = SRC;
    group.add(step);
  }

  // Landing
  const landingY = stepsPerFlight * stepRise;
  const landing = boxMesh(2.8, 0.2, 1.2, MAT.TRIM);
  landing.position.set(landingX, landingY - 0.1, landingZ);
  landing.userData.sourceFile = SRC;
  group.add(landing);

  // Flight 2 — goes South (-Z)
  const f2StartZ = -3.1;
  for (let i = 0; i < stepsPerFlight; i++) {
    const step = boxMesh(stepWidth, stepRise, stepTread, MAT.TRIM);
    step.position.set(flight2X, landingY + i * stepRise + stepRise / 2, f2StartZ - i * stepTread);
    step.userData.sourceFile = SRC;
    group.add(step);
  }

  // ─── Railings ───

  // Flight 1 handrail
  const f1RailX = flight1X - stepWidth / 2 + 0.1;
  const f1RailZ1 = f1StartZ;
  const f1RailZn = f1StartZ + (stepsPerFlight - 1) * stepTread;
  const f1Rail = boxMesh(0.04, 0.04, f1RailZn - f1RailZ1 + 0.3, MAT.METAL);
  f1Rail.position.set(f1RailX, stepsPerFlight * stepRise + 0.55, (f1RailZ1 + f1RailZn) / 2);
  f1Rail.userData.sourceFile = SRC;
  group.add(f1Rail);

  for (let i = 0; i <= stepsPerFlight; i += 2) {
    const post = cylMesh(0.02, 0.02, 1.0, 8, MAT.METAL);
    post.position.set(f1RailX, i * stepRise + 0.5, f1StartZ + i * stepTread);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  // Flight 2 handrail
  const f2RailX = flight2X + stepWidth / 2 - 0.1;
  const f2RailZ1 = f2StartZ - (stepsPerFlight - 1) * stepTread;
  const f2RailZ2 = f2StartZ;
  const f2Rail = boxMesh(0.04, 0.04, f2RailZ2 - f2RailZ1 + 0.3, MAT.METAL);
  f2Rail.position.set(f2RailX, landingY + stepsPerFlight * stepRise + 0.55, (f2RailZ1 + f2RailZ2) / 2);
  f2Rail.userData.sourceFile = SRC;
  group.add(f2Rail);

  for (let i = 0; i <= stepsPerFlight; i += 2) {
    const post = cylMesh(0.02, 0.02, 1.0, 8, MAT.METAL);
    post.position.set(f2RailX, landingY + i * stepRise + 0.5, f2StartZ - i * stepTread);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  // Landing railings
  for (const lx of [landingX, landingX + 1.5]) {
    const post = cylMesh(0.02, 0.02, 1.0, 8, MAT.METAL);
    post.position.set(lx, landingY + 0.5, landingZ);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  const landingBar = boxMesh(1.6, 0.04, 0.04, MAT.METAL);
  landingBar.position.set(landingX + 0.75, landingY + 1.0, landingZ);
  landingBar.userData.sourceFile = SRC;
  group.add(landingBar);

  return group;
}
