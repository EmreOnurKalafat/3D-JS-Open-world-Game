// client/main.js — Scene init, game loop, day/night cycle, system orchestration

import * as THREE from 'three';
import { lerp, clamp } from '/client/utils.js';
import { makeSkyGradient } from '/client/textureBuilder.js';
import {
  initPhysicsWorld,
  createGroundPlane,
  createBodyBox,
  bindMeshToBody,
  stepPhysics,
  toggleDebug,
} from '/client/physics.js';
import { generateCity, updateWorld } from '/client/world.js';

// --- Global state ---
const DAY_CYCLE_DURATION = 20 * 60; // 20 real minutes for full cycle
let scene, camera, renderer;
let skySphere, sunLight, hemisphereLight;
let ambientLight;
let fillLights = [];
let clock = new THREE.Clock();
let dayPhase = 'day';
let isPointerLocked = false;

// --- Stub placeholders for future phases ---
const stubSystems = {
  player: () => {},
  vehicle: () => {},
  combat: () => {},
  npc: () => {},
  police: () => {},
  economy: () => {},
  particles: () => {},
  audio: () => {},
  network: () => {},
  hud: () => {},
  minimap: () => {},
};

/**
 * Initialises the Three.js scene, renderer and camera
 */
function initScene() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.body.prepend(renderer.domElement);
  renderer.domElement.id = 'gameCanvas';

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 200, 500);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 80, 100);
  camera.lookAt(0, 0, 0);
}

/**
 * Sets up all scene lights — hemisphere, directional sun, fill point lights
 */
function initLights() {
  // Ambient fill
  ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  // Hemisphere — sky blue above, dark brown below
  hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3D2B1F, 0.6);
  scene.add(hemisphereLight);

  // Directional sun light (shadow-casting)
  sunLight = new THREE.DirectionalLight(0xFFF5E0, 1.0);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  // Fill point lights at city corners
  const corners = [
    [-200, 10, -200],
    [200, 10, -200],
    [-200, 10, 200],
    [200, 10, 200],
  ];
  for (const [x, y, z] of corners) {
    const light = new THREE.PointLight(0x8888cc, 0.3, 120);
    light.position.set(x, y, z);
    light.castShadow = false;
    scene.add(light);
    fillLights.push(light);
  }
}

/**
 * Builds the sky dome sphere with procedural gradient texture
 */
function initSky() {
  const geo = new THREE.SphereGeometry(300, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    map: makeSkyGradient('day'),
    side: THREE.BackSide,
    depthWrite: false,
  });
  skySphere = new THREE.Mesh(geo, mat);
  skySphere.scale.y = -1; // Invert so we see inside
  scene.add(skySphere);
}

/**
 * Creates a temporary ground plane for visual reference
 */
function initGround() {
  const geo = new THREE.PlaneGeometry(600, 600);
  const mat = new THREE.MeshLambertMaterial({ color: 0x3D2B1F });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
}

/**
 * Determines the day phase and sun intensity based on elapsed time
 * @param {number} elapsedSeconds — Total elapsed real seconds since game start
 * @returns {{ phase: string, intensity: number }}
 */
function computeDayPhase(elapsedSeconds) {
  const t = (elapsedSeconds % DAY_CYCLE_DURATION) / DAY_CYCLE_DURATION; // 0..1

  let phase;
  let intensity;

  if (t < 0.05) {
    phase = 'dawn';
    intensity = lerp(0.15, 0.3, t / 0.05);
  } else if (t < 0.35) {
    phase = 'day';
    intensity = 1.0;
  } else if (t < 0.45) {
    phase = 'sunset';
    intensity = lerp(1.0, 0.6, (t - 0.35) / 0.1);
  } else if (t < 0.55) {
    phase = 'night';
    intensity = lerp(0.6, 0.15, (t - 0.45) / 0.1);
  } else if (t < 0.95) {
    phase = 'night';
    intensity = 0.15;
  } else if (t < 1.0) {
    phase = 'dawn';
    intensity = lerp(0.15, 0.3, (t - 0.95) / 0.05);
  } else {
    phase = 'dawn';
    intensity = 0.3;
  }

  return { phase, intensity };
}

/**
 * Updates the day/night cycle based on elapsed real time
 * @param {number} elapsed — seconds since game start
 */
function updateDayNight(elapsed) {
  const { phase, intensity } = computeDayPhase(elapsed);

  if (phase !== dayPhase) {
    dayPhase = phase;
    skySphere.material.map = makeSkyGradient(phase);
    skySphere.material.needsUpdate = true;

    const fogColors = { day: 0x87CEEB, sunset: 0xf4a261, night: 0x0a0a1a, dawn: 0xf4a261 };
    scene.fog.color.set(fogColors[phase]);
    scene.background = new THREE.Color(fogColors[phase]);
  }

  sunLight.intensity = intensity;
  const ambientVal = phase === 'night' ? 0.08 : 0.4;
  ambientLight.intensity = ambientVal;
  hemisphereLight.intensity = phase === 'night' ? 0.05 : 0.6;
}

/**
 * Main update — dispatches delta to each game system in order
 * @param {number} delta — frame time in seconds
 */
function update(delta, elapsed) {
  try {
    stepPhysics(delta);
    updateWorld(elapsed);  // Animated water
    stubSystems.player(delta);
    stubSystems.vehicle(delta);
    stubSystems.combat(delta);
    stubSystems.npc(delta);
    stubSystems.police(delta);
    stubSystems.economy(delta);
    stubSystems.particles(delta);
    stubSystems.audio(delta);
    stubSystems.network(delta);
    stubSystems.hud();
    stubSystems.minimap();
  } catch (err) {
    console.error('[ERROR][main] update loop:', err);
  }
}

/**
 * Main render loop driven by requestAnimationFrame
 */
function gameLoop() {
  requestAnimationFrame(gameLoop);

  try {
    const delta = clamp(clock.getDelta(), 0, 0.05);
    const elapsed = performance.now() / 1000;

    updateDayNight(elapsed);
    update(delta, elapsed);

    renderer.render(scene, camera);
  } catch (err) {
    console.error('[ERROR][main] gameLoop:', err);
  }
}

/**
 * Handles window resize — updates camera aspect and renderer size
 */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Pointer lock change handler
 */
function onPointerLockChange() {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
}

/**
 * Requests pointer lock on canvas click
 */
function onCanvasClick() {
  if (!isPointerLocked) {
    renderer.domElement.requestPointerLock();
  }
}

/**
 * Spawns a test box above the camera for physics verification
 */
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
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  scene.add(boxMesh);

  const body = createBodyBox(1, 1, 1, 1, { x: pos.x, y: pos.y, z: pos.z });
  body.linearDamping = 0.05;
  bindMeshToBody(boxMesh, body);
}

/**
 * Keyboard handler for debug and test keys
 */
function onKeyDown(event) {
  // D = toggle physics debug
  if (event.key === 'd' || event.key === 'D') {
    toggleDebug(scene);
  }
  // P = toggle physics wireframe (same as debug)
  if (event.key === 'p' || event.key === 'P') {
    toggleDebug(scene);
  }
  // F = spawn test box
  if (event.key === 'f' || event.key === 'F') {
    spawnTestBox();
  }
}

// --- Bootstrap ---
function boot() {
  console.log('[BOOT] Starting Phase 3 — Procedural City');
  initScene();
  initLights();
  initSky();

  // Physics world first (city needs it for building collisions)
  initPhysicsWorld();
  createGroundPlane();

  // Generate the city
  generateCity(scene);

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  renderer.domElement.addEventListener('click', onCanvasClick);

  console.log('[BOOT] Scene + Physics ready. Entering game loop.');
  gameLoop();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
