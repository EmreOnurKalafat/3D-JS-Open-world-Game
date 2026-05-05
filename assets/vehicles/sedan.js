// assets/vehicles/sedan.js — Sedan Car Prefab (Realistic)
// Detailed sedan with metallic paint, proper proportions, interior hints.

import * as THREE from 'three';
import { MAT, GEO, boxMesh, cylMesh } from '../resources.js';

const SRC = 'assets/vehicles/sedan.js';

function makeMetallicPaint(baseHue) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  const col = `hsl(${baseHue}, 70%, 45%)`;
  const colDark = `hsl(${baseHue}, 60%, 22%)`;
  const colLight = `hsl(${baseHue}, 55%, 68%)`;
  grad.addColorStop(0, colLight);
  grad.addColorStop(0.35, col);
  grad.addColorStop(0.65, col);
  grad.addColorStop(1, colDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTireTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);

  for (let r = 10; r < size - 10; r += 8) {
    ctx.strokeStyle = 'rgba(40,40,40,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const hubGrad = ctx.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.35);
  hubGrad.addColorStop(0, '#cccccc');
  hubGrad.addColorStop(0.6, '#888888');
  hubGrad.addColorStop(1, '#333333');
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const cx = size / 2 + Math.cos(a) * size * 0.2;
    const cy = size / 2 + Math.sin(a) * size * 0.2;
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const cachedTireTex = makeTireTex();
const tireMat = new THREE.MeshStandardMaterial({ map: cachedTireTex, roughness: 0.85, metalness: 0.1 });

export function createSedan(bodyColor) {
  const hue = bodyColor !== undefined
    ? bodyColor
    : [0, 30, 210, 120, 280, 40][Math.floor(Math.random() * 6)];
  const paintTex = makeMetallicPaint(hue);
  const bodyMat = new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.35, metalness: 0.6 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.5 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.7 });
  const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff1111, roughness: 0.2, emissive: 0x440000, emissiveIntensity: 0.5 });
  const amberMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.2, emissive: 0x331100, emissiveIntensity: 0.4 });
  const interiorMat = new THREE.MeshStandardMaterial({ color: 0x2a2220, roughness: 0.8, metalness: 0.1 });
  const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.2 });

  const group = new THREE.Group();
  group.name = 'Sedan';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Sedan (Gerçekçi)';
  group.userData.paintHue = hue;

  // ── Lower body ──
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.65, 1.85), bodyMat);
  lowerBody.position.set(0.05, 0.55, 0);
  lowerBody.castShadow = true;
  lowerBody.userData.sourceFile = SRC;
  lowerBody.userData.part = 'lowerBody';
  group.add(lowerBody);

  // Door panel gaps (subtle thin lines)
  for (const dx of [-0.7, 0.7]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.42, 1.86), doorGapMat);
    doorLine.position.set(dx, 0.6, 0);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // ── Upper cabin ──
  const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.48, 1.75), bodyMat);
  cabinBase.position.set(-0.15, 1.06, 0);
  cabinBase.castShadow = true;
  cabinBase.userData.sourceFile = SRC;
  cabinBase.userData.part = 'cabinBase';
  group.add(cabinBase);

  // ── Windows ──
  const windshieldF = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 1.6), glassMat);
  windshieldF.position.set(0.9, 1.08, 0);
  windshieldF.rotation.z = 0.55;
  windshieldF.userData.sourceFile = SRC;
  group.add(windshieldF);

  const windshieldR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 1.6), glassMat);
  windshieldR.position.set(-1.15, 1.08, 0);
  windshieldR.rotation.z = -0.45;
  windshieldR.userData.sourceFile = SRC;
  group.add(windshieldR);

  for (const sz of [-0.88, 0.88]) {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.32, 0.02), glassMat);
    sideWin.position.set(-0.15, 1.12, sz);
    sideWin.userData.sourceFile = SRC;
    group.add(sideWin);
  }

  // ── Roof ──
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.7), bodyMat);
  roof.position.set(-0.15, 1.32, 0);
  roof.castShadow = true;
  roof.userData.sourceFile = SRC;
  group.add(roof);

  // ── Hood & Trunk ──
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 1.72), bodyMat);
  hood.position.set(1.2, 0.88, 0);
  hood.userData.sourceFile = SRC;
  group.add(hood);

  const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.72), bodyMat);
  trunk.position.set(-1.3, 0.88, 0);
  trunk.userData.sourceFile = SRC;
  group.add(trunk);

  // ── Front Bumper + Grill ──
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 1.95), trimMat);
  frontBumper.position.set(2.05, 0.35, 0);
  frontBumper.userData.sourceFile = SRC;
  group.add(frontBumper);

  const grillSurround = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 1.45), chromeMat);
  grillSurround.position.set(2.05, 0.55, 0);
  grillSurround.userData.sourceFile = SRC;
  group.add(grillSurround);

  const grillMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 1.35), trimMat);
  grillMesh.position.set(2.09, 0.55, 0);
  grillMesh.userData.sourceFile = SRC;
  group.add(grillMesh);

  // Headlights
  for (const sz of [-0.52, 0.52]) {
    const lightHousing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.38), chromeMat);
    lightHousing.position.set(2.13, 0.58, sz);
    lightHousing.userData.sourceFile = SRC;
    group.add(lightHousing);

    const lightLens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.05, emissive: 0x222200, emissiveIntensity: 0.3 }));
    lightLens.position.set(2.15, 0.58, sz);
    lightLens.userData.sourceFile = SRC;
    group.add(lightLens);
  }

  // Fog lights
  for (const sz of [-0.65, 0.65]) {
    const fogLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 4), amberMat);
    fogLight.position.set(2.06, 0.25, sz);
    fogLight.userData.sourceFile = SRC;
    group.add(fogLight);
  }

  // ── Rear Bumper + Taillights ──
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 1.95), trimMat);
  rearBumper.position.set(-2.05, 0.35, 0);
  rearBumper.userData.sourceFile = SRC;
  group.add(rearBumper);

  for (const sz of [-0.52, 0.52]) {
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.4), redLightMat);
    tailLight.position.set(-2.12, 0.58, sz);
    tailLight.userData.sourceFile = SRC;
    group.add(tailLight);
  }

  // License plates
  const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.3), chromeMat);
  frontPlate.position.set(2.08, 0.35, 0);
  frontPlate.userData.sourceFile = SRC;
  group.add(frontPlate);

  const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.3), chromeMat);
  rearPlate.position.set(-2.08, 0.35, 0);
  rearPlate.userData.sourceFile = SRC;
  group.add(rearPlate);

  // ── Side Mirrors ──
  for (const sz of [-0.95, 0.95]) {
    const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.12), trimMat);
    mirrorArm.position.set(0.55, 1.08, sz);
    mirrorArm.userData.sourceFile = SRC;
    group.add(mirrorArm);

    const mirrorBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.18), bodyMat);
    mirrorBody.position.set(0.55, 1.02, sz * 1.15);
    mirrorBody.userData.sourceFile = SRC;
    group.add(mirrorBody);
  }

  // ── Door Handles ──
  for (const dx of [-0.7, 0.7]) {
    for (const sz of [-0.9, 0.9]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.2), chromeMat);
      handle.position.set(dx, 0.72, sz);
      handle.userData.sourceFile = SRC;
      group.add(handle);
    }
  }

  // ── Interior ──
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 1.5), interiorMat);
  dash.position.set(0.65, 0.85, 0);
  dash.userData.sourceFile = SRC;
  group.add(dash);

  const steerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), trimMat);
  steerCol.position.set(0.55, 0.82, 0.45);
  steerCol.rotation.z = 0.5;
  steerCol.userData.sourceFile = SRC;
  group.add(steerCol);

  const steerRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 12), trimMat);
  steerRing.position.set(0.5, 0.88, 0.45);
  steerRing.userData.sourceFile = SRC;
  group.add(steerRing);

  for (const sz of [-0.35, 0.35]) {
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.45), interiorMat);
    seatBase.position.set(-0.25, 0.6, sz);
    seatBase.userData.sourceFile = SRC;
    group.add(seatBase);

    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), interiorMat);
    seatBack.position.set(-0.45, 0.8, sz);
    seatBack.rotation.z = 0.2;
    seatBack.userData.sourceFile = SRC;
    group.add(seatBack);
  }

  // ── Exhaust ──
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.15, 8), chromeMat);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(-2.1, 0.22, 0.55);
  exhaust.userData.sourceFile = SRC;
  group.add(exhaust);

  // ── Undercarriage ──
  const underbody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 1.5), trimMat);
  underbody.position.set(0, 0.18, 0);
  underbody.userData.sourceFile = SRC;
  group.add(underbody);

  // ── Wheels (CylinderGeometry rotated 90° to be horizontal) ──
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
  const wheelPositions = [
    [1.25, 0.32, 1.0], [1.25, 0.32, -1.0],
    [-1.25, 0.32, 1.0], [-1.25, 0.32, -1.0],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);
  }

  // ── Wheel arches ──
  for (const [wx, wz] of [[1.25, 0.95], [1.25, -0.95], [-1.25, 0.95], [-1.25, -0.95]]) {
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.65), trimMat);
    arch.position.set(wx, 0.9, wz);
    arch.userData.sourceFile = SRC;
    group.add(arch);
  }

  return group;
}
