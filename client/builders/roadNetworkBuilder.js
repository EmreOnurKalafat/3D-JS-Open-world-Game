// client/builders/roadNetworkBuilder.js — Road network, sidewalks, markings
// Complete road infrastructure builder with deferred merge/instanced systems.
// userData.sourceFile = SRC on all created meshes for freecam editor.
//
// Pattern: Read config from data/roads/roadNetworkConfig.js →
//          Accept grid params → build all road geometry data →
//          batch into merged meshes + InstancedMesh (crosswalks) → scene.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeSidewalkTexture } from './textureBuilder.js';
import { ROAD as RD, SIDEWALK, BLOCK_FILL, MARKING, CROSSWALK } from '../../data/roads/roadNetworkConfig.js';

const SRC = 'client/builders/roadNetworkBuilder.js';

// ═══════ Deferred merge system ═══════
const mergeGroups = new Map();

function addMerge(key, material, geometry, position, quaternion, scale) {
  if (!mergeGroups.has(key)) mergeGroups.set(key, { material, entries: [] });
  mergeGroups.get(key).entries.push({
    geometry: geometry.clone(),
    position: position.clone(),
    quaternion: quaternion.clone(),
    scale: scale.clone(),
  });
}

function buildMerged(scene) {
  for (const [key, group] of mergeGroups) {
    if (group.entries.length === 0) continue;
    const geos = group.entries.map(e => {
      const g = e.geometry;
      g.applyMatrix4(new THREE.Matrix4().compose(e.position, e.quaternion, e.scale));
      return g;
    });
    const merged = mergeGeometries(geos);
    const mesh = new THREE.Mesh(merged, group.material);
    mesh.receiveShadow = true;
    mesh.name = key;
    mesh.userData.sourceFile = SRC;
    mesh.userData.editorLabel = `Road: ${key}`;
    scene.add(mesh);
  }
  mergeGroups.clear();
}

// ═══════ Deferred instanced system (crosswalks) ═══════
const instGroups = new Map();

function addInstance(key, geometry, material, position, quaternion, scale, color = null) {
  if (!instGroups.has(key)) instGroups.set(key, { geometry: geometry.clone(), material, entries: [] });
  instGroups.get(key).entries.push({ position: position.clone(), quaternion: quaternion.clone(), scale: scale.clone(), color });
}

function buildInstanced(scene) {
  for (const [key, group] of instGroups) {
    if (group.entries.length === 0) continue;
    const im = new THREE.InstancedMesh(group.geometry, group.material, group.entries.length);
    const dummy = new THREE.Object3D();
    group.entries.forEach((e, i) => {
      dummy.position.copy(e.position);
      dummy.quaternion.copy(e.quaternion);
      dummy.scale.copy(e.scale);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      if (e.color) im.setColorAt(i, e.color);
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.name = key;
    im.userData.sourceFile = SRC;
    im.userData.editorLabel = `Road marking: ${key}`;
    scene.add(im);
  }
  instGroups.clear();
}

// ═══════ Derived mark Y ═══════
const MARK_Y = RD.yOffset + RD.height / 2 + 0.001;

function createRoads(opts) {
  const { GRID, CELL, WH, ROAD_WIDTH, EXT } = opts;
  const extOff = EXT / 2;
  const extW = -WH - extOff, extE = WH + extOff;
  const extS = -WH - extOff, extN = WH + extOff;
  const roadMat = new THREE.MeshLambertMaterial({ color: RD.color });

  // X-axis roads
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH, x2 = (col + 1) * CELL - WH;
      addMerge('roadX', roadMat,
        new THREE.BoxGeometry(x2 - x1, RD.height, ROAD_WIDTH),
        new THREE.Vector3((x1 + x2) / 2, RD.yOffset, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const cxE of [extW, extE])
      addMerge('roadX', roadMat, new THREE.BoxGeometry(EXT, RD.height, ROAD_WIDTH),
        new THREE.Vector3(cxE, RD.yOffset, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // Z-axis roads
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH, z2 = (row + 1) * CELL - WH;
      addMerge('roadZ', roadMat,
        new THREE.BoxGeometry(ROAD_WIDTH, RD.height, z2 - z1),
        new THREE.Vector3(x, RD.yOffset, (z1 + z2) / 2), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const czE of [extS, extN])
      addMerge('roadZ', roadMat, new THREE.BoxGeometry(ROAD_WIDTH, RD.height, EXT),
        new THREE.Vector3(x, RD.yOffset, czE), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }
}

function createBlockFill(opts) {
  const { GRID, CELL, WH, BLOCK, HALF } = opts;
  const fillMat = new THREE.MeshLambertMaterial({ color: BLOCK_FILL.fillColor });
  const asphaltFillMat = new THREE.MeshLambertMaterial({ color: BLOCK_FILL.asphaltFillColor });
  const geo = new THREE.PlaneGeometry(BLOCK, BLOCK);

  for (let row = 0; row < GRID; row++) {
    if (row === 0) continue;
    for (let col = 0; col < GRID; col++) {
      if (row === Math.floor(GRID / 2) && col === Math.floor(GRID / 2)) continue;
      const cx = col * CELL - WH + HALF, cz = row * CELL - WH + HALF;
      const isSpecial = opts.isSpecialCell(row, col);
      addMerge(isSpecial ? 'fill_asphalt' : 'fill', isSpecial ? asphaltFillMat : fillMat, geo,
        new THREE.Vector3(cx, 0.01, cz),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
        new THREE.Vector3(1, 1, 1));
    }
  }
}

function createSidewalks(opts) {
  const { GRID, CELL, WH, ROAD_WIDTH, SW, EXT } = opts;
  const h = SIDEWALK.height;
  const extOff = EXT / 2;

  const swTex = makeSidewalkTexture();
  swTex.wrapS = THREE.RepeatWrapping;
  swTex.wrapT = THREE.RepeatWrapping;
  const swMat = new THREE.MeshLambertMaterial({ map: swTex });

  // X-road sidewalks
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH + ROAD_WIDTH / 2, x2 = (col + 1) * CELL - WH - ROAD_WIDTH / 2;
      const cx = (x1 + x2) / 2, segLen = x2 - x1;
      for (const side of [-1, 1])
        addMerge('swX', swMat, new THREE.BoxGeometry(segLen, h, SW),
          new THREE.Vector3(cx, h / 2, z + side * (ROAD_WIDTH / 2 + SW / 2)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    const extW = -WH + ROAD_WIDTH / 2 - extOff, extE = WH - ROAD_WIDTH / 2 + extOff;
    for (const cxE of [extW, extE])
      for (const side of [-1, 1])
        addMerge('swX', swMat, new THREE.BoxGeometry(EXT, h, SW),
          new THREE.Vector3(cxE, h / 2, z + side * (ROAD_WIDTH / 2 + SW / 2)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // Z-road sidewalks
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH + ROAD_WIDTH / 2, z2 = (row + 1) * CELL - WH - ROAD_WIDTH / 2;
      const cz = (z1 + z2) / 2, segLen = z2 - z1;
      for (const side of [-1, 1])
        addMerge('swZ', swMat, new THREE.BoxGeometry(SW, h, segLen),
          new THREE.Vector3(x + side * (ROAD_WIDTH / 2 + SW / 2), h / 2, cz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    const extS = -WH + ROAD_WIDTH / 2 - extOff, extN = WH - ROAD_WIDTH / 2 + extOff;
    for (const czE of [extS, extN])
      for (const side of [-1, 1])
        addMerge('swZ', swMat, new THREE.BoxGeometry(SW, h, EXT),
          new THREE.Vector3(x + side * (ROAD_WIDTH / 2 + SW / 2), h / 2, czE), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // Corner fill squares
  const cornerGeo = new THREE.BoxGeometry(SW, h, SW);
  for (let row = 0; row <= GRID; row++)
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;
      for (const [cx, cz] of [[ix - ROAD_WIDTH / 2 - SW / 2, iz - ROAD_WIDTH / 2 - SW / 2],
        [ix - ROAD_WIDTH / 2 - SW / 2, iz + ROAD_WIDTH / 2 + SW / 2],
        [ix + ROAD_WIDTH / 2 + SW / 2, iz - ROAD_WIDTH / 2 - SW / 2],
        [ix + ROAD_WIDTH / 2 + SW / 2, iz + ROAD_WIDTH / 2 + SW / 2]])
        addMerge('swCorner', swMat, cornerGeo, new THREE.Vector3(cx, h / 2, cz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
}

function createRoadMarkings(opts) {
  const { GRID, CELL, WH, ROAD_WIDTH, EXT } = opts;
  const extOff = EXT / 2;
  const extW = -WH + ROAD_WIDTH / 2 - extOff, extE = WH - ROAD_WIDTH / 2 + extOff;
  const extS = -WH + ROAD_WIDTH / 2 - extOff, extN = WH - ROAD_WIDTH / 2 + extOff;

  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, depthWrite: true });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, depthWrite: true });

  // Yellow X center lines
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (let col = 0; col < GRID; col++) {
      const x1 = col * CELL - WH + ROAD_WIDTH / 2, x2 = (col + 1) * CELL - WH - ROAD_WIDTH / 2;
      addMerge('yellowX', yellowMat, new THREE.BoxGeometry(x2 - x1, MARKING.thickness, MARKING.yellowWidth),
        new THREE.Vector3((x1 + x2) / 2, MARK_Y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const cxE of [extW, extE])
      addMerge('yellowX', yellowMat, new THREE.BoxGeometry(EXT, MARKING.thickness, MARKING.yellowWidth),
        new THREE.Vector3(cxE, MARK_Y, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // Yellow Z center lines
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (let row = 0; row < GRID; row++) {
      const z1 = row * CELL - WH + ROAD_WIDTH / 2, z2 = (row + 1) * CELL - WH - ROAD_WIDTH / 2;
      addMerge('yellowZ', yellowMat, new THREE.BoxGeometry(MARKING.yellowWidth, MARKING.thickness, z2 - z1),
        new THREE.Vector3(x, MARK_Y + MARKING.zBias, (z1 + z2) / 2), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
    for (const czE of [extS, extN])
      addMerge('yellowZ', yellowMat, new THREE.BoxGeometry(MARKING.yellowWidth, MARKING.thickness, EXT),
        new THREE.Vector3(x, MARK_Y + MARKING.zBias, czE), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  }

  // White X edge lines
  for (let row = 0; row <= GRID; row++) {
    const z = row * CELL - WH;
    for (const side of [-1, 1]) {
      for (let col = 0; col < GRID; col++) {
        const x1 = col * CELL - WH + ROAD_WIDTH / 2, x2 = (col + 1) * CELL - WH - ROAD_WIDTH / 2;
        addMerge('whiteX', whiteMat, new THREE.BoxGeometry(x2 - x1, MARKING.thickness, MARKING.whiteWidth),
          new THREE.Vector3((x1 + x2) / 2, MARK_Y, z + side * (ROAD_WIDTH / 2 - MARKING.whiteEdgeOffset)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
      for (const cxE of [extW, extE])
        addMerge('whiteX', whiteMat, new THREE.BoxGeometry(EXT, MARKING.thickness, MARKING.whiteWidth),
          new THREE.Vector3(cxE, MARK_Y, z + side * (ROAD_WIDTH / 2 - MARKING.whiteEdgeOffset)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
  }

  // White Z edge lines
  for (let col = 0; col <= GRID; col++) {
    const x = col * CELL - WH;
    for (const side of [-1, 1]) {
      for (let row = 0; row < GRID; row++) {
        const z1 = row * CELL - WH + ROAD_WIDTH / 2, z2 = (row + 1) * CELL - WH - ROAD_WIDTH / 2;
        addMerge('whiteZ', whiteMat, new THREE.BoxGeometry(MARKING.whiteWidth, MARKING.thickness, z2 - z1),
          new THREE.Vector3(x + side * (ROAD_WIDTH / 2 - MARKING.whiteEdgeOffset), MARK_Y + MARKING.zBias, (z1 + z2) / 2), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
      for (const czE of [extS, extN])
        addMerge('whiteZ', whiteMat, new THREE.BoxGeometry(MARKING.whiteWidth, MARKING.thickness, EXT),
          new THREE.Vector3(x + side * (ROAD_WIDTH / 2 - MARKING.whiteEdgeOffset), MARK_Y + MARKING.zBias, czE), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    }
  }

  // ── Crosswalks (InstancedMesh stripes) ──
  const cwY = MARK_Y + 0.001;
  const cwStripeGeo = new THREE.BoxGeometry(ROAD_WIDTH, MARKING.thickness, CROSSWALK.stripeWidth);
  const cwStripeGeoZ = new THREE.BoxGeometry(CROSSWALK.stripeWidth, MARKING.thickness, ROAD_WIDTH);
  const cwOff = ROAD_WIDTH / 2 + CROSSWALK.curbOffset;

  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const ix = col * CELL - WH, iz = row * CELL - WH;
      for (let s = 0; s < CROSSWALK.count; s++) {
        const zS = iz - cwOff - (CROSSWALK.count - 1) * CROSSWALK.spacing / 2 + s * CROSSWALK.spacing;
        const zN = iz + cwOff - (CROSSWALK.count - 1) * CROSSWALK.spacing / 2 + s * CROSSWALK.spacing;
        addInstance('crosswalk', cwStripeGeo, whiteMat, new THREE.Vector3(ix, cwY, zS), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        addInstance('crosswalk', cwStripeGeo, whiteMat, new THREE.Vector3(ix, cwY, zN), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));

        const xW = ix - cwOff - (CROSSWALK.count - 1) * CROSSWALK.spacing / 2 + s * CROSSWALK.spacing;
        const xE = ix + cwOff - (CROSSWALK.count - 1) * CROSSWALK.spacing / 2 + s * CROSSWALK.spacing;
        addInstance('crosswalkZ', cwStripeGeoZ, whiteMat, new THREE.Vector3(xW, cwY, iz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        addInstance('crosswalkZ', cwStripeGeoZ, whiteMat, new THREE.Vector3(xE, cwY, iz), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      }
    }
  }
}

// ═══════ MAIN EXPORT ═══════

/**
 * Build complete road network: roads, sidewalks, block fills, markings, crosswalks.
 * All meshes have userData.sourceFile = 'client/builders/roadNetworkBuilder.js'.
 *
 * @param {THREE.Scene} scene
 * @param {Object} opts
 * @param {number} opts.GRID       — grid size
 * @param {number} opts.BLOCK      — block size (world units)
 * @param {number} opts.ROAD       — road width (passed as ROAD_WIDTH to avoid config collision)
 * @param {number} opts.CELL       — BLOCK + ROAD
 * @param {number} opts.HALF       — CELL / 2
 * @param {number} opts.WH         — (GRID/2) * CELL
 * @param {number} opts.SW         — sidewalk width
 * @param {number} opts.EXT        — extension beyond grid edge
 * @param {Function} opts.isSpecialCell — (row,col) => true if cell should use asphalt fill
 */
export function buildRoadNetwork(scene, opts) {
  // Rename ROAD → ROAD_WIDTH in opts to avoid collision with config import
  const roadOpts = { ...opts, ROAD_WIDTH: opts.ROAD };
  createRoads(roadOpts);
  createBlockFill(roadOpts);
  createSidewalks(roadOpts);
  createRoadMarkings(roadOpts);
  buildMerged(scene);
  buildInstanced(scene);
}
