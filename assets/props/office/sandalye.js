// assets/props/office/sandalye.js — Office Chair (A-grade)
// Ergonomic swivel chair with CanvasTexture fabric, armrests, gas lift, 5-star base.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/sandalye.js';

function makeFabricTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 5) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, y, size, 2);
  }
  for (let x = 0; x < size; x += 5) {
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, 0, 2, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeFabricTex(); return cachedTex; }

export function createSandalye() {
  const group = new THREE.Group();
  group.name = 'Sandalye';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ofis Sandalyesi';

  const fabricMat = new THREE.MeshLambertMaterial({ map: getTex() });
  const plasticMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xbbbbbb });

  // Seat cushion
  const seat = boxMesh(0.5, 0.07, 0.48, fabricMat);
  seat.position.set(0, 0.5, 0);
  seat.userData.sourceFile = SRC;
  group.add(seat);

  // Backrest with lumbar bump
  const back = boxMesh(0.46, 0.48, 0.05, fabricMat);
  back.position.set(0, 0.72, -0.23);
  back.userData.sourceFile = SRC;
  group.add(back);

  // Backrest frame
  const backFrame = boxMesh(0.44, 0.05, 0.04, plasticMat);
  backFrame.position.set(0, 0.97, -0.23);
  backFrame.userData.sourceFile = SRC;
  group.add(backFrame);

  // Armrests
  for (const dx of [-0.25, 0.25]) {
    const armPad = boxMesh(0.06, 0.025, 0.2, plasticMat);
    armPad.position.set(dx, 0.54, 0.04);
    armPad.userData.sourceFile = SRC;
    group.add(armPad);
    const armPost = cylMesh(0.018, 0.018, 0.12, 8, chromeMat);
    armPost.position.set(dx, 0.47, 0.1);
    armPost.userData.sourceFile = SRC;
    group.add(armPost);
  }

  // Seat base plate
  const plate = boxMesh(0.3, 0.03, 0.3, plasticMat);
  plate.position.set(0, 0.43, 0);
  plate.userData.sourceFile = SRC;
  group.add(plate);

  // Gas lift cylinder
  const lift = cylMesh(0.03, 0.035, 0.22, 12, chromeMat);
  lift.position.set(0, 0.3, 0);
  lift.userData.sourceFile = SRC;
  group.add(lift);

  // 5-star base — 5 legs radiating
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leg = boxMesh(0.25, 0.025, 0.04, plasticMat);
    leg.position.set(Math.cos(angle) * 0.12, 0.08, Math.sin(angle) * 0.12);
    leg.rotation.y = -angle;
    leg.userData.sourceFile = SRC;
    group.add(leg);

    // Caster wheel
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.012, 6, 8), plasticMat);
    wheel.position.set(Math.cos(angle) * 0.28, 0.04, Math.sin(angle) * 0.28);
    wheel.rotation.x = Math.PI / 2;
    wheel.userData.sourceFile = SRC;
    group.add(wheel);
  }

  return group;
}
