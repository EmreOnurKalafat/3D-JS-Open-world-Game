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
import { generateCity, updateWorld, cityData, updateBuildingTexturesForPhase, updateBuildingLighting } from '/client/world.js';

// --- Global state ---
const DAY_CYCLE_DURATION = 20 * 60; // 20 real minutes for full cycle
let scene, camera, renderer;
let skySphere, sunLight, hemisphereLight, moonLight;
let ambientLight;
let sunMesh;
let clouds = [];
let clock = new THREE.Clock();
let dayPhase = 'day';
let isPointerLocked = false;

// --- FPS counter ---
let fpsEl;
let smoothedFPS = 60;
let frameCount = 0;
let lastFPSTime = performance.now();

// --- Digital clock ---
let clockTimeEl, clockPhaseLabel;
let timeOffset = 1050; // start at 21:00 night — lights visible immediately
const PHASE_LABELS = { day: 'Gündüz', night: 'Gece', sunset: 'Gün Batımı', dawn: 'Şafak' };

// --- Freecam state ---
let freecamActive = false;
let freecamYaw = 0;
let freecamPitch = 0;
const freecamKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
const FREECAM_SPEED = 50;
const FREECAM_FAST_MULT = 3;
let savedCamera = null;

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
  // Renderer — tuned for GTX 1050
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;        // No shadows — biggest GPU saver
  renderer.toneMapping = THREE.NoToneMapping;
  document.body.prepend(renderer.domElement);
  renderer.domElement.id = 'gameCanvas';

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 150, 480);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 900);
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

  // Directional sun light (no shadows for performance)
  sunLight = new THREE.DirectionalLight(0xFFF5E0, 1.0);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Moonlight — blue-white fill at night
  moonLight = new THREE.DirectionalLight(0x8899CC, 0);
  moonLight.position.set(-50, 80, -30);
  moonLight.castShadow = false;
  scene.add(moonLight);
}

/**
 * Builds the sky dome sphere with procedural gradient texture
 */
function initSky() {
  const geo = new THREE.SphereGeometry(550, 32, 32);
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
 * Creates the visual sun disc that moves across the sky
 */
function initSun() {
  const sunGeo = new THREE.SphereGeometry(10, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff8dc });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.visible = false;
  scene.add(sunMesh);

  // Glow halo
  const glowGeo = new THREE.SphereGeometry(20, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  sunMesh.add(glowMesh);
}

/**
 * Creates animated cloud groups scattered across the sky
 */
function initClouds() {
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xf0f0f0,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const flatBottomMat = new THREE.MeshLambertMaterial({
    color: 0xd8d8d8,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });

  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group();

    // Cloud position — scattered in a ring above the city
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 300;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = 140 + Math.random() * 180;

    // Number of puffs in this cloud
    const puffCount = 2 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffCount; p++) {
      const r = 8 + Math.random() * 18;
      const geo = new THREE.SphereGeometry(r, 7, 5);
      const mesh = new THREE.Mesh(geo, cloudMat);
      mesh.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 35
      );
      mesh.scale.set(1, 0.4 + Math.random() * 0.3, 1);
      group.add(mesh);
    }

    // Flat bottom shadow
    const flatGeo = new THREE.SphereGeometry(20 + Math.random() * 15, 8, 4);
    const flatMesh = new THREE.Mesh(flatGeo, flatBottomMat);
    flatMesh.position.y -= 6;
    flatMesh.scale.set(1.2, 0.15, 1.2);
    group.add(flatMesh);

    group.position.set(x, y, z);
    group.userData = {
      speed: 1 + Math.random() * 4,
      baseX: x,
      baseZ: z,
      amplitude: 2 + Math.random() * 8,
      offset: Math.random() * Math.PI * 2,
    };

    scene.add(group);
    clouds.push(group);
  }
}

/**
 * Animates cloud drift and bobbing
 * @param {number} delta — frame time in seconds
 * @param {number} elapsed — total elapsed seconds
 */
function updateClouds(delta, elapsed) {
  for (const cloud of clouds) {
    const d = cloud.userData;
    // Drift in a slow circle
    cloud.position.x = d.baseX + Math.sin(elapsed * 0.03 + d.offset) * d.amplitude * 5;
    cloud.position.z = d.baseZ + Math.cos(elapsed * 0.04 + d.offset) * d.amplitude * 5;
    // Gentle bob
    cloud.position.y += Math.sin(elapsed * 0.5 + d.offset) * 0.2 * delta;
  }
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
 * Determines the day phase and sun intensity based on game hour (realistic mapping).
 * Dawn: 06:00-07:00 | Day: 07:00-19:00 | Sunset: 19:00-20:00 | Night: 20:00-06:00
 * @param {number} wrappedSeconds — cycle time 0..DAY_CYCLE_DURATION
 * @returns {{ phase: string, intensity: number }}
 */
function computeDayPhase(wrappedSeconds) {
  const gameHour = (wrappedSeconds / DAY_CYCLE_DURATION) * 24; // 0..24

  let phase;
  let intensity;

  if (gameHour < 5) {
    // 00:00-05:00 — deep night
    phase = 'night';
    intensity = 0.15;
  } else if (gameHour < 6) {
    // 05:00-06:00 — night → dawn transition
    phase = 'dawn';
    intensity = lerp(0.15, 0.3, (gameHour - 5) / 1);
  } else if (gameHour < 7) {
    // 06:00-07:00 — dawn
    phase = 'dawn';
    intensity = lerp(0.3, 0.8, (gameHour - 6) / 1);
  } else if (gameHour < 19) {
    // 07:00-19:00 — day
    phase = 'day';
    intensity = 1.0;
  } else if (gameHour < 20) {
    // 19:00-20:00 — sunset
    phase = 'sunset';
    intensity = lerp(1.0, 0.6, (gameHour - 19) / 1);
  } else if (gameHour < 21) {
    // 20:00-21:00 — sunset → night transition
    phase = 'night';
    intensity = lerp(0.6, 0.15, (gameHour - 20) / 1);
  } else {
    // 21:00-24:00 — night
    phase = 'night';
    intensity = 0.15;
  }

  return { phase, intensity };
}

/**
 * Computes a smooth nightFactor (0=day, 1=night) from the game hour.
 * Used to drive building window lights and emissive glow continuously.
 */
function computeNightFactor(gameHour) {
  if (gameHour >= 21 || gameHour < 5) return 1.0;
  if (gameHour >= 7 && gameHour < 19) return 0.0;
  if (gameHour >= 5 && gameHour < 7) return 1.0 - (gameHour - 5) / 2;    // dawn fade-out
  if (gameHour >= 19 && gameHour < 21) return (gameHour - 19) / 2;         // sunset fade-in
  return 0;
}

/**
 * Moves the visual sun and directional light along a realistic east→south→west arc.
 * Sunrise 06:00 — East horizon. Noon 12:30 — South at 55° elevation. Sunset 19:00 — West horizon.
 * @param {number} gameHour — 0..24 in-game hour
 */
function updateSunPosition(gameHour) {
  if (!sunMesh) return;

  const sunrise = 6, sunset = 19;

  if (gameHour >= sunrise && gameHour <= sunset) {
    sunMesh.visible = true;

    // 0 at sunrise → 1 at sunset
    const t = (gameHour - sunrise) / (sunset - sunrise);

    // Azimuth: East (0) → South (π/2) → West (π)
    const azimuth = t * Math.PI;

    // Elevation: 0 at horizon → π/2 directly overhead at noon
    const elevation = Math.sin(t * Math.PI) * (Math.PI / 2);

    const R = 500;
    const x = R * Math.cos(elevation) * Math.cos(azimuth);  // East
    const y = R * Math.sin(elevation);                       // Height
    const z = -R * Math.cos(elevation) * Math.sin(azimuth); // South (neg = southward)

    sunMesh.position.set(x, y, z);
    sunLight.position.copy(sunMesh.position);
  } else {
    sunMesh.visible = false;
  }
}

/**
 * Updates the day/night cycle based on elapsed real time
 * @param {number} elapsed — seconds since game start
 */
function updateDayNight(wrappedSeconds) {
  const { phase, intensity } = computeDayPhase(wrappedSeconds);
  const gameHour = (wrappedSeconds / DAY_CYCLE_DURATION) * 24;

  // Continuous building lighting — window glow + point lights
  const nightFactor = computeNightFactor(gameHour);
  updateBuildingLighting(nightFactor);

  if (phase !== dayPhase) {
    dayPhase = phase;
    skySphere.material.map = makeSkyGradient(phase);
    skySphere.material.needsUpdate = true;

    const fogColors = { day: 0x87CEEB, sunset: 0xf4a261, night: 0x0a0a1a, dawn: 0xf4a261 };
    scene.fog.color.set(fogColors[phase]);
    scene.background = new THREE.Color(fogColors[phase]);

    // Discrete phase-change texture update (kept for backward compat)
    updateBuildingTexturesForPhase(phase);
  }

  updateSunPosition(gameHour);

  sunLight.intensity = intensity;
  moonLight.intensity = nightFactor * 1.8;

  const ambientVal = phase === 'night' ? 0.15 : 0.4;
  ambientLight.intensity = ambientVal;
  hemisphereLight.intensity = phase === 'night' ? 0.10 : 0.6;
}

/**
 * Toggles freecam mode
 */
function toggleFreecam() {
  freecamActive = !freecamActive;
  if (freecamActive) {
    // Save current camera state
    savedCamera = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
    };
    // Set initial freecam angles from current camera
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    freecamYaw = Math.atan2(dir.x, dir.z);
    freecamPitch = Math.asin(dir.y);
    // Release pointer lock
    if (isPointerLocked) {
      document.exitPointerLock();
    }
    console.log('[FREECAM] Enabled — WASD move, Q/E up/down, Shift boost, U to exit');
  } else {
    // Restore saved camera
    if (savedCamera) {
      camera.position.copy(savedCamera.position);
      camera.quaternion.copy(savedCamera.quaternion);
    }
    freecamKeys.w = freecamKeys.a = freecamKeys.s = freecamKeys.d = false;
    freecamKeys.q = freecamKeys.e = freecamKeys.shift = false;
    console.log('[FREECAM] Disabled');
  }
}

/**
 * Updates freecam movement based on input
 * @param {number} delta — frame time in seconds
 */
function updateFreecam(delta) {
  if (!freecamActive) return;

  const speed = FREECAM_SPEED * (freecamKeys.shift ? FREECAM_FAST_MULT : 1) * delta;

  // Movement relative to camera direction (on XZ plane)
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

  // Apply rotation
  const euler = new THREE.Euler(freecamPitch, freecamYaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
}

/**
 * Mouse move handler for freecam rotation
 */
function onMouseMove(event) {
  if (!freecamActive) return;
  freecamYaw -= event.movementX * 0.002;
  freecamPitch -= event.movementY * 0.002;
  freecamPitch = clamp(freecamPitch, -Math.PI / 2, Math.PI / 2);
}

/**
 * Key up handler for freecam keys
 */
function onKeyUp(event) {
  const k = event.key.toLowerCase();
  if (k in freecamKeys) {
    freecamKeys[k] = false;
  }
}

/**
 * Main update — dispatches delta to each game system in order
 * @param {number} delta — frame time in seconds
 */
function update(delta, elapsed) {
  try {
    if (freecamActive) {
      updateFreecam(delta);
    } else {
      stepPhysics(delta);
    }
    updateWorld(elapsed);  // Animated water

    // Update chunk visibility based on camera
    if (cityData.chunkMgr) {
      cityData.chunkMgr.update(camera.position);
    }
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
    const effectiveElapsed = performance.now() / 1000 + timeOffset;

    // FPS tracking
    frameCount++;
    const now = performance.now();
    if (now - lastFPSTime >= 1000) {
      const rawFPS = frameCount / ((now - lastFPSTime) / 1000);
      smoothedFPS = 0.9 * smoothedFPS + 0.1 * rawFPS;
      const displayFPS = Math.round(smoothedFPS);
      fpsEl.textContent = displayFPS + ' FPS';
      fpsEl.style.color = displayFPS >= 55 ? '#0f0' : displayFPS >= 30 ? '#ff0' : '#f00';
      frameCount = 0;
      lastFPSTime = now;
    }

    // Day/night cycle + clock — both derive from the same effectiveElapsed
    const wrapped = ((effectiveElapsed % DAY_CYCLE_DURATION) + DAY_CYCLE_DURATION) % DAY_CYCLE_DURATION;
    updateDayNight(wrapped);

    const gameHour = (wrapped / DAY_CYCLE_DURATION) * 24;
    const h = Math.floor(gameHour) % 24;
    const m = Math.floor((gameHour * 60) % 60);
    clockTimeEl.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    clockPhaseLabel.textContent = PHASE_LABELS[dayPhase] || dayPhase;

    update(delta, wrapped);

    updateClouds(delta, effectiveElapsed);

    renderer.render(scene, camera);

    // Debug: log draw calls every 3 seconds
    const sec = Math.floor(performance.now() / 1000);
    if (sec % 3 === 0 && sec !== gameLoop._lastLog) {
      gameLoop._lastLog = sec;
      console.log('[DEBUG] Draw calls:', renderer.info.render.calls,
        'Triangles:', renderer.info.render.triangles);
    }
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
  boxMesh.castShadow = false;
  boxMesh.receiveShadow = false;
  scene.add(boxMesh);

  const body = createBodyBox(1, 1, 1, 1, { x: pos.x, y: pos.y, z: pos.z });
  body.linearDamping = 0.05;
  bindMeshToBody(boxMesh, body);
}

/**
 * Keyboard handler for debug and test keys
 */
function onKeyDown(event) {
  // U = toggle freecam
  if (event.key === 'u' || event.key === 'U') {
    toggleFreecam();
    return;
  }

  // Freecam movement keys
  if (freecamActive) {
    const k = event.key.toLowerCase();
    if (k in freecamKeys) {
      freecamKeys[k] = true;
      return;
    }
    if (event.key === 'Shift') {
      freecamKeys.shift = true;
      return;
    }
    // K/L = rewind / fast-forward 1 game hour (50 real seconds)
    if (k === 'k') {
      timeOffset = Math.max(timeOffset - 50, -DAY_CYCLE_DURATION);
      console.log('[TIME] -1h — offset:', timeOffset, 's');
      return;
    }
    if (k === 'l') {
      timeOffset = Math.min(timeOffset + 50, DAY_CYCLE_DURATION);
      console.log('[TIME] +1h — offset:', timeOffset, 's');
      return;
    }
    return; // Block other keys during freecam
  }

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

  // FPS counter DOM element
  fpsEl = document.createElement('div');
  fpsEl.id = 'fpsCounter';
  fpsEl.style.cssText = 'position:fixed;top:8px;left:8px;z-index:1000;'
    + 'font-family:monospace;font-size:14px;color:#0f0;'
    + 'background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:4px;'
    + 'pointer-events:none;';
  fpsEl.textContent = '60 FPS';
  document.body.appendChild(fpsEl);

  // Digital clock
  clockTimeEl = document.createElement('div');
  clockTimeEl.id = 'gameClock';
  clockTimeEl.style.cssText = 'position:fixed;top:8px;right:8px;z-index:1000;'
    + 'font-family:monospace;font-size:20px;color:#ffffff;'
    + 'background:rgba(0,0,0,0.6);padding:4px 10px;border-radius:4px;'
    + 'pointer-events:none;letter-spacing:2px;';
  clockTimeEl.textContent = '12:00';
  document.body.appendChild(clockTimeEl);

  clockPhaseLabel = document.createElement('div');
  clockPhaseLabel.id = 'clockPhaseLabel';
  clockPhaseLabel.style.cssText = 'position:fixed;top:44px;right:8px;z-index:1000;'
    + 'font-family:monospace;font-size:14px;color:#ffffff;'
    + 'text-align:center;pointer-events:none;'
    + 'background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px;';
  clockPhaseLabel.textContent = 'Gündüz';
  document.body.appendChild(clockPhaseLabel);

  initLights();
  initSky();
  initSun();
  initClouds();

  // Physics world first (city needs it for building collisions)
  initPhysicsWorld();
  createGroundPlane();

  // Generate the city
  generateCity(scene);

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
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
