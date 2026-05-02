// client/core/renderManager.js — Scene, camera, renderer, lights, sky setup
// All configurable values are in data/environment/skyConfig.js.
// Sun and cloud geometry comes from assets/prefabs/environment/ prefabs.

import * as THREE from 'three';
import { lerp } from '../../shared/utils.js';
import { makeSkyGradient } from '../builders/textureBuilder.js';
import { SKY, LIGHT, DAY_CYCLE, GROUND } from '../../data/environment/skyConfig.js';
import { CLOUD } from '../../data/environment/skyConfig.js';
import { createSun } from '../../assets/prefabs/environment/gunes.js';
import { createCloud } from '../../assets/prefabs/environment/bulut.js';

// --- Global render state ---
export const DAY_CYCLE_DURATION = DAY_CYCLE.durationSeconds;
export let scene, camera, renderer;
export let skySphere, sunLight, moonLight, hemisphereLight, ambientLight;
export let sunMesh;
export let clouds = [];
export let dayPhase = 'day';

export function initScene() {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.NoToneMapping;
  document.body.prepend(renderer.domElement);
  renderer.domElement.id = 'gameCanvas';

  scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY.baseColor);
  scene.fog = new THREE.Fog(SKY.fogColor, SKY.fogNear, SKY.fogFar);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(0, 80, 100);
  camera.lookAt(0, 0, 0);
}

export function initLights() {
  ambientLight = new THREE.AmbientLight(LIGHT.ambient.color, LIGHT.ambient.intensity);
  scene.add(ambientLight);

  hemisphereLight = new THREE.HemisphereLight(
    LIGHT.hemisphere.skyColor, LIGHT.hemisphere.groundColor, LIGHT.hemisphere.intensity);
  scene.add(hemisphereLight);

  sunLight = new THREE.DirectionalLight(LIGHT.sun.color, LIGHT.sun.intensity);
  sunLight.position.set(LIGHT.sun.pos.x, LIGHT.sun.pos.y, LIGHT.sun.pos.z);
  sunLight.castShadow = false;
  scene.add(sunLight);

  moonLight = new THREE.DirectionalLight(LIGHT.moon.color, LIGHT.moon.intensity);
  moonLight.position.set(LIGHT.moon.pos.x, LIGHT.moon.pos.y, LIGHT.moon.pos.z);
  moonLight.castShadow = false;
  scene.add(moonLight);
}

export function initSky() {
  const geo = new THREE.SphereGeometry(SKY.radius, SKY.segments, SKY.segments);
  const mat = new THREE.MeshBasicMaterial({
    map: makeSkyGradient('day'),
    side: THREE.BackSide,
    depthWrite: false,
  });
  skySphere = new THREE.Mesh(geo, mat);
  skySphere.scale.y = -1;
  scene.add(skySphere);
}

export function initSun() {
  const group = createSun();
  sunMesh = group;
  sunMesh.visible = false;
  scene.add(sunMesh);
}

export function initClouds() {
  for (let i = 0; i < CLOUD.groupCount; i++) {
    const group = createCloud();
    scene.add(group);
    clouds.push(group);
  }
}

export function updateClouds(delta, elapsed) {
  for (const cloud of clouds) {
    const d = cloud.userData;
    cloud.position.x = d.baseX + Math.sin(elapsed * CLOUD.animFreqXZ + d.offset) * d.amplitude * CLOUD.amplitudeMultiplier;
    cloud.position.z = d.baseZ + Math.cos(elapsed * CLOUD.animFreqXZCos + d.offset) * d.amplitude * CLOUD.amplitudeMultiplier;
    cloud.position.y += Math.sin(elapsed * CLOUD.animFreqY + d.offset) * CLOUD.animYDelta * delta;
  }
}

export function initGround() {
  const geo = new THREE.PlaneGeometry(GROUND.size, GROUND.size);
  const mat = new THREE.MeshLambertMaterial({ color: GROUND.color });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function computeDayPhase(wrappedSeconds) {
  const gameHour = (wrappedSeconds / DAY_CYCLE.durationSeconds) * 24;

  for (const p of DAY_CYCLE.phases) {
    if (gameHour >= p.start && gameHour < p.end) {
      const t = (gameHour - p.start) / (p.end - p.start);
      return { phase: p.phase, intensity: lerp(p.iStart, p.iEnd, t) };
    }
  }
  return { phase: 'night', intensity: 0.15 };
}

export function computeNightFactor(gameHour) {
  if (gameHour >= DAY_CYCLE.nightStart || gameHour < DAY_CYCLE.nightEnd) return 1.0;
  if (gameHour >= DAY_CYCLE.dayStart && gameHour < DAY_CYCLE.dayEnd) return 0.0;
  if (gameHour >= DAY_CYCLE.nightEnd && gameHour < DAY_CYCLE.dayStart)
    return 1.0 - (gameHour - DAY_CYCLE.nightEnd) / (DAY_CYCLE.dayStart - DAY_CYCLE.nightEnd);
  if (gameHour >= DAY_CYCLE.dayEnd && gameHour < DAY_CYCLE.nightStart)
    return (gameHour - DAY_CYCLE.dayEnd) / (DAY_CYCLE.nightStart - DAY_CYCLE.dayEnd);
  return 0;
}

export function updateSunPosition(gameHour) {
  if (!sunMesh) return;

  if (gameHour >= DAY_CYCLE.sunrise && gameHour <= DAY_CYCLE.sunset) {
    sunMesh.visible = true;
    const t = (gameHour - DAY_CYCLE.sunrise) / (DAY_CYCLE.sunset - DAY_CYCLE.sunrise);
    const azimuth = t * Math.PI;
    const elevation = Math.sin(t * Math.PI) * (Math.PI / 2);
    const R = 500;
    const x = R * Math.cos(elevation) * Math.cos(azimuth);
    const y = R * Math.sin(elevation);
    const z = -R * Math.cos(elevation) * Math.sin(azimuth);
    sunMesh.position.set(x, y, z);
    sunLight.position.copy(sunMesh.position);
  } else {
    sunMesh.visible = false;
  }
}

export function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
