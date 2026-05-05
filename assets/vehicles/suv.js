// assets/vehicles/suv.js — SUV Prefab (Realistic)
// Tall, boxy off-roader with roof rails, spare tire, running boards.

import * as THREE from 'three';

const SRC = 'assets/vehicles/suv.js';

function makePaint(hue) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  const col = `hsl(${hue}, 45%, 42%)`;
  const colDark = `hsl(${hue}, 40%, 24%)`;
  const colLight = `hsl(${hue}, 35%, 62%)`;
  grad.addColorStop(0, colLight);
  grad.addColorStop(0.4, col);
  grad.addColorStop(0.6, col);
  grad.addColorStop(1, colDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 4, 1 + Math.random() * 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.88, metalness: 0.05 });

export function createSuv(bodyColor) {
  const hue = bodyColor !== undefined
    ? bodyColor
    : [210, 0, 30, 120, 45, 270][Math.floor(Math.random() * 6)];
  const paintTex = makePaint(hue);
  const bodyMat = new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.4, metalness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.35, metalness: 0.45 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.85 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x182535, roughness: 0.04, metalness: 0.25, transparent: true, opacity: 0.7 });
  const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff1010, roughness: 0.2, emissive: 0x440000, emissiveIntensity: 0.5 });
  const interiorMat = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.75, metalness: 0.1 });
  const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.2 });

  const group = new THREE.Group();
  group.name = 'SUV';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'SUV (Gerçekçi)';
  group.userData.paintHue = hue;

  // ── Main body ──
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.9, 2.0), bodyMat);
  body.position.set(0, 0.65, 0);
  body.castShadow = true;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Door gaps (subtle)
  for (const dx of [-0.5, 0.9]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.6, 2.01), doorGapMat);
    doorLine.position.set(dx, 0.7, 0);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // ── Upper cabin ──
  const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.52, 1.9), bodyMat);
  cabinBase.position.set(-0.05, 1.28, 0);
  cabinBase.castShadow = true;
  cabinBase.userData.sourceFile = SRC;
  group.add(cabinBase);

  const wf = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 1.7), glassMat);
  wf.position.set(1.2, 1.3, 0);
  wf.rotation.z = 0.5;
  wf.userData.sourceFile = SRC;
  group.add(wf);

  const wr = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 1.7), glassMat);
  wr.position.set(-1.3, 1.28, 0);
  wr.rotation.z = -0.3;
  wr.userData.sourceFile = SRC;
  group.add(wr);

  for (const sz of [-0.95, 0.95]) {
    const winFront = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.02), glassMat);
    winFront.position.set(0.65, 1.32, sz);
    winFront.userData.sourceFile = SRC;
    group.add(winFront);

    const winRear = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.02), glassMat);
    winRear.position.set(-0.4, 1.32, sz);
    winRear.userData.sourceFile = SRC;
    group.add(winRear);

    const winCargo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.02), glassMat);
    winCargo.position.set(-1.1, 1.28, sz);
    winCargo.userData.sourceFile = SRC;
    group.add(winCargo);
  }

  // ── Roof ──
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.85), bodyMat);
  roof.position.set(-0.05, 1.56, 0);
  roof.userData.sourceFile = SRC;
  group.add(roof);

  // Roof rails
  for (const sz of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.04, 0.05), chromeMat);
    rail.position.set(0, 1.62, sz);
    rail.userData.sourceFile = SRC;
    group.add(rail);

    for (const dx of [-1.2, 0, 1.2]) {
      const railStand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), trimMat);
      railStand.position.set(dx, 1.59, sz);
      railStand.userData.sourceFile = SRC;
      group.add(railStand);
    }
  }

  // ── Front fascia ──
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 2.15), trimMat);
  frontBumper.position.set(2.22, 0.4, 0);
  frontBumper.userData.sourceFile = SRC;
  group.add(frontBumper);

  const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 1.6), chromeMat);
  skidPlate.position.set(2.1, 0.18, 0);
  skidPlate.userData.sourceFile = SRC;
  group.add(skidPlate);

  const grillSurround = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 1.55), chromeMat);
  grillSurround.position.set(2.17, 0.65, 0);
  grillSurround.userData.sourceFile = SRC;
  group.add(grillSurround);

  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 1.4), chromeMat);
    bar.position.set(2.2, 0.5 + i * 0.07, 0);
    bar.userData.sourceFile = SRC;
    group.add(bar);
  }

  // Headlights
  for (const sz of [-0.55, 0.55]) {
    const lightHouse = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.45), chromeMat);
    lightHouse.position.set(2.25, 0.68, sz);
    lightHouse.userData.sourceFile = SRC;
    group.add(lightHouse);

    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.38), new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.04, emissive: 0x222200, emissiveIntensity: 0.35 }));
    lens.position.set(2.28, 0.68, sz);
    lens.userData.sourceFile = SRC;
    group.add(lens);
  }

  // ── Rear ──
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 2.15), trimMat);
  rearBumper.position.set(-2.22, 0.4, 0);
  rearBumper.userData.sourceFile = SRC;
  group.add(rearBumper);

  const tailgateHandle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), chromeMat);
  tailgateHandle.position.set(-2.2, 0.8, 0);
  tailgateHandle.userData.sourceFile = SRC;
  group.add(tailgateHandle);

  for (const sz of [-0.55, 0.55]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.45), redLightMat);
    tail.position.set(-2.22, 0.68, sz);
    tail.userData.sourceFile = SRC;
    group.add(tail);
  }

  // ── Spare tire ──
  const spareTire = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.12, 8, 16), tireMat);
  spareTire.position.set(-2.4, 1.4, 0);
  spareTire.rotation.y = Math.PI / 2;
  spareTire.userData.sourceFile = SRC;
  group.add(spareTire);

  const spareCover = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), trimMat);
  spareCover.rotation.x = Math.PI / 2;
  spareCover.position.set(-2.4, 1.4, 0);
  spareCover.userData.sourceFile = SRC;
  group.add(spareCover);

  // ── Running boards ──
  for (const sz of [-1.02, 1.02]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.04, 0.15), trimMat);
    board.position.set(0.2, 0.22, sz);
    board.userData.sourceFile = SRC;
    group.add(board);
  }

  // ── Side mirrors ──
  for (const sz of [-1.05, 1.05]) {
    const mirrorBase = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.1), trimMat);
    mirrorBase.position.set(0.7, 1.25, sz);
    mirrorBase.userData.sourceFile = SRC;
    group.add(mirrorBase);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.2), bodyMat);
    mirrorHead.position.set(0.7, 1.18, sz * 1.12);
    mirrorHead.userData.sourceFile = SRC;
    group.add(mirrorHead);
  }

  // ── Door handles ──
  for (const dx of [-0.5, 0.9]) {
    for (const sz of [-0.95, 0.95]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.22), chromeMat);
      handle.position.set(dx, 0.82, sz);
      handle.userData.sourceFile = SRC;
      group.add(handle);
    }
  }

  // ── Interior ──
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 1.6), interiorMat);
  dash.position.set(0.7, 0.9, 0);
  dash.userData.sourceFile = SRC;
  group.add(dash);

  for (const sz of [-0.3, 0.3]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.45), interiorMat);
    seat.position.set(-0.2, 0.72, sz);
    seat.userData.sourceFile = SRC;
    group.add(seat);
  }

  // ── Wheels (chunky, rotated to horizontal) ──
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 16);
  const wheelPositions = [
    [1.35, 1.1], [1.35, -1.1], [-1.35, 1.1], [-1.35, -1.1],
  ];
  for (const [wx, wz] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.position.set(wx, 0.38, wz);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);
  }

  // Wheel arch flares
  for (const [wx, wz] of wheelPositions) {
    const flare = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.02, 0.55), trimMat);
    flare.position.set(wx, 0.95, wz);
    flare.userData.sourceFile = SRC;
    group.add(flare);
  }

  return group;
}
