// client/core/renderManager.js — Scene, camera, renderer, lights, sky setup

import * as THREE from 'three';
import { lerp } from '../../shared/utils.js';
import { makeSkyGradient } from '../builders/textureBuilder.js';

// --- Global render state ---
export const DAY_CYCLE_DURATION = 20 * 60;
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
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 150, 480);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(0, 80, 100);
  camera.lookAt(0, 0, 0);
}

export function initLights() {
  ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3D2B1F, 0.6);
  scene.add(hemisphereLight);

  sunLight = new THREE.DirectionalLight(0xFFF5E0, 1.0);
  sunLight.position.set(100, 150, 50);
  sunLight.castShadow = false;
  scene.add(sunLight);

  moonLight = new THREE.DirectionalLight(0x8899CC, 0);
  moonLight.position.set(-50, 80, -30);
  moonLight.castShadow = false;
  scene.add(moonLight);
}

export function initSky() {
  const geo = new THREE.SphereGeometry(550, 32, 32);
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
  const sunGeo = new THREE.SphereGeometry(10, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff8dc });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.visible = false;
  scene.add(sunMesh);

  const glowGeo = new THREE.SphereGeometry(20, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66, transparent: true, opacity: 0.15, depthWrite: false,
  });
  sunMesh.add(new THREE.Mesh(glowGeo, glowMat));
}

export function initClouds() {
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xf0f0f0, transparent: true, opacity: 0.75, depthWrite: false,
  });
  const flatBottomMat = new THREE.MeshLambertMaterial({
    color: 0xd8d8d8, transparent: true, opacity: 0.45, depthWrite: false,
  });

  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group();

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 300;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = 140 + Math.random() * 180;

    const puffCount = 2 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffCount; p++) {
      const r = 8 + Math.random() * 18;
      const geo = new THREE.SphereGeometry(r, 7, 5);
      const mesh = new THREE.Mesh(geo, cloudMat);
      mesh.position.set((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 35);
      mesh.scale.set(1, 0.4 + Math.random() * 0.3, 1);
      group.add(mesh);
    }

    const flatGeo = new THREE.SphereGeometry(20 + Math.random() * 15, 8, 4);
    const flatMesh = new THREE.Mesh(flatGeo, flatBottomMat);
    flatMesh.position.y -= 6;
    flatMesh.scale.set(1.2, 0.15, 1.2);
    group.add(flatMesh);

    group.position.set(x, y, z);
    group.userData = {
      speed: 1 + Math.random() * 4, baseX: x, baseZ: z,
      amplitude: 2 + Math.random() * 8, offset: Math.random() * Math.PI * 2,
    };

    scene.add(group);
    clouds.push(group);
  }
}

export function updateClouds(delta, elapsed) {
  for (const cloud of clouds) {
    const d = cloud.userData;
    cloud.position.x = d.baseX + Math.sin(elapsed * 0.03 + d.offset) * d.amplitude * 5;
    cloud.position.z = d.baseZ + Math.cos(elapsed * 0.04 + d.offset) * d.amplitude * 5;
    cloud.position.y += Math.sin(elapsed * 0.5 + d.offset) * 0.2 * delta;
  }
}

export function initGround() {
  const geo = new THREE.PlaneGeometry(600, 600);
  const mat = new THREE.MeshLambertMaterial({ color: 0x3D2B1F });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function computeDayPhase(wrappedSeconds) {
  const gameHour = (wrappedSeconds / DAY_CYCLE_DURATION) * 24;
  let phase, intensity;

  if (gameHour < 5)            { phase = 'night'; intensity = 0.15; }
  else if (gameHour < 6)       { phase = 'dawn';  intensity = lerp(0.15, 0.3, (gameHour - 5) / 1); }
  else if (gameHour < 7)       { phase = 'dawn';  intensity = lerp(0.3, 0.8, (gameHour - 6) / 1); }
  else if (gameHour < 19)      { phase = 'day';   intensity = 1.0; }
  else if (gameHour < 20)      { phase = 'sunset';intensity = lerp(1.0, 0.6, (gameHour - 19) / 1); }
  else if (gameHour < 21)      { phase = 'night'; intensity = lerp(0.6, 0.15, (gameHour - 20) / 1); }
  else                          { phase = 'night'; intensity = 0.15; }

  return { phase, intensity };
}

export function computeNightFactor(gameHour) {
  if (gameHour >= 21 || gameHour < 5) return 1.0;
  if (gameHour >= 7 && gameHour < 19) return 0.0;
  if (gameHour >= 5 && gameHour < 7) return 1.0 - (gameHour - 5) / 2;
  if (gameHour >= 19 && gameHour < 21) return (gameHour - 19) / 2;
  return 0;
}

export function updateSunPosition(gameHour) {
  if (!sunMesh) return;
  const sunrise = 6, sunset = 19;

  if (gameHour >= sunrise && gameHour <= sunset) {
    sunMesh.visible = true;
    const t = (gameHour - sunrise) / (sunset - sunrise);
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
