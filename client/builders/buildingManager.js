// client/builders/buildingManager.js — Modular building system
// Building types, zone-based placement, custom buildings, InstancedMesh management.
// All building meshes have userData.sourceFile pointing HERE for freecam editor.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAT } from '../../assets/shared/resources.js';
import { getPhysicsWorld } from '../core/physicsManager.js';
import {
  makeBuildingFacadeTexture, updateBuildingFacadeTexture, updateBuildingFacadeContinuous,
} from './textureBuilder.js';
import { BUILDING_TYPES, getZoneBuildingTypes } from '../../data/buildings/registry.js';

const SRC = 'client/builders/buildingManager.js';

// ═══════════════════════════════════════════════════════════
//  FACADE TEXTURE SYSTEM
// ═══════════════════════════════════════════════════════════

/** Per-building-type texture cache */
const typeTexData = {};

function getTypeTextureData(typeName) {
  if (!typeTexData[typeName]) {
    const bType = BUILDING_TYPES[typeName];
    typeTexData[typeName] = makeBuildingFacadeTexture(bType ? bType.facadeColor : '#888888');
  }
  return typeTexData[typeName];
}

/** Update all type textures for day/night phase */
export function updateBuildingTexturesForPhase(phase) {
  for (const key of Object.keys(typeTexData)) {
    updateBuildingFacadeTexture(typeTexData[key], phase);
  }
}

// ═══════════════════════════════════════════════════════════
//  ROOF BUILDERS
// ═══════════════════════════════════════════════════════════

function buildRoofFlatDetailed(bw, bd) {
  const parts = [];
  // Main roof slab
  const slab = new THREE.BoxGeometry(bw - 1.5, 0.3, bd - 1.5);
  slab.translate(0, 0.15, 0);
  parts.push(slab);
  // AC units
  const acCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < acCount; i++) {
    const aw = 1.2 + Math.random() * 1.5;
    const ah = 1.5 + Math.random() * 2.0;
    const ad = 0.8 + Math.random() * 1.0;
    const ac = new THREE.BoxGeometry(aw, ah, ad);
    ac.translate((Math.random() - 0.5) * (bw - 3), 0.3 + ah / 2, (Math.random() - 0.5) * (bd - 3));
    parts.push(ac);
  }
  // Elevator overrun
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
  // 1 small AC unit
  const ac = new THREE.BoxGeometry(1.5, 1.8, 1.0);
  ac.translate((Math.random() - 0.5) * (bw - 2), 0.2 + 0.9, (Math.random() - 0.5) * (bd - 2));
  parts.push(ac);
  return mergeGeometries(parts);
}

function buildRoofPitched(bw, bd) {
  // Create pitched roof using a custom shape (two planes forming a triangle)
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

// ═══════════════════════════════════════════════════════════
//  ENTRANCE BUILDERS
// ═══════════════════════════════════════════════════════════

function buildEntranceAwning(faceW) {
  const parts = [];
  // Awning
  const awning = new THREE.BoxGeometry(Math.min(faceW * 0.5, 6), 0.2, 1.2);
  awning.translate(0, 3.0, 0.6);
  parts.push(awning);
  // Door frame
  const door = new THREE.BoxGeometry(2, 2.6, 0.15);
  door.translate(0, 1.3, 0.08);
  parts.push(door);
  // Step
  const step = new THREE.BoxGeometry(2.8, 0.25, 0.8);
  step.translate(0, 0.12, 0.4);
  parts.push(step);
  return mergeGeometries(parts);
}

function buildEntrancePorch(faceW) {
  const parts = [];
  // Small porch roof
  const porch = new THREE.BoxGeometry(Math.min(faceW * 0.6, 4), 0.12, 1.5);
  porch.translate(0, 2.6, 0.75);
  parts.push(porch);
  // Two porch posts
  for (const sx of [-1, 1]) {
    const post = new THREE.BoxGeometry(0.12, 2.6, 0.12);
    post.translate(sx * Math.min(faceW * 0.25, 1.5), 1.3, 1.3);
    parts.push(post);
  }
  // Door
  const door = new THREE.BoxGeometry(1.4, 2.2, 0.1);
  door.translate(0, 1.1, 0.05);
  parts.push(door);
  // Step
  const step = new THREE.BoxGeometry(2.4, 0.2, 0.7);
  step.translate(0, 0.1, 0.35);
  parts.push(step);
  return mergeGeometries(parts);
}

function buildEntranceRollup(faceW) {
  const parts = [];
  // Large roll-up door
  const door = new THREE.BoxGeometry(Math.min(faceW * 0.6, 6), 3.5, 0.2);
  door.translate(0, 1.75, 0.1);
  parts.push(door);
  // Door track lines
  for (const sx of [-1, 1]) {
    const track = new THREE.BoxGeometry(0.08, 3.5, 0.15);
    track.translate(sx * Math.min(faceW * 0.28, 2.8), 1.75, 0.15);
    parts.push(track);
  }
  // Concrete ramp
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

// ═══════════════════════════════════════════════════════════
//  ROOF / ENTRANCE DISPATCHERS
// ═══════════════════════════════════════════════════════════

function buildRoofForType(typeName, bw, bd) {
  const bType = BUILDING_TYPES[typeName];
  switch (bType?.roofStyle) {
    case 'flat_detailed': return buildRoofFlatDetailed(bw, bd);
    case 'flat_simple':   return buildRoofFlatSimple(bw, bd);
    case 'pitched':       return buildRoofPitched(bw, bd);
    case 'flat_vents':    return buildRoofFlatSimple(bw, bd); // reuse simple for warehouses
    default:              return buildRoofFlatDetailed(bw, bd);
  }
}

function buildEntranceForType(typeName, faceW) {
  const bType = BUILDING_TYPES[typeName];
  switch (bType?.entranceStyle) {
    case 'awning': return buildEntranceAwning(faceW);
    case 'porch':  return buildEntrancePorch(faceW);
    case 'rollup': return buildEntranceRollup(faceW);
    case 'simple': return buildEntranceSimple(faceW);
    default:       return buildEntranceAwning(faceW);
  }
}

// ═══════════════════════════════════════════════════════════
//  DEFERRED INSTANCED BUILD SYSTEM
// ═══════════════════════════════════════════════════════════

const buildGroups = new Map();

function addBuildEntry(sig, geometry, material, matrix) {
  if (!buildGroups.has(sig)) {
    buildGroups.set(sig, { geometry: geometry.clone(), material, matrices: [] });
  }
  buildGroups.get(sig).matrices.push(matrix.clone());
}

function buildAllBuildings(scene) {
  for (const [sig, group] of buildGroups) {
    const im = new THREE.InstancedMesh(group.geometry, group.material, group.matrices.length);
    group.matrices.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    im.name = sig;
    im.userData.sourceFile = SRC;
    im.userData.editorLabel = `${sig} (Instanced)`;
    scene.add(im);
  }
  buildGroups.clear();
}

// ═══════════════════════════════════════════════════════════
//  BUILDING PLACEMENT (PROCEDURAL ZONES)
// ═══════════════════════════════════════════════════════════

/**
 * Place zone-based buildings on a grid.
 * @param {THREE.Scene} scene
 * @param {Object} occ - OccupancyGrid instance
 * @param {Object} opts - { GRID, CELL, WH, HALF, CURB, BUILD_MARGIN, isSpecialCell(row,col) }
 * @param {Array} buildingsArr - cityData.buildings array to push physics refs into
 */
export function placeZoneBuildings(scene, occ, opts, buildingsArr) {
  const phys = getPhysicsWorld();
  const { GRID, CELL, WH, HALF, CURB, BUILD_MARGIN } = opts;
  const usableHalf = HALF - CURB - BUILD_MARGIN;
  const usable = usableHalf * 2;
  const buildRoofMat = MAT.ROOF;

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (row === 0) continue;
      if (opts.isSpecialCell(row, col)) continue;

      const cx = col * CELL - WH + HALF;
      const cz = row * CELL - WH + HALF;
      const zone = opts.getZone(row, col);
      const typeNames = getZoneBuildingTypes(zone);

      // Zone layout: determine grid density from first available type
      const primaryType = BUILDING_TYPES[typeNames[0]];
      const dens = primaryType ? (zone === 'downtown_core' ? 0.95 : zone === 'industrial' ? 0.80 : 0.80) : 0.70;
      const nCols = zone === 'industrial' ? 1 : zone === 'downtown_core' || zone === 'downtown' ? 2 : 3;
      const nRows = zone === 'industrial' ? 2 : zone === 'downtown_core' || zone === 'downtown' ? 2 : zone === 'beach' ? 2 : 4;

      const slotW = usable / nCols;
      const slotD = usable / nRows;
      const sx = cx - usable / 2;
      const sz = cz - usable / 2;

      // Road edges
      const roadN = cz + HALF, roadS = cz - HALF;
      const roadE = cx + HALF, roadW = cx - HALF;

      for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
          if (Math.random() > dens) continue;

          // Pick random building type for this zone
          const typeName = typeNames[Math.floor(Math.random() * typeNames.length)];
          const bType = BUILDING_TYPES[typeName];
          if (!bType) continue;

          const bw = bType.minW + Math.random() * (bType.maxW - bType.minW);
          const bd = bType.minW + Math.random() * (bType.maxW - bType.minW);
          const bh = bType.minH + Math.random() * (bType.maxH - bType.minH);

          const finalW = Math.min(bw, slotW - BUILD_MARGIN * 2);
          const finalD = Math.min(bd, slotD - BUILD_MARGIN * 2);
          if (finalW < 3 || finalD < 3) continue;

          const jitter = 0.4;
          const bx = sx + c * slotW + slotW / 2 + (Math.random() - 0.5) * (slotW - finalW - BUILD_MARGIN) * jitter;
          const bz = sz + r * slotD + slotD / 2 + (Math.random() - 0.5) * (slotD - finalD - BUILD_MARGIN) * jitter;

          const sig = `${typeName}_${finalW.toFixed(1)}x${bh.toFixed(1)}x${finalD.toFixed(1)}`;

          // Facade texture per building type
          const texData = getTypeTextureData(typeName);
          if (!texData._sharedMat) {
            texData._sharedMat = new THREE.MeshLambertMaterial({ map: texData.texture });
            texData._sharedMat.map.wrapS = THREE.RepeatWrapping;
            texData._sharedMat.map.wrapT = THREE.RepeatWrapping;
            texData._sharedMat.map.repeat.set(1, Math.max(1, Math.round(bType.maxH / 10)));
          }

          // Body
          const bodyGeo = new THREE.BoxGeometry(finalW, bh, finalD);
          bodyGeo.translate(0, bh / 2, 0);
          const bodyMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(bx, 0, bz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
          addBuildEntry('body_' + sig, bodyGeo, texData._sharedMat, bodyMatrix);

          // Determine road-facing direction
          const distN = Math.abs(bz - roadN), distS = Math.abs(bz - roadS);
          const distE = Math.abs(bx - roadE), distW = Math.abs(bx - roadW);
          const minDist = Math.min(distN, distS, distE, distW);

          let eRotY, eOffX, eOffZ;
          if (minDist === distN)      { eRotY = 0;            eOffX = 0; eOffZ = finalD / 2; }
          else if (minDist === distS) { eRotY = Math.PI;      eOffX = 0; eOffZ = -finalD / 2; }
          else if (minDist === distE) { eRotY = Math.PI / 2;  eOffX = finalW / 2; eOffZ = 0; }
          else                        { eRotY = -Math.PI / 2; eOffX = -finalW / 2; eOffZ = 0; }

          const faceW = (minDist === distE || minDist === distW) ? finalD : finalW;

          // Entrance
          const entranceGeo = buildEntranceForType(typeName, faceW);
          const eQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, eRotY, 0));
          const eMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(bx + eOffX, 0, bz + eOffZ), eQuat, new THREE.Vector3(1, 1, 1));
          addBuildEntry('entrance_' + sig, entranceGeo, buildRoofMat, eMatrix);

          // Roof
          const roofGeo = buildRoofForType(typeName, finalW, finalD);
          roofGeo.translate(0, bh + 0.15, 0);
          addBuildEntry('roof_' + sig, roofGeo, buildRoofMat, bodyMatrix);

          // Physics
          const shape = new CANNON.Box(new CANNON.Vec3(finalW / 2, bh / 2, finalD / 2));
          const body = new CANNON.Body({ mass: 0 });
          body.addShape(shape);
          body.position.set(bx, bh / 2, bz);
          phys.addBody(body);
          buildingsArr.push({ position: { x: bx, y: 0, z: bz }, body, w: finalW, h: bh, d: finalD, type: typeName });
          occ.fill(bx, bz, finalW + 1.2, finalD + 1.2);
        }
      }
    }
  }

  // Build all InstancedMeshes for zone buildings
  buildAllBuildings(scene);
}

// ═══════════════════════════════════════════════════════════
//  CUSTOM / ONE-OFF BUILDING PLACEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Place a single custom building as an individual Group (not InstancedMesh).
 * Used for landmarks, player-added buildings, or unique structures.
 *
 * @returns {THREE.Group} — the placed building group
 */
export function placeCustomBuilding(scene, occ, opts) {
  const phys = getPhysicsWorld();
  const {
    typeName = 'mustakilEv',
    w = 10, h = 8, d = 10,
    x = 0, z = 0,
    rotY = 0,
    buildingsArr = null,
    sourceFile = null,
  } = opts;

  const bType = BUILDING_TYPES[typeName] || BUILDING_TYPES.mustakilEv;
  const group = new THREE.Group();
  const effectiveSrc = sourceFile || SRC;
  group.name = `Custom_${typeName}`;
  group.userData.sourceFile = effectiveSrc;
  group.userData.editorLabel = `Özel ${bType.label}`;

  // Body
  const texData = getTypeTextureData(typeName);
  if (!texData._sharedMat) {
    texData._sharedMat = new THREE.MeshLambertMaterial({ map: texData.texture });
    texData._sharedMat.map.wrapS = THREE.RepeatWrapping;
    texData._sharedMat.map.wrapT = THREE.RepeatWrapping;
    texData._sharedMat.map.repeat.set(1, Math.max(1, Math.round(h / 10)));
  }

  const bodyGeo = new THREE.BoxGeometry(w, h, d);
  bodyGeo.translate(0, h / 2, 0);
  const bodyMesh = new THREE.Mesh(bodyGeo, texData._sharedMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.userData.sourceFile = effectiveSrc;
  group.add(bodyMesh);

  // Roof
  const roofGeo = buildRoofForType(typeName, w, d);
  roofGeo.translate(0, h + 0.15, 0);
  const roofMesh = new THREE.Mesh(roofGeo, MAT.ROOF);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofMesh.userData.sourceFile = effectiveSrc;
  group.add(roofMesh);

  // Entrance (faces +Z by default, rotated by rotY)
  const entranceGeo = buildEntranceForType(typeName, w);
  const entranceGroup = new THREE.Group();
  const entranceMesh = new THREE.Mesh(entranceGeo, MAT.ROOF);
  entranceMesh.userData.sourceFile = effectiveSrc;
  entranceGroup.add(entranceMesh);
  entranceGroup.position.set(0, 0, d / 2);
  entranceGroup.rotation.y = 0;
  group.add(entranceGroup);

  // Position & rotate the whole group
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  scene.add(group);

  // Physics
  const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(shape);
  body.position.set(x, h / 2, z);
  phys.addBody(body);

  if (buildingsArr) {
    buildingsArr.push({ position: { x, y: 0, z }, body, w, h, d, type: typeName, isCustom: true });
  }
  occ.fill(x, z, w + 1.5, d + 1.5);

  return group;
}

// ═══════════════════════════════════════════════════════════
//  LANDMARKS
// ═══════════════════════════════════════════════════════════

/**
 * Place city landmark buildings (skyscraper, antenna).
 * Placed before zone buildings so OccupancyGrid reserves their space.
 */
export function placeLandmarks(scene, occ, opts, buildingsArr) {
  const { GRID, CELL, WH, HALF } = opts;
  const c = Math.floor(GRID / 2);
  const sx = c * CELL - WH + HALF;
  const sz = (c + 1) * CELL - WH + HALF;

  // Central skyscraper
  placeCustomBuilding(scene, occ, {
    typeName: 'gokdelen',
    w: 10, h: 85, d: 10,
    x: sx, z: sz,
    rotY: 0,
    buildingsArr,
    sourceFile: SRC,
  });

  // Antenna on top
  const ant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 14, 8),
    new THREE.MeshLambertMaterial({ color: 0xCCCCCC }));
  ant.position.set(sx, 92, sz);
  ant.userData.sourceFile = SRC;
  scene.add(ant);
}

// ═══════════════════════════════════════════════════════════
//  NIGHT LIGHTING
// ═══════════════════════════════════════════════════════════

let buildingLights = [];
let nightFactor = 0;

/** Initialize area lights for night-time window glow */
export function initBuildingLights(scene, CELL, WH) {
  const lights = [];
  const STEP = CELL * 2;
  const off = WH * 0.7;

  for (let ix = -off; ix <= off + 1; ix += STEP) {
    for (let iz = -off; iz <= off + 1; iz += STEP) {
      const light = new THREE.PointLight(0xFFDDAA, 0, 220);
      light.position.set(ix, 20, iz);
      light.castShadow = false;
      light.userData = { maxIntensity: 200 };
      scene.add(light);
      lights.push(light);
    }
  }

  buildingLights = lights;
  console.log('[BUILDING] %d area lights created', lights.length);
}

/** Smoothly update building lighting for day/night cycle */
export function updateBuildingLighting(nf) {
  nightFactor = Math.max(0, Math.min(1, nf));

  for (const light of buildingLights) {
    light.intensity = nightFactor * light.userData.maxIntensity;
  }

  const prev = updateBuildingLighting._lastNf;
  if (prev === undefined || Math.abs(nightFactor - prev) > 0.015) {
    updateBuildingLighting._lastNf = nightFactor;
    for (const key of Object.keys(typeTexData)) {
      updateBuildingFacadeContinuous(typeTexData[key], nightFactor);
    }
  }
}

/** Get current night factor */
export function getNightFactor() {
  return nightFactor;
}

/** Get building lights array for external management */
export function getBuildingLights() {
  return buildingLights;
}
