// assets/vehicles/truck.js — Box Truck Prefab (Realistic)
// Commercial delivery truck with cab, cargo box, lift gate, dual rear wheels.

import * as THREE from 'three';

const SRC = 'assets/vehicles/truck.js';

const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.4, metalness: 0.3 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.5 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2835, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff1111, roughness: 0.15, emissive: 0x440000, emissiveIntensity: 0.5 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9, metalness: 0.05 });
const cargoMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.45, metalness: 0.25 });
const doorGapMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.2 });

export function createTruck() {
  const group = new THREE.Group();
  group.name = 'Truck';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Kamyon (Gerçekçi)';

  // ── Cab ──
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), whiteMat);
  cabBody.position.set(2.2, 0.95, 0);
  cabBody.castShadow = true;
  cabBody.userData.sourceFile = SRC;
  group.add(cabBody);

  // Cab door gaps (subtle)
  for (const sz of [-1.05, 1.05]) {
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.005, 1.1, 2.21), doorGapMat);
    doorLine.position.set(2.2, 0.95, sz);
    doorLine.userData.sourceFile = SRC;
    group.add(doorLine);
  }

  // Cab greenhouse
  const cabGreenhouse = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 2.0), whiteMat);
  cabGreenhouse.position.set(2.3, 1.76, 0);
  cabGreenhouse.userData.sourceFile = SRC;
  group.add(cabGreenhouse);

  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 1.8), glassMat);
  windshield.position.set(3.2, 1.8, 0);
  windshield.rotation.z = 0.35;
  windshield.userData.sourceFile = SRC;
  group.add(windshield);

  // Side cab windows
  for (const sz of [-1.05, 1.05]) {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.02), glassMat);
    sideWin.position.set(2.3, 1.8, sz);
    sideWin.userData.sourceFile = SRC;
    group.add(sideWin);
  }

  // Cab roof
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 1.95), whiteMat);
  cabRoof.position.set(2.3, 2.0, 0);
  cabRoof.userData.sourceFile = SRC;
  group.add(cabRoof);

  // ── Cargo Box ──
  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.3, 2.4), cargoMat);
  cargoBox.position.set(-2.2, 1.6, 0);
  cargoBox.castShadow = true;
  cargoBox.userData.sourceFile = SRC;
  group.add(cargoBox);

  // Cargo box structural ribs
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.03, 2.42), trimMat);
    rib.position.set(-2.2, 0.6 + i * 0.6, 0);
    rib.userData.sourceFile = SRC;
    group.add(rib);
  }

  // Vertical edge strips
  for (const dx of [-4.8, 0.4]) {
    for (const sz of [-1.2, 1.2]) {
      const edgeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.2, 0.03), trimMat);
      edgeStrip.position.set(dx, 1.6, sz);
      edgeStrip.userData.sourceFile = SRC;
      group.add(edgeStrip);
    }
  }

  // Cargo door (rear)
  const rearDoorSplit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.15, 2.42), trimMat);
  rearDoorSplit.position.set(-5.05, 1.6, 0);
  rearDoorSplit.userData.sourceFile = SRC;
  group.add(rearDoorSplit);

  // Door hinges
  for (const sz of [-0.8, 0.8]) {
    for (let i = 0; i < 3; i++) {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.06), chromeMat);
      hinge.position.set(-5.05, 0.6 + i * 0.7, sz);
      hinge.userData.sourceFile = SRC;
      group.add(hinge);
    }
  }

  // ── Wind deflector ──
  const deflector = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 2.3), trimMat);
  deflector.position.set(0.6, 2.15, 0);
  deflector.userData.sourceFile = SRC;
  group.add(deflector);

  // ── Lift gate ──
  const liftPlatform = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 2.2), trimMat);
  liftPlatform.position.set(-5.6, 0.25, 0);
  liftPlatform.userData.sourceFile = SRC;
  group.add(liftPlatform);

  for (const sz of [-0.9, 0.9]) {
    const liftArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), chromeMat);
    liftArm.position.set(-5.5, 0.45, sz);
    liftArm.userData.sourceFile = SRC;
    group.add(liftArm);
  }

  // ── Front fascia ──
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.4, 2.4), trimMat);
  frontBumper.position.set(3.4, 0.4, 0);
  frontBumper.userData.sourceFile = SRC;
  group.add(frontBumper);

  const grillMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 1.6), chromeMat);
  grillMesh.position.set(3.42, 0.82, 0);
  grillMesh.userData.sourceFile = SRC;
  group.add(grillMesh);

  // Headlights
  for (const sz of [-0.6, 0.6]) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.4), chromeMat);
    light.position.set(3.45, 0.8, sz);
    light.userData.sourceFile = SRC;
    group.add(light);
  }

  // Side mirrors (large truck mirrors)
  for (const sz of [-1.2, 1.2]) {
    const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), chromeMat);
    mirrorArm.position.set(2.8, 1.65, sz);
    mirrorArm.userData.sourceFile = SRC;
    group.add(mirrorArm);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.2), trimMat);
    mirrorHead.position.set(2.85, 1.65, sz * 1.15);
    mirrorHead.userData.sourceFile = SRC;
    group.add(mirrorHead);
  }

  // ── Taillights ──
  for (const sz of [-0.65, 0.65]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.35), redLightMat);
    tail.position.set(-5.35, 0.8, sz);
    tail.userData.sourceFile = SRC;
    group.add(tail);
  }

  // ── Side marker lights ──
  for (let i = 0; i < 4; i++) {
    for (const sz of [-1.2, 1.2]) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0x331100, emissiveIntensity: 0.4 }));
      marker.position.set(-4.0 + i * 1.5, 1.0, sz);
      marker.userData.sourceFile = SRC;
      group.add(marker);
    }
  }

  // ── Undercarriage ──
  for (const sz of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.08, 0.08), trimMat);
    rail.position.set(0, 0.25, sz);
    rail.userData.sourceFile = SRC;
    group.add(rail);
  }

  // ── Wheels: Front (2) + Rear dual (4 inner + 4 outer) ──
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
  // Front
  for (const sz of [-1.18, 1.18]) {
    const w = new THREE.Mesh(wheelGeo, tireMat);
    w.position.set(2.2, 0.38, sz);
    w.rotation.x = Math.PI / 2;
    w.castShadow = true;
    w.userData.sourceFile = SRC;
    group.add(w);
  }
  // Rear dual wheels
  for (const sx of [-1.5, -3.8]) {
    for (const sz of [-1.18, 1.18]) {
      const wo = new THREE.Mesh(wheelGeo, tireMat);
      wo.position.set(sx, 0.38, sz);
      wo.rotation.x = Math.PI / 2;
      wo.castShadow = true;
      wo.userData.sourceFile = SRC;
      group.add(wo);

      const wi = new THREE.Mesh(wheelGeo, tireMat);
      wi.position.set(sx, 0.38, sz * 0.75);
      wi.rotation.x = Math.PI / 2;
      wi.castShadow = true;
      wi.userData.sourceFile = SRC;
      group.add(wi);
    }
  }

  return group;
}
