// client/core/e2eHooks.js — E2E test API exposed on window.__E2E__
// Activated only when URL contains ?e2e=1
// Provides deterministic access to scene, camera, physics, interiors, objects.

import * as THREE from 'three';
import { scene, camera, renderer } from './renderManager.js';
import { getPhysicsWorld } from './physicsManager.js';
import { cityData } from '../zones/world.js';

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════

let active = false;
let ready = false;
let targetBuildingId = null;
let targetInteriorId = null;
let pendingResolve = null;
const loadedZones = new Set();
const loadedInteriors = new Set();

// Registry populated by zone/building creators during E2E mode
const interiorObjectRegistry = new Map();   // interiorId → [{ id, name, tags, isInteractable, groupRef }]
const interactableRegistry = new Map();      // interiorId → [{ id, position, rangeMin, rangeMax }]
const blueprintRegistry = new Map();         // interiorId → { expectedPositions: { objectId: {pos,quat} } }

// ═══════════════════════════════════════════════════════════
//  ACTIVATION
// ═══════════════════════════════════════════════════════════

export function initE2EHooks() {
  if (typeof window === 'undefined') return;
  if (!window.location.search.includes('e2e=1')) return;

  active = true;
  console.log('[E2E] Hooks activated — window.__E2E__ available');

  window.__E2E__ = {
    // ── Lifecycle ──────────────────────────
    isReady: () => ready,
    waitReady: () => waitReady(),
    bootForE2E,
    shutdown,

    // ── Zone ───────────────────────────────
    waitForZoneLoaded,
    isZoneLoaded,

    // ── Building / Landmark ────────────────
    focusLandmark,
    enterInterior,
    waitForInteriorLoaded,
    isInteriorLoaded,

    // ── Interior objects ───────────────────
    listInteriorObjects,
    getObjectPose,
    getObjectAABB,
    getObjectRenderableStats,
    getInteriorOverlapPairs,
    registerInteriorObject,
    registerInteractable,
    registerBlueprint,

    // ── Player simulation ──────────────────
    probePlayerCapsuleAt,
    listInteractables,
    canInteractAt,

    // ── Camera control ─────────────────────
    setFreeCameraPose,
    setTimeOfDay,
    getSceneStats,

    // ── Console audit ──────────────────────
    getConsoleErrors,
    getAssetLoadErrors,

    // ── Walkable / nav probes ──────────────
    probeWalkableGrid,

    // ── Advanced shot / analysis ───────────
    getObjectBounds,
    waitForAssetsIdle,
    isolateTarget,
    highlightTarget,
    resetVisibility,
    getScreenshotHistogram,
  };

  // Collect console errors during test
  window.__E2E__._errors = [];
  window.__E2E__._assetErrors = [];

  const origError = console.error;
  console.error = function (...args) {
    window.__E2E__._errors.push(args.map(String).join(' '));
    origError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    if (e.message?.includes('404') || e.message?.includes('Failed to load')) {
      window.__E2E__._assetErrors.push(e.message);
    }
  });

  // Mark ready after a short delay (let scene fully bootstrap)
  setTimeout(() => {
    ready = true;
    console.log('[E2E] Ready — scene has %d children', scene.children.length);
  }, 1000);
}

// ═══════════════════════════════════════════════════════════
//  LIFECYCLE
// ═══════════════════════════════════════════════════════════

function waitReady(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (ready) return resolve();
    const start = Date.now();
    const iv = setInterval(() => {
      if (ready) { clearInterval(iv); resolve(); }
      else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        reject(new Error('[E2E] Timeout waiting for scene ready'));
      }
    }, 100);
  });
}

function bootForE2E({ zoneId, buildingId, interiorId, spawn } = {}) {
  targetBuildingId = buildingId || null;
  targetInteriorId = interiorId || null;
  console.log('[E2E] bootForE2E — zone=%s building=%s interior=%s',
    zoneId, buildingId, interiorId);
  return { zoneId, buildingId, interiorId, spawn, sceneReady: ready };
}

function shutdown() {
  active = false;
  ready = false;
  loadedZones.clear();
  loadedInteriors.clear();
  interiorObjectRegistry.clear();
  interactableRegistry.clear();
  blueprintRegistry.clear();
  delete window.__E2E__;
  console.log('[E2E] Shutdown complete');
}

// ═══════════════════════════════════════════════════════════
//  ZONE
// ═══════════════════════════════════════════════════════════

function waitForZoneLoaded(zoneId, timeoutMs = 10000) {
  if (loadedZones.has(zoneId)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const iv = setInterval(() => {
      // Zones are loaded during generateCity — if scene has children, consider ready
      if (scene.children.length > 10) {
        loadedZones.add(zoneId);
        clearInterval(iv);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        reject(new Error(`[E2E] Timeout waiting for zone: ${zoneId}`));
      }
    }, 200);
  });
}

function isZoneLoaded(zoneId) {
  return loadedZones.has(zoneId);
}

// ═══════════════════════════════════════════════════════════
//  BUILDING / LANDMARK
// ═══════════════════════════════════════════════════════════

/** Find a building/landmark group by name/id and return its world position */
function focusLandmark(buildingId) {
  // Search scene for matching group name or userData label
  let found = null;
  scene.traverse((obj) => {
    if (found) return;
    if (obj.name === buildingId || obj.name === `Custom_${buildingId}`) found = obj;
    if (!found && obj.userData?.editorLabel && obj.userData.editorLabel.includes(buildingId)) found = obj;
    // Also check InstancedMesh names for body_ / roof_ matches
    if (!found && obj.isInstancedMesh && obj.name.includes(buildingId)) found = obj;
  });

  if (found) {
    const pos = new THREE.Vector3();
    if (found.isInstancedMesh) {
      const m = new THREE.Matrix4();
      found.getMatrixAt(0, m);
      pos.setFromMatrixPosition(m);
    } else {
      found.getWorldPosition(pos);
    }
    return { position: { x: pos.x, y: pos.y, z: pos.z }, found: true, type: found.type || 'Group', name: found.name };
  }

  // Fallback: search cityData complex groups
  const complexKeys = [
    { key: 'hospitalGroup', name: 'hospital' },
    { key: 'supermarketGroup', name: 'supermarket' },
    { key: 'kiyafetGroup', name: 'kiyafetci_magaza' },
    { key: 'parkingLotGroup', name: 'parkinglot' },
  ];

  for (const { key, name } of complexKeys) {
    const grp = cityData[key];
    if (grp && (buildingId === name || buildingId.includes(name) || name.includes(buildingId))) {
      // Get position from first child with meaningful position
      const pos = new THREE.Vector3();
      const box = new THREE.Box3();
      grp.traverse((c) => {
        if (c.isMesh) box.expandByObject(c);
      });
      if (box.isEmpty()) {
        grp.getWorldPosition(pos);
      } else {
        box.getCenter(pos);
      }
      return { position: { x: pos.x, y: pos.y, z: pos.z }, found: true, type: 'Complex', name };
    }
  }

  // Fallback: search cityData.buildings
  for (const b of cityData.buildings) {
    if (b.type === buildingId) {
      return { position: b.position, found: true, type: b.type, w: b.w, h: b.h, d: b.d };
    }
  }

  return { position: { x: 0, y: 0, z: 0 }, found: false };
}

/** Mark an interior as loaded (call from game code when interior spawns) */
function enterInterior(buildingId) {
  const lm = focusLandmark(buildingId);
  if (lm.found) {
    loadedInteriors.add(buildingId);
  }
  return { entered: lm.found, targetPosition: lm.position };
}

function waitForInteriorLoaded(interiorId, timeoutMs = 5000) {
  if (loadedInteriors.has(interiorId)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const iv = setInterval(() => {
      if (loadedInteriors.has(interiorId)) { clearInterval(iv); resolve(); }
      else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        reject(new Error(`[E2E] Timeout waiting for interior: ${interiorId}`));
      }
    }, 200);
  });
}

function isInteriorLoaded(interiorId) {
  return loadedInteriors.has(interiorId);
}

// ═══════════════════════════════════════════════════════════
//  INTERIOR OBJECTS REGISTRY (populated by game code)
// ═══════════════════════════════════════════════════════════

/** Register an interior object for E2E inspection */
function registerInteriorObject(interiorId, obj) {
  if (!interiorObjectRegistry.has(interiorId)) {
    interiorObjectRegistry.set(interiorId, []);
  }
  const pos = new THREE.Vector3();
  obj.getWorldPosition(pos);
  interiorObjectRegistry.get(interiorId).push({
    id: obj.name || obj.uuid,
    name: obj.userData?.editorLabel || obj.name || 'unnamed',
    tags: obj.userData?.tags || [],
    isInteractable: obj.userData?.isInteractable || false,
    groupRef: obj,
    worldPos: { x: pos.x, y: pos.y, z: pos.z },
  });
}

/** Register an interactable with its interaction range */
function registerInteractable(interiorId, objId, position, rangeMin = 0.8, rangeMax = 2.5) {
  if (!interactableRegistry.has(interiorId)) {
    interactableRegistry.set(interiorId, []);
  }
  interactableRegistry.get(interiorId).push({
    id: objId, position, rangeMin, rangeMax,
  });
}

/** Register expected blueprint positions for a building interior */
function registerBlueprint(interiorId, expectedPositions) {
  blueprintRegistry.set(interiorId, { expectedPositions, tolerance: 0.15 });
}

function listInteriorObjects(interiorId) {
  const objects = interiorObjectRegistry.get(interiorId) || [];

  // If registry is empty, auto-discover meshes from the matching complex group
  if (objects.length === 0) {
    const discovered = [];

    // Map interiorId to the relevant cityData group
    const groupMap = {
      kiyafetci_ic: cityData.kiyafetGroup,
      hospital_ic:  cityData.hospitalGroup,
      market_ic:    cityData.supermarketGroup,
      police_ic:    cityData.policeGroups?.[0],
    };

    const targetGroup = groupMap[interiorId]
      // Also try fuzzy matching
      || (interiorId.includes('kiyafet') ? cityData.kiyafetGroup
        : interiorId.includes('hospital') ? cityData.hospitalGroup
        : interiorId.includes('supermarket') || interiorId.includes('market') ? cityData.supermarketGroup
        : interiorId.includes('police') ? cityData.policeGroups?.[0]
        : null);

    const groupsToScan = targetGroup ? [targetGroup] : [
      cityData.hospitalGroup, cityData.supermarketGroup,
      cityData.kiyafetGroup, ...cityData.policeGroups,
    ].filter(Boolean);

    for (const grp of groupsToScan) {
      grp.traverse((child) => {
        if (discovered.length >= 60) return; // hard cap
        const lbl = child.userData?.editorLabel || '';
        if (!lbl) return;

        // Only collect Groups (prefabs) — skip raw meshes and lights
        if (!child.isGroup) return;
        // Skip markers, lights, containers
        if (child.isPointLight || child.isSpotLight || child.isAmbientLight) return;
        if (child.name?.startsWith('ring_') || child.name?.startsWith('marker')) return;

        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);

        // Deduplicate by label
        if (discovered.some(d => d.name === lbl)) return;

        discovered.push({
          id: child.name || child.uuid,
          name: lbl,
          tags: child.userData?.tags || [],
          isInteractable: child.userData?.isInteractable || false,
          worldPos: { x: pos.x, y: pos.y, z: pos.z },
        });
      });
      if (discovered.length > 0) break; // stop after first group with objects
    }

    return discovered;
  }

  return objects.map(o => ({ id: o.id, name: o.name, tags: o.tags, isInteractable: o.isInteractable, worldPos: o.worldPos }));
}

function getObjectPose(objectId) {
  // Search scene by name/uuid
  let found = null;
  scene.traverse((obj) => {
    if (found) return;
    if (obj.name === objectId || obj.uuid === objectId) found = obj;
    // Also check interior registries
  });

  // Also check registered objects
  for (const [_id, objs] of interiorObjectRegistry) {
    for (const o of objs) {
      if (o.id === objectId) { found = o.groupRef; break; }
    }
    if (found) break;
  }

  if (!found) return null;

  const pos = new THREE.Vector3();
  if (found.getWorldPosition) {
    found.getWorldPosition(pos);
  } else if (found.position) {
    pos.copy(found.position);
  }
  const quat = new THREE.Quaternion();
  if (found.getWorldQuaternion) {
    found.getWorldQuaternion(quat);
  } else if (found.quaternion) {
    quat.copy(found.quaternion);
  }

  return { position: { x: pos.x, y: pos.y, z: pos.z }, quaternion: { x: quat.x, y: quat.y, z: quat.z, w: quat.w } };
}

function getObjectAABB(objectId) {
  const obj = _findObject(objectId);
  if (!obj) return null;

  const box = new THREE.Box3();
  if (obj.isInstancedMesh) {
    box.setFromObject(obj); // approximate
  } else {
    box.setFromObject(obj);
  }

  return {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
    size: { x: box.max.x - box.min.x, y: box.max.y - box.min.y, z: box.max.z - box.min.z },
  };
}

function getObjectRenderableStats(objectId) {
  const obj = _findObject(objectId);
  if (!obj) return null;

  let meshCount = 0;
  let triCount = 0;
  let textureCount = 0;
  let bboxSize = null;

  const colors = [];

  obj.traverse((child) => {
    if (child.isMesh) {
      meshCount++;
      if (child.geometry?.index) {
        triCount += child.geometry.index.count / 3;
      } else if (child.geometry?.attributes?.position) {
        triCount += child.geometry.attributes.position.count / 3;
      }
      if (child.material?.map) textureCount++;
      if (child.material?.color) {
        colors.push('#' + child.material.color.getHexString());
      }
    }
  });

  const aabb = getObjectAABB(objectId);
  if (aabb) bboxSize = aabb.size;

  // Dominant color — pick most frequent
  const colorFreq = {};
  for (const c of colors) {
    colorFreq[c] = (colorFreq[c] || 0) + 1;
  }
  let dominantColor = null;
  let maxFreq = 0;
  for (const [c, f] of Object.entries(colorFreq)) {
    if (f > maxFreq) { dominantColor = c; maxFreq = f; }
  }

  return {
    meshCount,
    triCount: Math.round(triCount),
    textureCount,
    bboxSize,
    dominantColor,
    colors,
  };
}

/** AABB-based overlap detection for registered interior objects */
function getInteriorOverlapPairs(interiorId) {
  const objects = interiorObjectRegistry.get(interiorId) || [];
  const pairs = [];
  const aabbs = [];

  for (const o of objects) {
    const aabb = getObjectAABB(o.id);
    if (aabb) aabbs.push({ id: o.id, aabb });
  }

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      const a = aabbs[i].aabb;
      const b = aabbs[j].aabb;

      const overlapX = Math.max(0, Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x));
      const overlapY = Math.max(0, Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y));
      const overlapZ = Math.max(0, Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z));
      const overlapVolume = overlapX * overlapY * overlapZ;

      if (overlapVolume > 0.001) {
        pairs.push({ a: aabbs[i].id, b: aabbs[j].id, overlapVolumeApprox: overlapVolume });
      }
    }
  }

  return pairs;
}

// ═══════════════════════════════════════════════════════════
//  PLAYER SIMULATION
// ═══════════════════════════════════════════════════════════

function probePlayerCapsuleAt(point) {
  const phys = getPhysicsWorld();
  if (!phys) return { blocked: false, penetrationDepth: 0, reason: 'no physics world' };

  // Simple AABB overlap test against all static bodies in physics
  const capsuleR = 0.4;
  const capsuleH = 1.8;
  const halfH = capsuleH / 2;

  let blocked = false;
  let maxPen = 0;

  for (const body of phys.bodies) {
    if (body.mass !== 0) continue; // only static

    for (const shape of body.shapes) {
      if (!shape.halfExtents) continue;
      const he = shape.halfExtents;
      const bp = body.position;

      // Compute closest point on box to capsule center
      const boxMin = { x: bp.x - he.x, y: bp.y - he.y, z: bp.z - he.z };
      const boxMax = { x: bp.x + he.x, y: bp.y + he.y, z: bp.z + he.z };

      const closest = {
        x: Math.max(boxMin.x, Math.min(point.x, boxMax.x)),
        y: Math.max(boxMin.y, Math.min(point.y + halfH, boxMax.y)),
        z: Math.max(boxMin.z, Math.min(point.z, boxMax.z)),
      };

      const dx = point.x - closest.x;
      const dy = (point.y + halfH) - closest.y;
      const dz = point.z - closest.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < capsuleR) {
        blocked = true;
        maxPen = Math.max(maxPen, capsuleR - dist);
      }
    }
  }

  return { blocked, penetrationDepth: maxPen };
}

function listInteractables(interiorId) {
  return interactableRegistry.get(interiorId) || [];
}

function canInteractAt(objectId, playerPos) {
  // Check all registered interactables
  for (const [_id, interactables] of interactableRegistry) {
    for (const i of interactables) {
      if (i.id === objectId) {
        const dx = playerPos.x - i.position.x;
        const dy = playerPos.y - i.position.y;
        const dz = playerPos.z - i.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return dist >= i.rangeMin && dist <= i.rangeMax;
      }
    }
  }
  // Default: check distance to object
  const pose = getObjectPose(objectId);
  if (!pose) return false;
  const dx = playerPos.x - pose.position.x;
  const dy = playerPos.y - pose.position.y;
  const dz = playerPos.z - pose.position.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return dist >= 0.8 && dist <= 2.5;
}

// ═══════════════════════════════════════════════════════════
//  CAMERA CONTROL
// ═══════════════════════════════════════════════════════════

function setFreeCameraPose(pos, lookAt) {
  camera.position.set(pos.x, pos.y, pos.z);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
}

function setTimeOfDay(preset) {
  // Adjust ambient/directional lights for visibility
  const presets = {
    day:     { ambient: 0.6, sun: 1.5, moon: 0, fog: null },
    night:   { ambient: 0.15, sun: 0, moon: 1.2, fog: null },
    dawn:    { ambient: 0.35, sun: 0.7, moon: 0.3, fog: null },
    midday:  { ambient: 0.8, sun: 2.0, moon: 0, fog: null },
  };

  const cfg = presets[preset] || presets.day;

  scene.traverse((obj) => {
    if (obj.isAmbientLight) { obj.intensity = cfg.ambient; }
    if (obj.isDirectionalLight) {
      if (obj.intensity < 0.3) obj.intensity = cfg.moon;
      else obj.intensity = cfg.sun;
    }
  });
}

function getSceneStats() {
  let meshCount = 0, instancedCount = 0, groupCount = 0;
  scene.traverse((obj) => {
    if (obj.isInstancedMesh) instancedCount++;
    else if (obj.isMesh) meshCount++;
    else if (obj.isGroup) groupCount++;
  });
  return {
    children: scene.children.length,
    meshCount,
    instancedCount,
    groupCount,
    renderCalls: renderer?.info?.render?.calls || 0,
    renderTriangles: renderer?.info?.render?.triangles || 0,
  };
}

function getConsoleErrors() {
  return window.__E2E__?._errors || [];
}

function getAssetLoadErrors() {
  return window.__E2E__?._assetErrors || [];
}

// ═══════════════════════════════════════════════════════════
//  WALKABLE GRID PROBES
// ═══════════════════════════════════════════════════════════

/** Probe a grid of points in a rectangular area for walkability */
function probeWalkableGrid(centerX, centerZ, width, depth, step = 1.5) {
  const results = [];
  const hw = width / 2;
  const hd = depth / 2;

  for (let x = centerX - hw; x <= centerX + hw; x += step) {
    for (let z = centerZ - hd; z <= centerZ + hd; z += step) {
      const probe = probePlayerCapsuleAt({ x, y: 0.01, z });
      results.push({ x, z, blocked: probe.blocked, penetration: probe.penetrationDepth });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
//  ADVANCED SHOT / ANALYSIS
// ═══════════════════════════════════════════════════════════

/** Wraps getObjectAABB to return { center, size } form */
function getObjectBounds(objectId) {
  const aabb = getObjectAABB(objectId);
  if (!aabb) return null;
  return {
    center: {
      x: (aabb.min.x + aabb.max.x) / 2,
      y: (aabb.min.y + aabb.max.y) / 2,
      z: (aabb.min.z + aabb.max.z) / 2,
    },
    size: aabb.size,
  };
}

/** Read renderer canvas pixels and return a 64-bin luminance histogram */
function getScreenshotHistogram() {
  const canvas = renderer.domElement;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const bins = new Array(64).fill(0);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const lum = Math.round((0.299 * r + 0.587 * g + 0.114 * b) / 4); // 0-64 range
    bins[Math.min(63, lum)]++;
  }

  return { bins, totalPixels: pixels.length / 4 };
}

/**
 * Wait until the rendered frame stabilizes (pixel diff < 1% between frames).
 * @param {number} stableMs - Milliseconds to wait between comparison frames
 * @returns {Promise<{stable:boolean, framesChecked:number}>}
 */
function waitForAssetsIdle(stableMs = 500) {
  return new Promise((resolve) => {
    let framesChecked = 0;
    const maxRetries = 5;

    function check() {
      const h1 = getScreenshotHistogram();
      setTimeout(() => {
        const h2 = getScreenshotHistogram();
        framesChecked++;

        let diff = 0;
        for (let i = 0; i < 64; i++) {
          diff += Math.abs(h1.bins[i] - h2.bins[i]);
        }
        const diffPct = diff / h1.totalPixels;

        if (diffPct < 0.01) {
          resolve({ stable: true, framesChecked });
        } else if (framesChecked >= maxRetries) {
          resolve({ stable: false, framesChecked });
        } else {
          setTimeout(check, stableMs * (framesChecked + 1));
        }
      }, stableMs);
    }

    // Force a render first, then start check
    renderer.render(scene, camera);
    requestAnimationFrame(() => check());
  });
}

// Visibility backup for isolateTarget / resetVisibility
const _visibilityStore = new Map();

/** Hide all meshes/groups in scene except target and its ancestors */
function isolateTarget(objectId) {
  const target = _findObject(objectId);
  if (!target) return { isolated: false, reason: 'target not found' };

  _visibilityStore.clear();

  // Collect ancestor chain
  const ancestors = new Set();
  let p = target;
  while (p) {
    ancestors.add(p);
    p = p.parent;
  }

  scene.traverse((child) => {
    if (child === scene || child === camera || ancestors.has(child)) return;
    if (child.isMesh || child.isGroup || child.isInstancedMesh) {
      _visibilityStore.set(child, child.visible);
      child.visible = false;
    }
  });

  return { isolated: true, hiddenCount: _visibilityStore.size };
}

/** Restore all visibility states modified by isolateTarget */
function resetVisibility() {
  let count = 0;
  for (const [obj, wasVisible] of _visibilityStore) {
    obj.visible = wasVisible;
    count++;
  }
  _visibilityStore.clear();
  return { restored: count };
}

/** Create a yellow EdgesGeometry outline around target */
function highlightTarget(objectId) {
  const target = _findObject(objectId);
  if (!target) return { highlighted: false, reason: 'target not found' };

  // Remove previous outline if exists
  if (window.__E2E__?._outlineObj) {
    window.__E2E__._outlineObj.parent?.remove(window.__E2E__._outlineObj);
    if (window.__E2E__._outlineObj.geometry) window.__E2E__._outlineObj.geometry.dispose();
    if (window.__E2E__._outlineObj.material) window.__E2E__._outlineObj.material.dispose();
  }

  // Collect all meshes in target, compute merged edges
  const edgesGroup = new THREE.Group();
  edgesGroup.name = 'e2e_outline';

  target.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const edgesGeo = new THREE.EdgesGeometry(child.geometry, 15);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffdd44, linewidth: 2, depthTest: true });
    const line = new THREE.LineSegments(edgesGeo, lineMat);
    line.position.copy(child.position);
    line.rotation.copy(child.rotation);
    line.scale.copy(child.scale);
    edgesGroup.add(line);
  });

  // Parent outline to target so it inherits its world transform
  target.add(edgesGroup);

  window.__E2E__._outlineObj = edgesGroup;
  return { highlighted: true, outlineId: edgesGroup.uuid };
}

// ═══════════════════════════════════════════════════════════
//  INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════

function _findObject(objectId) {
  let found = null;
  scene.traverse((obj) => {
    if (found) return;
    if (obj.name === objectId || obj.uuid === objectId) found = obj;
  });
  if (!found) {
    for (const [_id, objs] of interiorObjectRegistry) {
      for (const o of objs) {
        if (o.id === objectId) { found = o.groupRef; break; }
      }
      if (found) break;
    }
  }
  // Search cityData complex groups (same lookup as focusLandmark)
  if (!found) {
    const groupMap = {
      hospital:      cityData.hospitalGroup,
      supermarket:   cityData.supermarketGroup,
      kiyafetci_magaza: cityData.kiyafetGroup,
      kiyafet:       cityData.kiyafetGroup,
      parkinglot:    cityData.parkingLotGroup,
      police:        cityData.policeGroups?.[0],
    };
    for (const [key, grp] of Object.entries(groupMap)) {
      if (!grp) continue;
      if (objectId === key || objectId.includes(key) || key.includes(objectId)) {
        found = grp;
        break;
      }
    }
  }
  return found;
}
