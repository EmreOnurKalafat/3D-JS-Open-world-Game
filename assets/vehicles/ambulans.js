// assets/vehicles/ambulans.js — Ambulance Prefab (Realistic)
// Emergency ambulance with high-roof box body, medical markings, full lightbar.

import * as THREE from 'three';

const SRC = 'assets/vehicles/ambulans.js';

const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfafaf5, roughness: 0.35, metalness: 0.3 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.45 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2835, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.88, metalness: 0.05 });
const redStripeMat = new THREE.MeshStandardMaterial({ color: 0xdd2222, roughness: 0.4, metalness: 0.2 });
const orangeStripeMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.35, metalness: 0.2 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.5 });
const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.2 });

// Emergency lights (yüksek emisyonlu çakar)
const redCakarMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.1, emissive: 0xff0000, emissiveIntensity: 1.8 });
const blueCakarMat = new THREE.MeshStandardMaterial({ color: 0x0044ff, roughness: 0.1, emissive: 0x0044ff, emissiveIntensity: 1.5 });
const amberCakarMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.1, emissive: 0xff8800, emissiveIntensity: 1.2 });
const whiteCakarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 1.0 });

export function createAmbulans() {
  const group = new THREE.Group();
  group.name = 'Ambulance';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ambulans (Gerçekçi)';

  // ── Cab body ──
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 2.1), whiteMat);
  cabBody.position.set(2.0, 0.85, 0);
  cabBody.castShadow = true;
  cabBody.userData.sourceFile = SRC;
  group.add(cabBody);

  for (const sz of [-1.05, 1.05]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.7, 2.11), doorGapMat);
    doorLine.position.set(2.0, 0.88, sz);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // ── Patient box (high-roof rear) ──
  const boxBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.0, 2.25), whiteMat);
  boxBody.position.set(-1.6, 1.55, 0);
  boxBody.castShadow = true;
  boxBody.userData.sourceFile = SRC;
  group.add(boxBody);

  // Box ribs
  for (let i = 0; i < 3; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.03, 2.27), trimMat);
    rib.position.set(-1.6, 1.0 + i * 0.6, 0);
    rib.userData.sourceFile = SRC;
    group.add(rib);
  }

  // Box roof
  const boxRoof = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.05, 2.3), whiteMat);
  boxRoof.position.set(-1.6, 2.57, 0);
  boxRoof.userData.sourceFile = SRC;
  group.add(boxRoof);

  // ── Red + orange reflective stripe (side) ──
  const redBand = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.12, 2.27), redStripeMat);
  redBand.position.set(0.1, 1.1, 0);
  redBand.userData.sourceFile = SRC;
  group.add(redBand);

  const orangeBand = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 2.27), orangeStripeMat);
  orangeBand.position.set(0.1, 1.19, 0);
  orangeBand.userData.sourceFile = SRC;
  group.add(orangeBand);

  // ── Cab greenhouse ──
  const cabGreen = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.9), whiteMat);
  cabGreen.position.set(2.1, 1.45, 0);
  cabGreen.userData.sourceFile = SRC;
  group.add(cabGreen);

  const cabWS = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 1.7), glassMat);
  cabWS.position.set(3.05, 1.48, 0);
  cabWS.rotation.z = 0.4;
  cabWS.userData.sourceFile = SRC;
  group.add(cabWS);

  for (const sz of [-1.05, 1.05]) {
    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 0.02), glassMat);
    cabWin.position.set(2.1, 1.5, sz);
    cabWin.userData.sourceFile = SRC;
    group.add(cabWin);
  }

  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.85), whiteMat);
  cabRoof.position.set(2.1, 1.64, 0);
  cabRoof.userData.sourceFile = SRC;
  group.add(cabRoof);

  // ── Patient box side windows ──
  for (const sz of [-1.12, 1.12]) {
    for (const dx of [-2.5, -1.0]) {
      const boxWin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.02), glassMat);
      boxWin.position.set(dx, 1.45, sz);
      boxWin.userData.sourceFile = SRC;
      group.add(boxWin);
    }
  }

  // ── Rear doors ──
  const rearDoorL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 1.05), whiteMat);
  rearDoorL.position.set(-3.7, 1.5, -0.55);
  rearDoorL.userData.sourceFile = SRC;
  group.add(rearDoorL);

  const rearDoorR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 1.05), whiteMat);
  rearDoorR.position.set(-3.7, 1.5, 0.55);
  rearDoorR.userData.sourceFile = SRC;
  group.add(rearDoorR);

  const rearSplit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 0.02), trimMat);
  rearSplit.position.set(-3.7, 1.5, 0);
  rearSplit.userData.sourceFile = SRC;
  group.add(rearSplit);

  for (const sz of [-0.55, 0.55]) {
    const rearWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.8), glassMat);
    rearWin.position.set(-3.72, 1.6, sz);
    rearWin.userData.sourceFile = SRC;
    group.add(rearWin);
  }

  // ── Rear step ──
  const rearStep = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 2.0), trimMat);
  rearStep.position.set(-3.95, 0.48, 0);
  rearStep.userData.sourceFile = SRC;
  group.add(rearStep);

  // ── EMERGENCY LIGHTBAR (full-width LED, realistic 3D) ──
  // Base rail
  const barRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 2.3), trimMat);
  barRail.position.set(2.1, 1.68, 0);
  barRail.userData.sourceFile = SRC;
  group.add(barRail);

  // Primary LED modules (10 segments alternating red/blue)
  for (let i = 0; i < 10; i++) {
    const isRed = i % 2 === 0;
    const mat = isRed ? redCakarMat : blueCakarMat;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.position.set(1.5 + i * 0.15, 1.73, 0);
    dome.userData.sourceFile = SRC;
    group.add(dome);
  }

  // End strobes (amber)
  for (const dx of [1.45, 2.85]) {
    const endStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), amberCakarMat);
    endStrobe.position.set(dx, 1.68, 0);
    endStrobe.userData.sourceFile = SRC;
    group.add(endStrobe);
  }

  // ── Front corner strobes (grill-mounted) ──
  for (const sz of [-0.85, 0.85]) {
    const cornerStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), redCakarMat);
    cornerStrobe.position.set(2.95, 0.55, sz);
    cornerStrobe.userData.sourceFile = SRC;
    group.add(cornerStrobe);
  }

  // ── Rear strobes (top corners of box) ──
  for (const sz of [-1.0, 1.0]) {
    const rearStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), redCakarMat);
    rearStrobe.position.set(-3.5, 2.45, sz);
    rearStrobe.userData.sourceFile = SRC;
    group.add(rearStrobe);
  }

  // ── Side scene lights ──
  for (const sz of [-1.1, 1.1]) {
    for (const dx of [-2.5, -0.5]) {
      const sceneLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), whiteCakarMat);
      sceneLight.position.set(dx, 2.25, sz);
      sceneLight.userData.sourceFile = SRC;
      group.add(sceneLight);
    }
  }

  // ── Front fascia ──
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 2.25), trimMat);
  frontBumper.position.set(3.15, 0.42, 0);
  frontBumper.userData.sourceFile = SRC;
  group.add(frontBumper);

  const grill = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 1.6), chromeMat);
  grill.position.set(3.2, 0.7, 0);
  grill.userData.sourceFile = SRC;
  group.add(grill);

  // Headlights
  for (const sz of [-0.6, 0.6]) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.42), chromeMat);
    housing.position.set(3.22, 0.72, sz);
    housing.userData.sourceFile = SRC;
    group.add(housing);

    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.34), new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.04, emissive: 0x222200, emissiveIntensity: 0.35 }));
    lens.position.set(3.24, 0.72, sz);
    lens.userData.sourceFile = SRC;
    group.add(lens);
  }

  // ── Side mirrors (dual truck-style) ──
  for (const sz of [-1.12, 1.12]) {
    const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.25), chromeMat);
    mirrorArm.position.set(2.6, 1.4, sz);
    mirrorArm.userData.sourceFile = SRC;
    group.add(mirrorArm);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.22), trimMat);
    mirrorHead.position.set(2.65, 1.4, sz * 1.1);
    mirrorHead.userData.sourceFile = SRC;
    group.add(mirrorHead);

    const convex = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), trimMat);
    convex.rotation.x = Math.PI / 2;
    convex.position.set(2.64, 1.25, sz * 1.1);
    convex.userData.sourceFile = SRC;
    group.add(convex);
  }

  // ── Star of Life emblem (rear door) ──
  const starBase = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.35, 0.35), blueCakarMat);
  starBase.position.set(-3.7, 2.2, 0);
  starBase.userData.sourceFile = SRC;
  group.add(starBase);

  // ── Hood lettering ──
  const hoodLabel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 1.4), redStripeMat);
  hoodLabel.position.set(3.05, 0.95, 0);
  hoodLabel.userData.sourceFile = SRC;
  group.add(hoodLabel);

  // ── Rooftop AC unit ──
  const acUnit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.4), trimMat);
  acUnit.position.set(-1.5, 2.62, 0);
  acUnit.userData.sourceFile = SRC;
  group.add(acUnit);

  const acVent = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 1.0), darkMetalMat);
  acVent.position.set(-1.5, 2.73, 0);
  acVent.userData.sourceFile = SRC;
  group.add(acVent);

  // ── Side compartment doors ──
  for (const sz of [-1.1, 1.1]) {
    const compDoor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.04), trimMat);
    compDoor.position.set(-2.0, 1.0, sz);
    compDoor.userData.sourceFile = SRC;
    group.add(compDoor);
  }

  // ── Siren speaker ──
  const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 6), trimMat);
  siren.rotation.x = Math.PI / 2;
  siren.position.set(3.2, 0.28, 0);
  siren.userData.sourceFile = SRC;
  group.add(siren);

  // ── Undercarriage ──
  for (const sz of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 0.08), trimMat);
    rail.position.set(0.2, 0.28, sz);
    rail.userData.sourceFile = SRC;
    group.add(rail);
  }

  // ── Wheels (rotated to horizontal) ──
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
  const wheelPositions = [
    [1.6, 1.12], [1.6, -1.12], [-2.0, 1.12], [-2.0, -1.12],
  ];
  for (const [wx, wz] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.position.set(wx, 0.35, wz);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);

    const hubcap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), chromeMat);
    hubcap.rotation.x = Math.PI / 2;
    hubcap.position.set(wx, 0.35, wz);
    hubcap.userData.sourceFile = SRC;
    group.add(hubcap);
  }

  // ── Wheel arches ──
  for (const [wx, wz] of wheelPositions) {
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.02, 0.55), trimMat);
    arch.position.set(wx, 0.95, wz);
    arch.userData.sourceFile = SRC;
    group.add(arch);
  }

  return group;
}
