// assets/props/kiyafet/manken.js — Manken Prefab
// Full mannequin with base, legs, torso, sphere head, arms in 3 poses.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/manken.js';

export function createManken(pose = 'straight') {
  const group = new THREE.Group();
  group.name = 'Manken';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Manken (' + pose + ')';
  group.userData.breakable = true;

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf5f0eb });
  const accentMat = new THREE.MeshLambertMaterial({ color: 0xddddd5 });

  // Base platform
  const base = cylMesh(0.20, 0.22, 0.08, 12, MAT.DARK_METAL);
  base.position.set(0, 0.04, 0);
  base.userData.sourceFile = SRC;
  group.add(base);

  // Base disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.04, 12), MAT.METAL);
  disc.position.set(0, 0.08, 0);
  disc.userData.sourceFile = SRC;
  group.add(disc);

  // Legs
  const legR = 0.055, legH = 0.75;
  const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(legR, 0.06, legH, 10), bodyMat);
  legLeft.position.set(-0.07, 0.10 + legH / 2, 0);
  legLeft.userData.sourceFile = SRC;
  group.add(legLeft);

  const legRight = new THREE.Mesh(new THREE.CylinderGeometry(legR, 0.06, legH, 10), bodyMat);
  legRight.position.set(0.07, 0.10 + legH / 2, 0);
  legRight.userData.sourceFile = SRC;
  group.add(legRight);

  // Feet
  for (const side of [-1, 1]) {
    const foot = boxMesh(0.08, 0.04, 0.12, accentMat);
    foot.position.set(side * 0.07, 0.13, 0.03);
    foot.userData.sourceFile = SRC;
    group.add(foot);
  }

  // Torso
  const torsoR = 0.14, torsoH = 0.9;
  const torsoY = 0.10 + legH + torsoH / 2;
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(torsoR, 0.13, torsoH, 14), bodyMat);
  torso.position.set(0, torsoY, 0);
  torso.userData.sourceFile = SRC;
  torso.userData.bodyMesh = torso;
  group.add(torso);

  // Shoulders (slight broadening)
  const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.16, torsoR, 0.08, 12), bodyMat);
  shoulders.position.set(0, torsoY + torsoH / 2 - 0.02, 0);
  shoulders.userData.sourceFile = SRC;
  group.add(shoulders);

  // Head (sphere)
  const headR = 0.11;
  const headY = torsoY + torsoH / 2 + headR - 0.02;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 14, 10), bodyMat);
  head.position.set(0, headY, 0);
  head.userData.sourceFile = SRC;
  group.add(head);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.06, 8), bodyMat);
  neck.position.set(0, headY - headR - 0.03, 0);
  neck.userData.sourceFile = SRC;
  group.add(neck);

  // Arms
  const armR = 0.045, armH = 0.55;
  const shoulderY = torsoY + torsoH / 2 - 0.08;
  const shoulderX = 0.17;

  // Upper arms
  const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, armH, 8), bodyMat);
  upperArmL.position.set(shoulderX, shoulderY - armH / 2, 0);
  upperArmL.userData.sourceFile = SRC;
  group.add(upperArmL);

  const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, armH, 8), bodyMat);
  upperArmR.position.set(-shoulderX, shoulderY - armH / 2, 0);
  upperArmR.userData.sourceFile = SRC;
  group.add(upperArmR);

  // Lower arms (pose-dependent)
  if (pose === 'straight') {
    for (const side of [-1, 1]) {
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(armR, 0.04, armH, 8), bodyMat);
      forearm.position.set(side * shoulderX, shoulderY - armH - armH / 2, 0);
      forearm.userData.sourceFile = SRC;
      group.add(forearm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), bodyMat);
      hand.position.set(side * shoulderX, shoulderY - armH * 2.1, 0);
      hand.userData.sourceFile = SRC;
      group.add(hand);
    }
  } else if (pose === 'armsOut') {
    for (const side of [-1, 1]) {
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(armR, 0.04, armH, 8), bodyMat);
      forearm.rotation.z = -side * Math.PI / 2;
      forearm.position.set(side * (shoulderX + armH / 2), shoulderY - armH / 2, 0);
      forearm.userData.sourceFile = SRC;
      group.add(forearm);
    }
  } else if (pose === 'oneArmUp') {
    // Left arm up
    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(armR, 0.04, armH, 8), bodyMat);
    forearmL.position.set(shoulderX, shoulderY + armH / 2, 0);
    forearmL.userData.sourceFile = SRC;
    group.add(forearmL);

    // Right arm down
    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(armR, 0.04, armH, 8), bodyMat);
    forearmR.position.set(-shoulderX, shoulderY - armH - armH / 2, 0);
    forearmR.userData.sourceFile = SRC;
    group.add(forearmR);
  }

  return group;
}
