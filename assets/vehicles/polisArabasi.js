// assets/vehicles/polisArabasi.js — Police Car Prefab (Realistic)
// Police sedan with full lightbar, pushbar, partition cage, spotlights.

import * as THREE from 'three';

const SRC = 'assets/vehicles/polisArabasi.js';

const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f5, roughness: 0.35, metalness: 0.4 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.45 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2835, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.88, metalness: 0.05 });
const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.7, metalness: 0.2 });
const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.2 });

// Police emergency lights (yüksek emisyonlu çakar)
const redCakarMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.1, emissive: 0xff0000, emissiveIntensity: 1.5 });
const blueCakarMat = new THREE.MeshStandardMaterial({ color: 0x0044ff, roughness: 0.1, emissive: 0x0044ff, emissiveIntensity: 1.5 });
const whiteCakarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 1.0 });
const redTailMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.15, emissive: 0x660000, emissiveIntensity: 0.7 });

export function createPolisArabasi() {
  const group = new THREE.Group();
  group.name = 'PoliceCar';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Polis Arabası (Gerçekçi)';

  // ── Main body ──
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 2.0), whiteMat);
  body.position.set(0, 0.58, 0);
  body.castShadow = true;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Door gaps (subtle)
  for (const dx of [-0.6, 0.6]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.45, 2.01), doorGapMat);
    doorLine.position.set(dx, 0.62, 0);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // ── Police livery band (dark stripe) ──
  const livery = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 2.02), blackMat);
  livery.position.set(0, 0.65, 0);
  livery.userData.sourceFile = SRC;
  group.add(livery);

  // ── Cabin ──
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 1.85), whiteMat);
  cabin.position.set(-0.1, 1.12, 0);
  cabin.castShadow = true;
  cabin.userData.sourceFile = SRC;
  group.add(cabin);

  const wf = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 1.7), glassMat);
  wf.position.set(1.0, 1.14, 0);
  wf.rotation.z = 0.52;
  wf.userData.sourceFile = SRC;
  group.add(wf);

  const wr = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 1.7), glassMat);
  wr.position.set(-1.2, 1.14, 0);
  wr.rotation.z = -0.42;
  wr.userData.sourceFile = SRC;
  group.add(wr);

  for (const sz of [-0.93, 0.93]) {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.34, 0.02), glassMat);
    sideWin.position.set(-0.1, 1.16, sz);
    sideWin.userData.sourceFile = SRC;
    group.add(sideWin);
  }

  // ── Roof ──
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 1.8), whiteMat);
  roof.position.set(-0.1, 1.38, 0);
  roof.userData.sourceFile = SRC;
  group.add(roof);

  // ── Hood & Trunk ──
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.8), whiteMat);
  hood.position.set(1.3, 0.92, 0);
  hood.userData.sourceFile = SRC;
  group.add(hood);

  const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 1.8), whiteMat);
  trunk.position.set(-1.4, 0.92, 0);
  trunk.userData.sourceFile = SRC;
  group.add(trunk);

  // ── LED Lightbar (full-width, realistic 3D lenses) ──
  // Base frame
  const barFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.5), blackMat);
  barFrame.position.set(-0.1, 1.42, 0);
  barFrame.userData.sourceFile = SRC;
  group.add(barFrame);

  // Individual LED modules (8 segments, alternating red/blue)
  for (let i = 0; i < 8; i++) {
    const isRed = i % 2 === 0;
    const mat = isRed ? redCakarMat : blueCakarMat;
    // Outer dome lens
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.position.set(-0.5 + i * 0.14, 1.46, 0);
    dome.userData.sourceFile = SRC;
    group.add(dome);
  }

  // End flashers (corner strobes, blue)
  for (const dx of [-0.62, 0.62]) {
    const endStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blueCakarMat);
    endStrobe.position.set(dx, 1.42, 0);
    endStrobe.userData.sourceFile = SRC;
    group.add(endStrobe);
  }

  // ── Pushbar (front ram bar) ──
  const pushbarH = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8), chromeMat);
  pushbarH.rotation.x = Math.PI / 2;
  pushbarH.position.set(2.45, 0.42, 0);
  pushbarH.userData.sourceFile = SRC;
  group.add(pushbarH);

  for (const sz of [-0.55, 0, 0.55]) {
    const pushbarV = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6), chromeMat);
    pushbarV.position.set(2.25, 0.3, sz);
    pushbarV.userData.sourceFile = SRC;
    group.add(pushbarV);
  }

  // ── Front bumper & grill ──
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 2.05), trimMat);
  frontBumper.position.set(2.15, 0.38, 0);
  frontBumper.userData.sourceFile = SRC;
  group.add(frontBumper);

  const grillSurround = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 1.5), chromeMat);
  grillSurround.position.set(2.15, 0.58, 0);
  grillSurround.userData.sourceFile = SRC;
  group.add(grillSurround);

  const grillMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 1.4), trimMat);
  grillMesh.position.set(2.19, 0.58, 0);
  grillMesh.userData.sourceFile = SRC;
  group.add(grillMesh);

  // Headlights
  for (const sz of [-0.55, 0.55]) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.4), chromeMat);
    housing.position.set(2.22, 0.6, sz);
    housing.userData.sourceFile = SRC;
    group.add(housing);

    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.34), new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.04, emissive: 0x222200, emissiveIntensity: 0.35 }));
    lens.position.set(2.24, 0.6, sz);
    lens.userData.sourceFile = SRC;
    group.add(lens);
  }

  // Grill strobes (front-facing red/blue)
  for (const sz of [-0.55, 0.55]) {
    const grillStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), sz < 0 ? redCakarMat : blueCakarMat);
    grillStrobe.position.set(2.22, 0.42, sz);
    grillStrobe.userData.sourceFile = SRC;
    group.add(grillStrobe);
  }

  // ── Side spotlights ──
  for (const sz of [-0.98, 0.98]) {
    const spotBody = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), blackMat);
    spotBody.rotation.x = Math.PI / 2;
    spotBody.position.set(0.55, 1.1, sz);
    spotBody.userData.sourceFile = SRC;
    group.add(spotBody);

    const spotLens = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), whiteCakarMat);
    spotLens.position.set(0.55, 1.1, sz * 1.1);
    spotLens.userData.sourceFile = SRC;
    group.add(spotLens);
  }

  // ── Rear bumper & taillights ──
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.05), trimMat);
  rearBumper.position.set(-2.15, 0.38, 0);
  rearBumper.userData.sourceFile = SRC;
  group.add(rearBumper);

  for (const sz of [-0.55, 0.55]) {
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, 0.42), redTailMat);
    tailLight.position.set(-2.22, 0.6, sz);
    tailLight.userData.sourceFile = SRC;
    group.add(tailLight);
  }

  // Rear deck strobes (left/right, red/blue)
  for (const sz of [-0.5, 0.5]) {
    const deckStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), sz < 0 ? redCakarMat : blueCakarMat);
    deckStrobe.position.set(-1.6, 1.3, sz);
    deckStrobe.userData.sourceFile = SRC;
    group.add(deckStrobe);
  }

  // ── Side mirrors ──
  for (const sz of [-1.0, 1.0]) {
    const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.12), trimMat);
    mirrorArm.position.set(0.6, 1.12, sz);
    mirrorArm.userData.sourceFile = SRC;
    group.add(mirrorArm);

    const mirrorBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.18), whiteMat);
    mirrorBody.position.set(0.6, 1.06, sz * 1.15);
    mirrorBody.userData.sourceFile = SRC;
    group.add(mirrorBody);
  }

  // ── Interior / partition ──
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 1.55), interiorMat);
  dash.position.set(0.7, 0.88, 0);
  dash.userData.sourceFile = SRC;
  group.add(dash);

  // Prisoner partition (vertical bars)
  const partition = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 1.6), trimMat);
  partition.position.set(-0.3, 0.85, 0);
  partition.userData.sourceFile = SRC;
  group.add(partition);

  for (let y = 0.68; y <= 0.96; y += 0.14) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.6), chromeMat);
    bar.position.set(-0.3, y, 0);
    bar.userData.sourceFile = SRC;
    group.add(bar);
  }

  // Seats
  for (const sz of [-0.35, 0.35]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.45), interiorMat);
    seat.position.set(-0.2, 0.62, sz);
    seat.userData.sourceFile = SRC;
    group.add(seat);
  }

  // ── Antennas ──
  const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4), chromeMat);
  ant1.position.set(-0.5, 1.44, 0);
  ant1.userData.sourceFile = SRC;
  group.add(ant1);

  const ant2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 4), chromeMat);
  ant2.position.set(-1.0, 1.44, 0);
  ant2.userData.sourceFile = SRC;
  group.add(ant2);

  // ── Trunk lettering ──
  const trunkBadge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 1.0), chromeMat);
  trunkBadge.position.set(-1.4, 0.98, 0);
  trunkBadge.userData.sourceFile = SRC;
  group.add(trunkBadge);

  // ── Undercarriage ──
  const underbody = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 1.55), trimMat);
  underbody.position.set(0, 0.2, 0);
  underbody.userData.sourceFile = SRC;
  group.add(underbody);

  // ── Wheels (steelies, rotated to horizontal) ──
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16);
  const wheelPositions = [
    [1.3, 1.05], [1.3, -1.05], [-1.3, 1.05], [-1.3, -1.05],
  ];
  for (const [wx, wz] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.position.set(wx, 0.34, wz);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 8), chromeMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(wx, 0.34, wz);
    cap.userData.sourceFile = SRC;
    group.add(cap);
  }

  return group;
}
