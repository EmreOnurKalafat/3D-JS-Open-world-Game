// assets/vehicles/helikopter.js — Helicopter Prefab
// Clean utility helicopter. No overlapping parts. Correct tail geometry.

import * as THREE from 'three';

const SRC = 'assets/vehicles/helikopter.js';

const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.3, metalness: 0.45 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2835, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.1, emissive: 0xff0000, emissiveIntensity: 1.0 });
const greenLightMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.1, emissive: 0x00ff00, emissiveIntensity: 0.7 });
const whiteLightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.8 });
const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.25, metalness: 0.5 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.2, metalness: 0.7 });

export function createHelikopter() {
  const group = new THREE.Group();
  group.name = 'Helicopter';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Helikopter (Gerçekçi)';

  // ── Cabin ──
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.4), bodyMat);
  cabin.position.set(0.3, 0.68, 0);
  cabin.castShadow = true;
  cabin.userData.sourceFile = SRC;
  group.add(cabin);

  // ── Nose ──
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.1), bodyMat);
  nose.position.set(1.65, 0.6, 0);
  nose.userData.sourceFile = SRC;
  group.add(nose);

  // ── Windshield ──
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 1.1), glassMat);
  windshield.position.set(1.05, 0.95, 0);
  windshield.rotation.z = 0.4;
  windshield.userData.sourceFile = SRC;
  group.add(windshield);

  for (const sz of [-0.6, 0.6]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.02), glassMat);
    win.position.set(0.3, 1.0, sz);
    win.userData.sourceFile = SRC;
    group.add(win);
  }

  // ── Engine cowling ──
  const cowl = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.9), darkMat);
  cowl.position.set(-0.5, 1.15, 0);
  cowl.userData.sourceFile = SRC;
  group.add(cowl);

  // ── Tail boom: 3 sections, abutting end-to-end, NO overlap ──
  // Cabin spans from x=-0.8 to x=1.4 (center 0.3, half-width 1.1)
  // Tail root: half-width 0.7, placed so front edge meets cabin rear edge
  const tailRootHW = 0.7;
  const tailRootX = -0.8 - tailRootHW; // -1.5: front edge at -0.8
  const tailRoot = new THREE.Mesh(new THREE.BoxGeometry(tailRootHW * 2, 0.35, 0.5), bodyMat);
  tailRoot.position.set(tailRootX, 0.75, 0);
  tailRoot.userData.sourceFile = SRC;
  group.add(tailRoot);

  // Tail mid: half-width 0.6, front edge meets tail root rear edge
  const tailMidHW = 0.6;
  const tailMidX = tailRootX - tailRootHW - tailMidHW; // -2.8
  const tailMid = new THREE.Mesh(new THREE.BoxGeometry(tailMidHW * 2, 0.25, 0.35), bodyMat);
  tailMid.position.set(tailMidX, 0.72, 0);
  tailMid.userData.sourceFile = SRC;
  group.add(tailMid);

  // Tail tip: half-width 0.5, front edge meets tail mid rear edge
  const tailTipHW = 0.5;
  const tailTipX = tailMidX - tailMidHW - tailTipHW; // -3.9
  const tailTip = new THREE.Mesh(new THREE.BoxGeometry(tailTipHW * 2, 0.18, 0.25), bodyMat);
  tailTip.position.set(tailTipX, 0.7, 0);
  tailTip.userData.sourceFile = SRC;
  group.add(tailTip);

  // ── Vertical fin (at tail tip rear edge) ──
  const finX = tailTipX - tailTipHW;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.5), bodyMat);
  fin.position.set(finX, 0.98, 0);
  fin.userData.sourceFile = SRC;
  group.add(fin);

  // ── Horizontal stabilizer ──
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 1.3), bodyMat);
  stab.position.set(tailTipX, 0.82, 0);
  stab.userData.sourceFile = SRC;
  group.add(stab);

  // ── Main rotor ──
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), chromeMat);
  mast.position.set(0.3, 1.4, 0);
  mast.userData.sourceFile = SRC;
  group.add(mast);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), hubMat);
  hub.position.set(0.3, 1.65, 0);
  hub.userData.sourceFile = SRC;
  group.add(hub);

  const bladeLen = 2.2;
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(bladeLen, 0.02, 0.18), bladeMat);
  b1.position.set(0.3, 1.66, 0);
  b1.userData.sourceFile = SRC;
  group.add(b1);

  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, bladeLen), bladeMat);
  b2.position.set(0.3, 1.66, 0);
  b2.userData.sourceFile = SRC;
  group.add(b2);

  // ── Tail rotor (on right side of fin) ──
  const trMast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 6), chromeMat);
  trMast.rotation.x = Math.PI / 2;
  trMast.position.set(finX - 0.03, 0.72, 0.28);
  trMast.userData.sourceFile = SRC;
  group.add(trMast);

  const tb1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.03), bladeMat);
  tb1.position.set(finX - 0.03, 0.72, 0.28);
  tb1.userData.sourceFile = SRC;
  group.add(tb1);

  const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.28), bladeMat);
  tb2.position.set(finX - 0.03, 0.72, 0.28);
  tb2.userData.sourceFile = SRC;
  group.add(tb2);

  // ── Skids ──
  for (const sz of [-0.55, 0.55]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.8, 8), chromeMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(0.1, 0.17, sz);
    skid.userData.sourceFile = SRC;
    group.add(skid);

    const fStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), chromeMat);
    fStrut.position.set(0.8, 0.38, sz);
    fStrut.userData.sourceFile = SRC;
    group.add(fStrut);

    const rStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 6), chromeMat);
    rStrut.position.set(-0.6, 0.38, sz);
    rStrut.userData.sourceFile = SRC;
    group.add(rStrut);
  }

  for (const dx of [-0.6, 0.8]) {
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.1, 6), chromeMat);
    cross.rotation.x = Math.PI / 2;
    cross.position.set(dx, 0.38, 0);
    cross.userData.sourceFile = SRC;
    group.add(cross);
  }

  // ── Navigation lights ──
  const portLight = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), redLightMat);
  portLight.position.set(1.5, 0.6, -0.6);
  portLight.userData.sourceFile = SRC;
  group.add(portLight);

  const stbdLight = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), greenLightMat);
  stbdLight.position.set(1.5, 0.6, 0.6);
  stbdLight.userData.sourceFile = SRC;
  group.add(stbdLight);

  const tailBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), redLightMat);
  tailBeacon.position.set(finX, 1.2, 0);
  tailBeacon.userData.sourceFile = SRC;
  group.add(tailBeacon);

  const bellyBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), redLightMat);
  bellyBeacon.position.set(0.3, 0.15, 0);
  bellyBeacon.userData.sourceFile = SRC;
  group.add(bellyBeacon);

  // ── Search light ──
  const search = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), darkMat);
  search.position.set(1.5, 0.3, 0);
  search.userData.sourceFile = SRC;
  group.add(search);

  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), whiteLightMat);
  lens.position.set(1.5, 0.24, 0);
  lens.userData.sourceFile = SRC;
  group.add(lens);

  // ── Exhaust ──
  for (const sz of [-0.28, 0.28]) {
    const exh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 6), darkMat);
    exh.rotation.x = Math.PI / 2;
    exh.position.set(-1.1, 1.1, sz);
    exh.userData.sourceFile = SRC;
    group.add(exh);
  }

  // ── Antenna ──
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 4), chromeMat);
  ant.position.set(-0.8, 1.38, 0);
  ant.userData.sourceFile = SRC;
  group.add(ant);

  return group;
}
