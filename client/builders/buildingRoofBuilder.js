// client/builders/buildingRoofBuilder.js — Roof geometry builders
// Each function returns a BufferGeometry for a specific roof style.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BUILDING_TYPES } from '/config/buildings.js';

const SRC = 'client/builders/buildingRoofBuilder.js';

function buildRoofFlatDetailed(bw, bd) {
  const parts = [];
  const slab = new THREE.BoxGeometry(bw - 1.5, 0.3, bd - 1.5);
  slab.translate(0, 0.15, 0);
  parts.push(slab);
  const acCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < acCount; i++) {
    const aw = 1.2 + Math.random() * 1.5;
    const ah = 1.5 + Math.random() * 2.0;
    const ad = 0.8 + Math.random() * 1.0;
    const ac = new THREE.BoxGeometry(aw, ah, ad);
    ac.translate((Math.random() - 0.5) * (bw - 3), 0.3 + ah / 2, (Math.random() - 0.5) * (bd - 3));
    parts.push(ac);
  }
  const eh = 2.5 + Math.random() * 1.5;
  const ev = new THREE.BoxGeometry(2.5, eh, 2.5);
  ev.translate((Math.random() - 0.5) * (bw - 5), 0.3 + eh / 2, (Math.random() - 0.5) * (bd - 5));
  parts.push(ev);
  return mergeGeometries(parts);
}

function buildRoofFlatSimple(bw, bd) {
  const parts = [];
  const slab = new THREE.BoxGeometry(bw - 1.0, 0.2, bd - 1.0);
  slab.translate(0, 0.1, 0);
  parts.push(slab);
  const ac = new THREE.BoxGeometry(1.5, 1.8, 1.0);
  ac.translate((Math.random() - 0.5) * (bw - 2), 0.2 + 0.9, (Math.random() - 0.5) * (bd - 2));
  parts.push(ac);
  return mergeGeometries(parts);
}

function buildRoofPitched(bw, bd) {
  const ridgeH = 2.5 + Math.random() * 1.5;
  const shape = new THREE.Shape();
  shape.moveTo(-bd / 2, 0);
  shape.lineTo(0, ridgeH);
  shape.lineTo(bd / 2, 0);
  shape.closePath();
  const extrudeSettings = { steps: 1, depth: bw - 1.0, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.translate(-(bw - 1.0) / 2, 0, 0);
  return geo;
}

/** Dispatch to the correct roof builder based on building type */
export function buildRoofForType(typeName, bw, bd) {
  const bType = BUILDING_TYPES[typeName];
  switch (bType?.roofStyle) {
    case 'flat_detailed': return buildRoofFlatDetailed(bw, bd);
    case 'flat_simple':   return buildRoofFlatSimple(bw, bd);
    case 'pitched':       return buildRoofPitched(bw, bd);
    case 'flat_vents':    return buildRoofFlatSimple(bw, bd);
    default:              return buildRoofFlatDetailed(bw, bd);
  }
}
