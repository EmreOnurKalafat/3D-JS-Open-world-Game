// client/core/main.js — Bootstrap, game loop, day/night orchestrator

import * as THREE from 'three';
import { clamp } from '../../shared/utils.js';
import { makeSkyGradient } from '../builders/textureBuilder.js';
import {
  initPhysicsWorld, createGroundPlane, stepPhysics,
} from './physicsManager.js';
import {
  generateCity, updateWorld, cityData,
  updateBuildingTexturesForPhase, updateBuildingLighting,
} from '../zones/world.js';
import {
  initFreecamEditor, updateFreecamEditor, applyDeletions,
} from '../editor/freecamEditor.js';
import {
  scene, camera, renderer, skySphere, sunLight, moonLight, ambientLight,
  hemisphereLight, dayPhase, DAY_CYCLE_DURATION,
  initScene, initLights, initSky, initSun, initClouds,
  initGround, updateClouds, computeDayPhase, computeNightFactor,
  updateSunPosition, onResize,
} from './renderManager.js';
import {
  initCrosshair, initInputHandlers, updateFreecam,
  freecamActive, timeOffset, onKeyDown,
} from './inputManager.js';

// --- UI state ---
const PHASE_LABELS = { day: 'Gündüz', night: 'Gece', sunset: 'Gün Batımı', dawn: 'Şafak' };
let fpsEl, clockTimeEl, clockPhaseLabel;
let smoothedFPS = 60, frameCount = 0, lastFPSTime = performance.now();
let clock = new THREE.Clock();

// --- Stub placeholders for future phases ---
const stubSystems = {
  player: () => {}, vehicle: () => {}, combat: () => {},
  npc: () => {}, police: () => {}, economy: () => {},
  particles: () => {}, audio: () => {}, network: () => {},
  hud: () => {}, minimap: () => {},
};

function updateDayNight(wrappedSeconds) {
  const { phase, intensity } = computeDayPhase(wrappedSeconds);
  const gameHour = (wrappedSeconds / DAY_CYCLE_DURATION) * 24;

  const nightFactor = computeNightFactor(gameHour);
  updateBuildingLighting(nightFactor);

  if (phase !== dayPhase) {
    // update dayPhase via renderManager's export binding
    // We need to update the sky/fog here since we have scene access
    skySphere.material.map = makeSkyGradient(phase);
    skySphere.material.needsUpdate = true;

    const fogColors = { day: 0x87CEEB, sunset: 0xf4a261, night: 0x0a0a1a, dawn: 0xf4a261 };
    scene.fog.color.set(fogColors[phase]);
    scene.background = new THREE.Color(fogColors[phase]);

    updateBuildingTexturesForPhase(phase);
    // Update the exported dayPhase (it's a let binding, we access via renderManager)
  }

  updateSunPosition(gameHour);

  sunLight.intensity = intensity;
  moonLight.intensity = nightFactor * 1.8;

  ambientLight.intensity = phase === 'night' ? 0.15 : 0.4;
  hemisphereLight.intensity = phase === 'night' ? 0.10 : 0.6;

  // Update clock phase label
  if (clockPhaseLabel) {
    clockPhaseLabel.textContent = PHASE_LABELS[phase] || phase;
  }

  return phase;
}

function update(delta, elapsed) {
  try {
    if (freecamActive) {
      updateFreecam(delta);
      updateFreecamEditor();
    } else {
      stepPhysics(delta);
    }
    updateWorld(elapsed);

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

function gameLoop() {
  requestAnimationFrame(gameLoop);

  try {
    const delta = clamp(clock.getDelta(), 0, 0.05);
    const effectiveElapsed = performance.now() / 1000 + timeOffset;

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

    const wrapped = ((effectiveElapsed % DAY_CYCLE_DURATION) + DAY_CYCLE_DURATION) % DAY_CYCLE_DURATION;
    const currentPhase = updateDayNight(wrapped);

    const gameHour = (wrapped / DAY_CYCLE_DURATION) * 24;
    const h = Math.floor(gameHour) % 24;
    const m = Math.floor((gameHour * 60) % 60);
    clockTimeEl.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');

    update(delta, wrapped);
    updateClouds(delta, effectiveElapsed);
    renderer.render(scene, camera);
  } catch (err) {
    console.error('[ERROR][main] gameLoop:', err);
  }
}

function boot() {
  console.log('[BOOT] Starting Phase 3 — Procedural City');
  initScene();

  fpsEl = document.createElement('div');
  fpsEl.id = 'fpsCounter';
  fpsEl.style.cssText = 'position:fixed;top:8px;left:8px;z-index:1000;'
    + 'font-family:monospace;font-size:14px;color:#0f0;'
    + 'background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:4px;pointer-events:none;';
  fpsEl.textContent = '60 FPS';
  document.body.appendChild(fpsEl);

  clockTimeEl = document.createElement('div');
  clockTimeEl.id = 'gameClock';
  clockTimeEl.style.cssText = 'position:fixed;top:8px;right:8px;z-index:1000;'
    + 'font-family:monospace;font-size:20px;color:#fff;'
    + 'background:rgba(0,0,0,0.6);padding:4px 10px;border-radius:4px;pointer-events:none;letter-spacing:2px;';
  clockTimeEl.textContent = '12:00';
  document.body.appendChild(clockTimeEl);

  clockPhaseLabel = document.createElement('div');
  clockPhaseLabel.id = 'clockPhaseLabel';
  clockPhaseLabel.style.cssText = 'position:fixed;top:44px;right:8px;z-index:1000;'
    + 'font-family:monospace;font-size:14px;color:#fff;text-align:center;pointer-events:none;'
    + 'background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px;';
  clockPhaseLabel.textContent = 'Gündüz';
  document.body.appendChild(clockPhaseLabel);

  initLights();
  initSky();
  initSun();
  initClouds();
  initCrosshair();

  initPhysicsWorld();
  createGroundPlane();

  generateCity(scene);

  initFreecamEditor(scene, camera, renderer.domElement);

  applyDeletions();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  initInputHandlers();

  console.log('[BOOT] Scene + Physics ready. Entering game loop.');
  gameLoop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
