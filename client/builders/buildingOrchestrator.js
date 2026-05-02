// client/builders/buildingOrchestrator.js — Building placement orchestration
// placeZoneBuildings, placeCustomBuilding, placeLandmarks.
// All building meshes have userData.sourceFile pointing HERE for freecam editor.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { MAT } from '/assets/resources.js';
import { getPhysicsWorld } from '../core/physicsManager.js';
import { BUILDING_TYPES, getZoneBuildingTypes } from '/config/buildings.js';
import { buildRoofForType } from './buildingRoofBuilder.js';
import { buildEntranceForType } from './buildingEntranceBuilder.js';
import { getTypeTextureData, updateBuildingTexturesForPhase } from './buildingFacadeManager.js';
import { addBuildEntry, buildAllBuildings } from './buildingInstancedManager.js';

const SRC = 'client/builders/buildingOrchestrator.js';

// Re-export for world.js convenience
export { updateBuildingTexturesForPhase };

// ═══════════════════════════════════════════════════════════
//  ZONE-BASED BUILDING PLACEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Place zone-based buildings on a grid.
 * @param {THREE.Scene} scene
 * @param {Object} occ - OccupancyGrid instance
 * @param {Object} opts - { GRID, CELL, WH, HALF, CURB, BUILD_MARGIN, getZone, isSpecialCell }
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

      const primaryType = BUILDING_TYPES[typeNames[0]];
      const dens = primaryType ? (zone === 'downtown_core' ? 0.95 : zone === 'industrial' ? 0.80 : 0.80) : 0.70;
      const nCols = zone === 'industrial' ? 1 : zone === 'downtown_core' || zone === 'downtown' ? 2 : 3;
      const nRows = zone === 'industrial' ? 2 : zone === 'downtown_core' || zone === 'downtown' ? 2 : zone === 'beach' ? 2 : 4;

      const slotW = usable / nCols;
      const slotD = usable / nRows;
      const sx = cx - usable / 2;
      const sz = cz - usable / 2;

      const roadN = cz + HALF, roadS = cz - HALF;
      const roadE = cx + HALF, roadW = cx - HALF;

      for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
          if (Math.random() > dens) continue;

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

          // Road-facing direction
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

  buildAllBuildings(scene);
}

// ═══════════════════════════════════════════════════════════
//  CUSTOM / ONE-OFF BUILDING PLACEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Place a single custom building as an individual Group (not InstancedMesh).
 * @returns {THREE.Group}
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
