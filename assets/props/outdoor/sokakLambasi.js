// assets/props/outdoor/sokakLambasi.js — Street Lamp (A-grade)
// Tall street light with CanvasTexture metal pole, decorative arm, lamp housing, and light.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/sokakLambasi.js';

function makePoleTex() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Dark metal pole
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, '#3a3a3a');
  grad.addColorStop(0.3, '#5a5a5a');
  grad.addColorStop(0.5, '#4a4a4a');
  grad.addColorStop(0.7, '#555555');
  grad.addColorStop(1, '#353535');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle seam line
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeLampHousingTex() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.6);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glass panel
  ctx.fillStyle = 'rgba(255,250,230,0.6)';
  ctx.fillRect(8, 4, canvas.width - 16, canvas.height - 8);

  // Frame lines
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 4, canvas.width - 16, canvas.height - 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedPole = null, cachedHousing = null;
function getPoleTex() { if (!cachedPole) cachedPole = makePoleTex(); return cachedPole; }
function getHousingTex() { if (!cachedHousing) cachedHousing = makeLampHousingTex(); return cachedHousing; }

export function createSokakLambasi() {
  const group = new THREE.Group();
  group.name = 'SokakLambasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sokak Lambası';

  const poleMat = new THREE.MeshLambertMaterial({ map: getPoleTex() });
  const housingMat = new THREE.MeshLambertMaterial({ map: getHousingTex() });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });

  // Main pole (tapered)
  const pole = cylMesh(0.08, 0.14, 6.5, 12, poleMat);
  pole.position.set(0, 3.25, 0);
  pole.userData.sourceFile = SRC;
  group.add(pole);

  // Base flange
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 16), darkMat);
  flange.position.set(0, 0.04, 0);
  flange.userData.sourceFile = SRC;
  group.add(flange);

  // Base cover plate
  const basePlate = boxMesh(0.35, 0.03, 0.35, darkMat);
  basePlate.position.set(0, 0.015, 0);
  basePlate.userData.sourceFile = SRC;
  group.add(basePlate);

  // Decorative ring near top
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 12), darkMat);
  ring.position.set(0, 6.3, 0);
  ring.userData.sourceFile = SRC;
  group.add(ring);

  // Arm (curved bracket)
  const arm = boxMesh(1.6, 0.08, 0.25, poleMat);
  arm.position.set(-0.7, 6.85, 0);
  arm.userData.sourceFile = SRC;
  group.add(arm);

  // Arm decorative curl
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 8, Math.PI), darkMat);
  curl.position.set(-1.2, 6.86, 0);
  curl.rotation.y = Math.PI / 2;
  curl.userData.sourceFile = SRC;
  group.add(curl);

  // Lamp housing
  const housing = boxMesh(0.5, 0.18, 0.35, housingMat);
  housing.position.set(-1.35, 6.65, 0);
  housing.userData.sourceFile = SRC;
  group.add(housing);

  // Housing top cap
  const topCap = boxMesh(0.54, 0.03, 0.38, darkMat);
  topCap.position.set(-1.35, 6.75, 0);
  topCap.userData.sourceFile = SRC;
  group.add(topCap);

  // Bottom glass diffuser panel
  const diffuserMat = new THREE.MeshLambertMaterial({ color: 0xfff8e8, transparent: true, opacity: 0.5 });
  const diffuser = boxMesh(0.46, 0.04, 0.31, diffuserMat);
  diffuser.position.set(-1.35, 6.55, 0);
  diffuser.userData.sourceFile = SRC;
  group.add(diffuser);

  // Point light
  const light = new THREE.PointLight(0xfff5e6, 0.6, 25);
  light.position.set(-1.35, 6.6, 0);
  light.castShadow = false;
  light.userData.sourceFile = SRC;
  group.add(light);

  // Access panel on pole
  const panel = boxMesh(0.06, 0.25, 0.02, darkMat);
  panel.position.set(0, 1.2, 0.12);
  panel.userData.sourceFile = SRC;
  group.add(panel);

  return group;
}
