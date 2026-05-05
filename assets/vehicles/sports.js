// assets/vehicles/sports.js — Sports Car Prefab (Realistic)
// Low-profile, wide stance, aerodynamic details, mid-engine proportions.

import * as THREE from 'three';

const SRC = 'assets/vehicles/sports.js';

function makeMetallicPaint(baseHue) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  const col = `hsl(${baseHue}, 80%, 42%)`;
  const colDark = `hsl(${baseHue}, 70%, 18%)`;
  const colLight = `hsl(${baseHue}, 60%, 65%)`;
  grad.addColorStop(0, colLight);
  grad.addColorStop(0.3, col);
  grad.addColorStop(0.7, col);
  grad.addColorStop(1, colDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.05 });

export function createSports(bodyColor) {
  const hue = bodyColor !== undefined
    ? bodyColor
    : [0, 35, 55, 200, 300, 15][Math.floor(Math.random() * 6)];
  const paintTex = makeMetallicPaint(hue);
  const bodyMat = new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.3, metalness: 0.7 });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.25, metalness: 0.4 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x152530, roughness: 0.03, metalness: 0.3, transparent: true, opacity: 0.65 });
  const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.15, emissive: 0x550000, emissiveIntensity: 0.6 });
  const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.7, metalness: 0.2 });
  const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.2 });

  const group = new THREE.Group();
  group.name = 'SportsCar';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Spor Araba (Gerçekçi)';
  group.userData.paintHue = hue;

  // ── Main body ──
  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.5, 2.05), bodyMat);
  mainBody.position.set(0, 0.38, 0);
  mainBody.castShadow = true;
  mainBody.userData.sourceFile = SRC;
  group.add(mainBody);

  // Door gaps
  for (const dx of [-0.6, 0.6]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.35, 2.06), doorGapMat);
    doorLine.position.set(dx, 0.44, 0);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // ── Nose cone ──
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 1.7), bodyMat);
  nose.position.set(2.15, 0.28, 0);
  nose.userData.sourceFile = SRC;
  group.add(nose);

  // ── Cabin ──
  const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.85), bodyMat);
  cabinBase.position.set(-0.35, 0.75, 0);
  cabinBase.castShadow = true;
  cabinBase.userData.sourceFile = SRC;
  group.add(cabinBase);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 1.7), glassMat);
  windshield.position.set(0.45, 0.8, 0);
  windshield.rotation.z = 0.5;
  windshield.userData.sourceFile = SRC;
  group.add(windshield);

  const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 1.7), glassMat);
  rearWindow.position.set(-1.1, 0.78, 0);
  rearWindow.rotation.z = -0.4;
  rearWindow.userData.sourceFile = SRC;
  group.add(rearWindow);

  for (const sz of [-0.92, 0.92]) {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 0.02), glassMat);
    sideWin.position.set(-0.15, 0.8, sz);
    sideWin.userData.sourceFile = SRC;
    group.add(sideWin);
  }

  // ── Roof ──
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 1.8), bodyMat);
  roof.position.set(-0.35, 0.96, 0);
  roof.userData.sourceFile = SRC;
  group.add(roof);

  // ── Rear deck / engine cover ──
  const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 1.85), bodyMat);
  rearDeck.position.set(-1.55, 0.6, 0);
  rearDeck.userData.sourceFile = SRC;
  group.add(rearDeck);

  for (let i = 0; i < 3; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 1.6), carbonMat);
    vent.position.set(-1.8 + i * 0.2, 0.64, 0);
    vent.userData.sourceFile = SRC;
    group.add(vent);
  }

  // ── Side air intakes ──
  for (const sz of [-1.02, 1.02]) {
    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.04), carbonMat);
    intake.position.set(-0.9, 0.35, sz);
    intake.userData.sourceFile = SRC;
    group.add(intake);
  }

  // ── Front splitter ──
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 2.1), carbonMat);
  splitter.position.set(2.2, 0.1, 0);
  splitter.userData.sourceFile = SRC;
  group.add(splitter);

  for (const sz of [-0.6, 0, 0.6]) {
    const stay = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), trimMat);
    stay.position.set(2.05, 0.13, sz);
    stay.userData.sourceFile = SRC;
    group.add(stay);
  }

  // ── Rear diffuser ──
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 1.8), carbonMat);
  diffuser.position.set(-2.15, 0.12, 0);
  diffuser.userData.sourceFile = SRC;
  group.add(diffuser);

  // ── Rear spoiler ──
  for (const sz of [-0.7, 0.7]) {
    const spoilerStand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.06), carbonMat);
    spoilerStand.position.set(-1.9, 0.72, sz);
    spoilerStand.userData.sourceFile = SRC;
    group.add(spoilerStand);
  }
  const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 2.2), carbonMat);
  spoilerWing.position.set(-1.9, 0.84, 0);
  spoilerWing.userData.sourceFile = SRC;
  group.add(spoilerWing);

  // ── Side skirts ──
  for (const sz of [-1.03, 1.03]) {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 0.06), carbonMat);
    skirt.position.set(0, 0.16, sz);
    skirt.userData.sourceFile = SRC;
    group.add(skirt);
  }

  // ── Headlights ──
  for (const sz of [-0.5, 0.5]) {
    const lightHousing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.35), chromeMat);
    lightHousing.position.set(2.18, 0.32, sz);
    lightHousing.rotation.z = -0.1;
    lightHousing.userData.sourceFile = SRC;
    group.add(lightHousing);

    const lightLens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.28), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, emissive: 0x333322, emissiveIntensity: 0.4 }));
    lightLens.position.set(2.22, 0.32, sz);
    lightLens.userData.sourceFile = SRC;
    group.add(lightLens);
  }

  // DRL strips
  for (const sz of [-0.6, 0.6]) {
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, emissive: 0xffffff, emissiveIntensity: 0.8 }));
    drl.position.set(2.1, 0.2, sz);
    drl.userData.sourceFile = SRC;
    group.add(drl);
  }

  // ── Taillights ──
  for (const sz of [-0.55, 0.55]) {
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.5), redLightMat);
    tailBar.position.set(-2.13, 0.32, sz);
    tailBar.userData.sourceFile = SRC;
    group.add(tailBar);
  }

  // ── Exhaust ──
  for (const sz of [-0.25, 0.25]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.15, 8), chromeMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(-2.2, 0.16, sz);
    tip.userData.sourceFile = SRC;
    group.add(tip);
  }

  // ── Interior ──
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 1.6), interiorMat);
  dash.position.set(0.4, 0.65, 0);
  dash.userData.sourceFile = SRC;
  group.add(dash);

  for (const sz of [-0.3, 0.3]) {
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.5, metalness: 0.1 }));
    seatBack.position.set(-0.5, 0.7, sz);
    seatBack.rotation.z = 0.25;
    seatBack.userData.sourceFile = SRC;
    group.add(seatBack);
  }

  // ── Wheels (staggered, rotated to horizontal) ──
  const frontWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
  const rearWheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 16);

  const wheelConfigs = [
    { x: 1.2, z: 1.12, geo: frontWheelGeo, r: 0.3 },
    { x: 1.2, z: -1.12, geo: frontWheelGeo, r: 0.3 },
    { x: -1.25, z: 1.15, geo: rearWheelGeo, r: 0.35 },
    { x: -1.25, z: -1.15, geo: rearWheelGeo, r: 0.35 },
  ];
  for (const wc of wheelConfigs) {
    const wheel = new THREE.Mesh(wc.geo, tireMat);
    wheel.position.set(wc.x, wc.r, wc.z);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);
  }

  // ── Fenders ──
  for (const [wx, wz, ww] of [[1.2, 0.95, 0.65], [1.2, -0.95, 0.65], [-1.25, 0.95, 0.7], [-1.25, -0.95, 0.7]]) {
    const arch = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.02, 0.4), carbonMat);
    arch.position.set(wx, 0.6, wz);
    arch.userData.sourceFile = SRC;
    group.add(arch);
  }

  return group;
}
