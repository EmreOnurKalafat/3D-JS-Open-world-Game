// assets/vehicles/motorcycle.js — Motorcycle Prefab (Realistic)
// Sport bike with detailed frame, engine, fairings, chain, dual exhaust.

import * as THREE from 'three';

const SRC = 'assets/vehicles/motorcycle.js';

function makeMetallicPaint(baseHue) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  const col = `hsl(${baseHue}, 80%, 45%)`;
  const colDark = `hsl(${baseHue}, 65%, 20%)`;
  const colLight = `hsl(${baseHue}, 55%, 68%)`;
  grad.addColorStop(0, colLight);
  grad.addColorStop(0.35, col);
  grad.addColorStop(0.65, col);
  grad.addColorStop(1, colDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMotorcycle(bodyColor) {
  const hue = bodyColor !== undefined
    ? bodyColor
    : [0, 30, 210, 120, 280, 45][Math.floor(Math.random() * 6)];
  const paintTex = makeMetallicPaint(hue);
  const bodyMat = new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.3, metalness: 0.6 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.25, metalness: 0.85 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.6 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.88, metalness: 0.05 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.8, metalness: 0.1 });
  const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff1010, roughness: 0.15, emissive: 0x440000, emissiveIntensity: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, roughness: 0.04, metalness: 0.15, emissive: 0x222200, emissiveIntensity: 0.3 });

  const group = new THREE.Group();
  group.name = 'Motorcycle';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Motosiklet (Gerçekçi)';
  group.userData.paintHue = hue;

  // ── Main frame (twin-spar aluminum) ──
  const frameMain = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.1), frameMat);
  frameMain.position.set(0, 0.55, 0);
  frameMain.userData.sourceFile = SRC;
  group.add(frameMain);

  // Subframe (rear)
  const subframe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.08), frameMat);
  subframe.position.set(-0.7, 0.62, 0);
  subframe.userData.sourceFile = SRC;
  group.add(subframe);

  // ── Swingarm ──
  const swingarm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.08), darkMetalMat);
  swingarm.position.set(-0.5, 0.3, 0);
  swingarm.userData.sourceFile = SRC;
  group.add(swingarm);

  // ── Engine block ──
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.4), darkMetalMat);
  engineBlock.position.set(0, 0.42, 0);
  engineBlock.castShadow = true;
  engineBlock.userData.sourceFile = SRC;
  group.add(engineBlock);

  // Cylinder head (angled forward)
  const cylHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.35), chromeMat);
  cylHead.position.set(0.15, 0.62, 0);
  cylHead.rotation.z = -0.3;
  cylHead.userData.sourceFile = SRC;
  group.add(cylHead);

  // Clutch cover
  const clutchCover = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12), chromeMat);
  clutchCover.rotation.x = Math.PI / 2;
  clutchCover.position.set(0, 0.42, 0.22);
  clutchCover.userData.sourceFile = SRC;
  group.add(clutchCover);

  // ── Fuel tank ──
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.26, 0.35), bodyMat);
  tank.position.set(0.05, 0.72, 0);
  tank.castShadow = true;
  tank.userData.sourceFile = SRC;
  group.add(tank);

  const tankCap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), chromeMat);
  tankCap.position.set(0.05, 0.86, 0);
  tankCap.userData.sourceFile = SRC;
  group.add(tankCap);

  // ── Fairings (side panels) ──
  for (const sz of [-0.2, 0.2]) {
    const fairing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), bodyMat);
    fairing.position.set(0, 0.58, sz);
    fairing.userData.sourceFile = SRC;
    group.add(fairing);
  }

  // Front fairing / headlight cowl
  const frontFairing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.35), bodyMat);
  frontFairing.position.set(0.65, 0.78, 0);
  frontFairing.rotation.z = 0.15;
  frontFairing.userData.sourceFile = SRC;
  group.add(frontFairing);

  // ── Seat ──
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.3), seatMat);
  seatBase.position.set(-0.35, 0.78, 0);
  seatBase.userData.sourceFile = SRC;
  group.add(seatBase);

  const pillionSeat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.07, 0.28), seatMat);
  pillionSeat.position.set(-0.65, 0.82, 0);
  pillionSeat.userData.sourceFile = SRC;
  group.add(pillionSeat);

  // ── Headlight ──
  const headlightHousing = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), chromeMat);
  headlightHousing.position.set(0.76, 0.72, 0);
  headlightHousing.userData.sourceFile = SRC;
  group.add(headlightHousing);

  const headlightLens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), glassMat);
  headlightLens.position.set(0.82, 0.72, 0);
  headlightLens.userData.sourceFile = SRC;
  group.add(headlightLens);

  // ── Taillight ──
  const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.18), redLightMat);
  tailLight.position.set(-1.0, 0.78, 0);
  tailLight.userData.sourceFile = SRC;
  group.add(tailLight);

  // ── Handlebars / Clip-ons ──
  const topYoke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.25), chromeMat);
  topYoke.position.set(0.55, 0.9, 0);
  topYoke.userData.sourceFile = SRC;
  group.add(topYoke);

  for (const sz of [-0.16, 0.16]) {
    const clipOn = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.04), darkMetalMat);
    clipOn.position.set(0.55, 0.88, sz);
    clipOn.userData.sourceFile = SRC;
    group.add(clipOn);

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), seatMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.set(0.62, 0.88, sz);
    grip.userData.sourceFile = SRC;
    group.add(grip);
  }

  // ── Forks (USD telescopic) ──
  for (const sz of [-0.1, 0.1]) {
    const forkOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), chromeMat);
    forkOuter.position.set(0.7, 0.5, sz);
    forkOuter.userData.sourceFile = SRC;
    group.add(forkOuter);
  }

  // Front axle
  const frontAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), chromeMat);
  frontAxle.rotation.x = Math.PI / 2;
  frontAxle.position.set(0.75, 0.35, 0);
  frontAxle.userData.sourceFile = SRC;
  group.add(frontAxle);

  // ── Dual exhaust (under-seat) ──
  for (const sz of [-0.12, 0.12]) {
    const header = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.6, 8), chromeMat);
    header.rotation.z = Math.PI / 2;
    header.position.set(-0.2, 0.3, sz);
    header.userData.sourceFile = SRC;
    group.add(header);

    const muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.7, 10), chromeMat);
    muffler.rotation.z = Math.PI / 2;
    muffler.position.set(-0.55, 0.52, sz * 1.8);
    muffler.userData.sourceFile = SRC;
    group.add(muffler);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 8), darkMetalMat);
    tip.rotation.z = Math.PI / 2;
    tip.position.set(-0.92, 0.52, sz * 1.8);
    tip.userData.sourceFile = SRC;
    group.add(tip);
  }

  // ── Chain & sprockets ──
  const frontSprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), chromeMat);
  frontSprocket.rotation.x = Math.PI / 2;
  frontSprocket.position.set(0, 0.3, 0.14);
  frontSprocket.userData.sourceFile = SRC;
  group.add(frontSprocket);

  const rearSprocket = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12), chromeMat);
  rearSprocket.position.set(-0.9, 0.35, 0.14);
  rearSprocket.userData.sourceFile = SRC;
  group.add(rearSprocket);

  // ── Kickstand ──
  const kickstand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.04), darkMetalMat);
  kickstand.position.set(0, 0.2, 0.18);
  kickstand.rotation.z = 0.3;
  kickstand.userData.sourceFile = SRC;
  group.add(kickstand);

  // ── Foot pegs ──
  for (const sz of [-0.16, 0.16]) {
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), darkMetalMat);
    peg.rotation.x = Math.PI / 2;
    peg.position.set(0.1, 0.32, sz);
    peg.userData.sourceFile = SRC;
    group.add(peg);

    const rearPeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), darkMetalMat);
    rearPeg.rotation.x = Math.PI / 2;
    rearPeg.position.set(-0.55, 0.36, sz);
    rearPeg.userData.sourceFile = SRC;
    group.add(rearPeg);
  }

  // ── Radiator ──
  const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.28), darkMetalMat);
  radiator.position.set(0.4, 0.52, 0);
  radiator.userData.sourceFile = SRC;
  group.add(radiator);

  // ── Dash ──
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.15), darkMetalMat);
  dash.position.set(0.5, 0.84, 0);
  dash.userData.sourceFile = SRC;
  group.add(dash);

  // ── Rear fender ──
  const hugger = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.25), darkMetalMat);
  hugger.position.set(-0.75, 0.5, 0);
  hugger.rotation.x = -0.3;
  hugger.userData.sourceFile = SRC;
  group.add(hugger);

  // ── License plate bracket ──
  const plateBracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.18), darkMetalMat);
  plateBracket.position.set(-1.05, 0.5, 0);
  plateBracket.userData.sourceFile = SRC;
  group.add(plateBracket);

  // ── Wheels (TorusGeometry for tire, with discs) ──
  // Front wheel
  const frontTire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 8, 16), tireMat);
  frontTire.position.set(0.75, 0.35, 0);
  frontTire.userData.sourceFile = SRC;
  group.add(frontTire);

  // Front brake discs
  for (const sz of [-0.07, 0.07]) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 16), chromeMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(0.75, 0.35, sz);
    disc.userData.sourceFile = SRC;
    group.add(disc);
  }

  // Rear wheel
  const rearTire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.12, 8, 16), tireMat);
  rearTire.position.set(-0.9, 0.38, 0);
  rearTire.userData.sourceFile = SRC;
  group.add(rearTire);

  // Rear brake disc
  const rearDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.01, 16), chromeMat);
  rearDisc.rotation.x = Math.PI / 2;
  rearDisc.position.set(-0.9, 0.38, 0.07);
  rearDisc.userData.sourceFile = SRC;
  group.add(rearDisc);

  // ── Front fender ──
  const frontFender = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.2), bodyMat);
  frontFender.position.set(0.72, 0.53, 0);
  frontFender.rotation.x = 0.4;
  frontFender.userData.sourceFile = SRC;
  group.add(frontFender);

  return group;
}
