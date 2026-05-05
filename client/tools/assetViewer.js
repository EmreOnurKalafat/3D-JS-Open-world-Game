// client/tools/assetViewer.js — Asset Viewer bootstrapper
// Isolated minimal scene with grey ground, full lighting, freecam, and asset spawning.

import * as THREE from 'three';
import { clamp } from '../../shared/utils.js';
import { LIGHT, DAY_CYCLE } from '/config/environment.js';

// Expose THREE globally for E2E page.evaluate access
window.THREE = THREE;
import {
  scene, camera, renderer, sunLight, moonLight, ambientLight,
  hemisphereLight, sunMesh, DAY_CYCLE_DURATION,
  initScene, initLights, computeDayPhase, computeNightFactor,
  updateSunPosition,
} from '../core/renderManager.js';
import { initPhysicsWorld } from '../core/physicsManager.js';
import { initUI, showToast, highlightAsset } from './assetViewerUI.js';
import { ASSET_CATALOG } from './assetRegistry.js';

// --- Module state ---
let freecamActive = false;
let freecamYaw = 0;
let freecamPitch = 0;
const freecamKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
const FREECAM_SPEED = 20;
const FREECAM_FAST_MULT = 3;
let currentAssetGroup = null;

// -- Stubs for complex factories --
const stubPhysicsWorld = { addBody: () => {} };
const stubOcc = { fill: () => {} };
const stubCityData = { buildings: [], policeGroups: [], buildingLights: [] };

// ═══════════════════════════════════════════════ SCENE SETUP

function setupScene() {
  initScene();
  scene.background = new THREE.Color(0x7a7a7a);
  scene.fog = null;
  initLights();
  initPhysicsWorld();
  camera.position.set(0, 12, 20);
  camera.lookAt(0, 0, 0);
}

function makeCheckerTexture(size, sqCount) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const sq = size / sqCount;
  for (let r = 0; r < sqCount; r++) {
    for (let c = 0; c < sqCount; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#8a8a8a' : '#767676';
      ctx.fillRect(c * sq, r * sq, sq, sq);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function createViewerGround() {
  const geo = new THREE.PlaneGeometry(100, 100);
  const mat = new THREE.MeshLambertMaterial({ map: makeCheckerTexture(512, 16) });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  ground.userData.isViewerGround = true;
  ground.name = 'ViewerGround';
  scene.add(ground);
}

function createSpawnMarker() {
  const ringGeo = new THREE.RingGeometry(0.9, 1.1, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffdd44, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  ring.name = 'SpawnMarker';
  scene.add(ring);
}

// ═══════════════════════════════════════════════ FREECAM

function toggleFreecam() {
  freecamActive = !freecamActive;
  if (freecamActive) {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    freecamYaw = Math.atan2(dir.x, dir.z);
    freecamPitch = Math.asin(clamp(dir.y, -1, 1));
    renderer.domElement.requestPointerLock();
  } else {
    if (document.pointerLockElement) document.exitPointerLock();
  }
  Object.keys(freecamKeys).forEach(k => freecamKeys[k] = false);
}

function updateFreecam(delta) {
  if (!freecamActive) return;

  const speed = FREECAM_SPEED * (freecamKeys.shift ? FREECAM_FAST_MULT : 1) * delta;

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0;
  if (forward.length() > 0.001) forward.normalize();

  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0;
  if (right.length() > 0.001) right.normalize();

  if (freecamKeys.w) camera.position.addScaledVector(forward, speed);
  if (freecamKeys.s) camera.position.addScaledVector(forward, -speed);
  if (freecamKeys.a) camera.position.addScaledVector(right, -speed);
  if (freecamKeys.d) camera.position.addScaledVector(right, speed);
  if (freecamKeys.q) camera.position.y -= speed;
  if (freecamKeys.e) camera.position.y += speed;

  const euler = new THREE.Euler(freecamPitch, freecamYaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
}

// ═══════════════════════════════════════════════ DAY/NIGHT CYCLE

function updateDayNight(wrappedSeconds) {
  const { phase, intensity } = computeDayPhase(wrappedSeconds);
  const gameHour = (wrappedSeconds / DAY_CYCLE_DURATION) * 24;

  updateSunPosition(gameHour);

  sunLight.intensity = intensity;
  moonLight.intensity = computeNightFactor(gameHour) * 1.8;
  ambientLight.intensity = phase === 'night' ? 0.15 : LIGHT.ambient.intensity;
  hemisphereLight.intensity = phase === 'night' ? 0.10 : LIGHT.hemisphere.intensity;
}

// ═══════════════════════════════════════════════ ASSET SPAWNING

function removeCurrentAsset() {
  if (!currentAssetGroup) return;
  scene.remove(currentAssetGroup);
  disposeRecursive(currentAssetGroup);
  currentAssetGroup = null;
}

function disposeRecursive(obj) {
  obj.traverse((child) => {
    if (child.geometry) {
      // Only dispose non-shared geometries. Shared ones (GEO.*) have userData.isShared.
      if (!child.geometry.userData?.isShared && !child.geometry._shared) {
        child.geometry.dispose();
      }
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => disposeMaterial(m));
      } else {
        disposeMaterial(child.material);
      }
    }
  });
}

function disposeMaterial(mat) {
  if (mat._shared) return;
  for (const key of Object.keys(mat)) {
    const v = mat[key];
    if (v && v.isTexture) {
      v.dispose();
    }
  }
  mat.dispose();
}

async function spawnAsset(entry) {
  removeCurrentAsset();

  showToast(`Loading: ${entry.turkishLabel}`, '#f9e2af');
  try {
    const mod = await import(/* @vite-ignore */ entry.filePath);

    let group;
    if (entry.callStrategy === 'standalone') {
      const factory = mod[entry.exportName];
      const result = entry.defaultArgs !== undefined ? factory(entry.defaultArgs) : factory();
      group = result;
    } else if (entry.callStrategy === 'withScene') {
      const factory = mod[entry.exportName];
      const result = factory(scene, stubPhysicsWorld, false);
      group = result.group;
    } else if (entry.callStrategy === 'withSceneAndOcc') {
      const before = new Set(scene.children);
      const factory = mod[entry.exportName];
      factory(scene, stubOcc, stubCityData, false);
      const after = scene.children.filter(c => !before.has(c));
      group = new THREE.Group();
      group.name = 'police-wrapper';
      for (const c of after) {
        scene.remove(c);
        group.add(c);
      }
    }

    if (!group) {
      showToast('Asset returned no group', '#f38ba8');
      return;
    }

    // Center on origin and ground-align
    group.updateMatrixWorld();
    const bbox = new THREE.Box3().setFromObject(group);
    if (!bbox.isEmpty()) {
      const cx = (bbox.min.x + bbox.max.x) / 2;
      const cz = (bbox.min.z + bbox.max.z) / 2;
      group.position.set(-cx, -bbox.min.y, -cz);
    } else {
      group.position.set(0, 0, 0);
    }

    if (entry.defaultScale && entry.defaultScale !== 1.0) {
      group.scale.setScalar(entry.defaultScale);
    }

    scene.add(group);
    currentAssetGroup = group;
    if (window.__E2E__) window.__E2E__._currentGroup = group;
    highlightAsset(entry.id);
    showToast(`Loaded: ${entry.turkishLabel}`, '#a6e3a1');
  } catch (err) {
    console.error('[AssetViewer] Spawn error:', err);
    showToast(`Error: ${err.message}`, '#f38ba8');
  }
}

// ═══════════════════════════════════════════════ INPUT

function isFocusInUI() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
}

function onKeyDown(e) {
  if (isFocusInUI()) return;

  if (e.key === 'u' || e.key === 'U') {
    toggleFreecam();
    return;
  }

  if (!freecamActive) return;

  const k = e.key.toLowerCase();
  if (k in freecamKeys) freecamKeys[k] = true;
  if (e.key === 'Shift') freecamKeys.shift = true;
}

function onKeyUp(e) {
  if (isFocusInUI()) return;

  const k = e.key.toLowerCase();
  if (k in freecamKeys) freecamKeys[k] = false;
  if (e.key === 'Shift') freecamKeys.shift = false;
}

function onMouseMove(e) {
  if (!freecamActive || !document.pointerLockElement) return;
  freecamYaw -= e.movementX * 0.002;
  freecamPitch -= e.movementY * 0.002;
  freecamPitch = clamp(freecamPitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
}

function onCanvasClick() {
  if (freecamActive && !document.pointerLockElement) {
    renderer.domElement.requestPointerLock();
  }
}

function onPointerLockChange() {
  if (document.pointerLockElement) {
    console.log('[AssetViewer] Pointer locked — mouse look active');
  } else if (freecamActive) {
    console.log('[AssetViewer] Pointer lost — click canvas to regain mouse look');
  }
}

// ═══════════════════════════════════════════════ BOOT & LOOP

function gameLoop() {
  const clock = new THREE.Clock();
  requestAnimationFrame(function loop() {
    requestAnimationFrame(loop);
    const delta = clamp(clock.getDelta(), 0, 0.05);
    const elapsed = performance.now() / 1000;
    const wrapped = ((elapsed % DAY_CYCLE_DURATION) + DAY_CYCLE_DURATION) % DAY_CYCLE_DURATION;

    updateDayNight(wrapped);
    updateFreecam(delta);
    renderer.render(scene, camera);
  });
}

function boot() {
  setupScene();
  createViewerGround();
  createSpawnMarker();
  initUI(ASSET_CATALOG, spawnAsset);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  renderer.domElement.addEventListener('click', onCanvasClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  // Activate E2E hooks when running in test mode
  if (window.location.search.includes('e2e=1')) {
    import('../core/e2eHooks.js').then(m => m.initE2EHooks());
  }

  console.log('[AssetViewer] Ready — %d assets catalogued', ASSET_CATALOG.length);
  gameLoop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
