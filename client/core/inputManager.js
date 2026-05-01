// client/core/inputManager.js — Keyboard, mouse, freecam input handling

import * as THREE from 'three';
import { clamp } from '../../shared/utils.js';
import { scene, camera, renderer, DAY_CYCLE_DURATION } from './renderManager.js';
import { createBodyBox, bindMeshToBody, toggleDebug } from './physicsManager.js';
import { setFreecamActive, updateFreecamEditor, onFreecamClick, isEditorModalOpen } from '../editor/freecamEditor.js';

// --- Input state ---
export let isPointerLocked = false;
export let freecamActive = false;
export let freecamYaw = 0;
export let freecamPitch = 0;
export let freecamKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
export const FREECAM_SPEED = 20;
export const FREECAM_FAST_MULT = 3;
export let timeOffset = 1050; // start at 21:00 night
let savedCamera = null;
let crosshairEl;

function toggleFreecam() {
  freecamActive = !freecamActive;
  setFreecamActive(freecamActive);
  if (freecamActive) {
    savedCamera = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
    };
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    freecamYaw = Math.atan2(dir.x, dir.z);
    freecamPitch = Math.asin(dir.y);
  } else {
    if (savedCamera) {
      camera.position.copy(savedCamera.position);
      camera.quaternion.copy(savedCamera.quaternion);
    }
    freecamKeys.w = freecamKeys.a = freecamKeys.s = freecamKeys.d = false;
    freecamKeys.q = freecamKeys.e = freecamKeys.shift = false;
  }
}

export function updateFreecam(delta) {
  if (!freecamActive || isEditorModalOpen()) return;

  const speed = FREECAM_SPEED * (freecamKeys.shift ? FREECAM_FAST_MULT : 1) * delta;

  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3(1, 0, 0);
  right.applyQuaternion(camera.quaternion);
  right.y = 0;
  right.normalize();

  if (freecamKeys.w) camera.position.addScaledVector(forward, speed);
  if (freecamKeys.s) camera.position.addScaledVector(forward, -speed);
  if (freecamKeys.a) camera.position.addScaledVector(right, -speed);
  if (freecamKeys.d) camera.position.addScaledVector(right, speed);
  if (freecamKeys.q) camera.position.y -= speed;
  if (freecamKeys.e) camera.position.y += speed;

  const euler = new THREE.Euler(freecamPitch, freecamYaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
}

function onMouseMove(event) {
  if (!freecamActive || isEditorModalOpen()) return;
  freecamYaw -= event.movementX * 0.002;
  freecamPitch -= event.movementY * 0.002;
  freecamPitch = clamp(freecamPitch, -Math.PI / 2, Math.PI / 2);
}

function onKeyUp(event) {
  const k = event.key.toLowerCase();
  if (k in freecamKeys) freecamKeys[k] = false;
}

function spawnTestBox() {
  if (!isPointerLocked) return;
  const pos = camera.position.clone();
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  pos.add(dir.multiplyScalar(5));
  pos.y += 3;

  const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xff4444 })
  );
  boxMesh.castShadow = false;
  boxMesh.receiveShadow = false;
  scene.add(boxMesh);

  const body = createBodyBox(1, 1, 1, 1, { x: pos.x, y: pos.y, z: pos.z });
  body.linearDamping = 0.05;
  bindMeshToBody(boxMesh, body);
}

export function onKeyDown(event) {
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (event.key === 'u' || event.key === 'U') {
    toggleFreecam();
    return;
  }

  if (freecamActive) {
    if (isEditorModalOpen()) return;
    const k = event.key.toLowerCase();
    if (k in freecamKeys) { freecamKeys[k] = true; return; }
    if (event.key === 'Shift') { freecamKeys.shift = true; return; }
    if (k === 'k') { timeOffset = Math.max(timeOffset - 50, -DAY_CYCLE_DURATION); return; }
    if (k === 'l') { timeOffset = Math.min(timeOffset + 50, DAY_CYCLE_DURATION); return; }
    return;
  }

  if (event.key === 'd' || event.key === 'D') toggleDebug(scene);
  if (event.key === 'p' || event.key === 'P') toggleDebug(scene);
  if (event.key === 'f' || event.key === 'F') spawnTestBox();
}

function onPointerLockChange() {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  if (crosshairEl) {
    crosshairEl.style.display = (isPointerLocked || freecamActive) ? 'block' : 'none';
  }
}

function onCanvasClick() {
  if (freecamActive) {
    if (!isPointerLocked) { renderer.domElement.requestPointerLock(); return; }
    onFreecamClick();
    return;
  }
  if (!isPointerLocked) renderer.domElement.requestPointerLock();
}

export function initCrosshair() {
  crosshairEl = document.createElement('div');
  crosshairEl.id = 'crosshair';
  crosshairEl.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;pointer-events:none;display:none;';
  crosshairEl.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" style="display:block;">
      <line x1="12" y1="2"  x2="12" y2="9"  stroke="white" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="12" y1="15" x2="12" y2="22" stroke="white" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="2"  y1="12" x2="9"  y2="12" stroke="white" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="15" y1="12" x2="22" y2="12" stroke="white" stroke-width="2" stroke-opacity="0.9"/>
      <circle cx="12" cy="12" r="1" fill="white" fill-opacity="0.4"/>
    </svg>`;
  document.body.appendChild(crosshairEl);
}

export function initInputHandlers() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  renderer.domElement.addEventListener('click', onCanvasClick);
}
