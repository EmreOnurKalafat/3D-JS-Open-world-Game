// client/builders/buildingEntranceBuilder.js — Entrance geometry builders
// Each function returns a merged BufferGeometry for a specific entrance style.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BUILDING_TYPES } from '/config/buildings.js';

const SRC = 'client/builders/buildingEntranceBuilder.js';

function buildEntranceAwning(faceW) {
  const parts = [];
  const awning = new THREE.BoxGeometry(Math.min(faceW * 0.5, 6), 0.2, 1.2);
  awning.translate(0, 3.0, 0.6);
  parts.push(awning);
  const door = new THREE.BoxGeometry(2, 2.6, 0.15);
  door.translate(0, 1.3, 0.08);
  parts.push(door);
  const step = new THREE.BoxGeometry(2.8, 0.25, 0.8);
  step.translate(0, 0.12, 0.4);
  parts.push(step);
  return mergeGeometries(parts);
}

function buildEntrancePorch(faceW) {
  const parts = [];
  const porch = new THREE.BoxGeometry(Math.min(faceW * 0.6, 4), 0.12, 1.5);
  porch.translate(0, 2.6, 0.75);
  parts.push(porch);
  for (const sx of [-1, 1]) {
    const post = new THREE.BoxGeometry(0.12, 2.6, 0.12);
    post.translate(sx * Math.min(faceW * 0.25, 1.5), 1.3, 1.3);
    parts.push(post);
  }
  const door = new THREE.BoxGeometry(1.4, 2.2, 0.1);
  door.translate(0, 1.1, 0.05);
  parts.push(door);
  const step = new THREE.BoxGeometry(2.4, 0.2, 0.7);
  step.translate(0, 0.1, 0.35);
  parts.push(step);
  return mergeGeometries(parts);
}

function buildEntranceRollup(faceW) {
  const parts = [];
  const door = new THREE.BoxGeometry(Math.min(faceW * 0.6, 6), 3.5, 0.2);
  door.translate(0, 1.75, 0.1);
  parts.push(door);
  for (const sx of [-1, 1]) {
    const track = new THREE.BoxGeometry(0.08, 3.5, 0.15);
    track.translate(sx * Math.min(faceW * 0.28, 2.8), 1.75, 0.15);
    parts.push(track);
  }
  const ramp = new THREE.BoxGeometry(Math.min(faceW * 0.7, 6.5), 0.3, 1.5);
  ramp.translate(0, 0.15, 0.75);
  parts.push(ramp);
  return mergeGeometries(parts);
}

function buildEntranceSimple(faceW) {
  const parts = [];
  const doorW = Math.min(faceW * 0.25, 1.6);
  const door = new THREE.BoxGeometry(doorW, 2.4, 0.1);
  door.translate(0, 1.2, 0.05);
  parts.push(door);
  const step = new THREE.BoxGeometry(doorW + 0.6, 0.18, 0.6);
  step.translate(0, 0.09, 0.3);
  parts.push(step);
  return mergeGeometries(parts);
}

/** Dispatch to the correct entrance builder based on building type */
export function buildEntranceForType(typeName, faceW) {
  const bType = BUILDING_TYPES[typeName];
  switch (bType?.entranceStyle) {
    case 'awning': return buildEntranceAwning(faceW);
    case 'porch':  return buildEntrancePorch(faceW);
    case 'rollup': return buildEntranceRollup(faceW);
    case 'simple': return buildEntranceSimple(faceW);
    default:       return buildEntranceAwning(faceW);
  }
}
