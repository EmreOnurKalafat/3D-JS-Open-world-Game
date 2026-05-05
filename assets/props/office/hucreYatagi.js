// assets/props/office/hucreYatagi.js — Prison Cell Bed (A-grade)
// Concrete slab bed with thin mattress, pillow, and wall-mounted frame.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/office/hucreYatagi.js';

function makeConcreteTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c0b8a8';
  ctx.fillRect(0, 0, size, size);

  // Concrete noise
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = 120 + Math.random() * 30;
    ctx.fillStyle = `rgba(${s},${s - 5},${s - 10},0.3)`;
    ctx.fillRect(x, y, 3, 3);
  }

  // Crack lines
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = 'rgba(80,75,65,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const sy = Math.random() * size;
    ctx.moveTo(0, sy);
    for (let x = 0; x < size; x += 8) {
      ctx.lineTo(x, sy + Math.sin(x * 0.1) * 6 + (Math.random() - 0.5) * 4);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeThinMattressTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6b7b3a';
  ctx.fillRect(0, 0, size, size);

  // Fabric texture
  for (let y = 0; y < size; y += 8) {
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, y, size, 4);
  }

  // Stains
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = 'rgba(50,40,20,0.1)';
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 15 + Math.random() * 20, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedConc = null, cachedMatt = null;
function getConcTex() { if (!cachedConc) cachedConc = makeConcreteTexture(); return cachedConc; }
function getMattTex() { if (!cachedMatt) cachedMatt = makeThinMattressTexture(); return cachedMatt; }

export function createHucreYatagi() {
  const group = new THREE.Group();
  group.name = 'HucreYatagi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Hücre Yatağı';

  const concMat = new THREE.MeshLambertMaterial({ map: getConcTex() });
  const mattMat = new THREE.MeshLambertMaterial({ map: getMattTex() });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

  // Concrete base slab (wall-mounted cantilever style)
  const base = boxMesh(1.0, 0.2, 2.0, concMat);
  base.position.set(0, 0.6, 0);
  base.userData.sourceFile = SRC;
  group.add(base);

  // Wall mounting bracket (rear)
  const bracket = boxMesh(0.06, 0.15, 1.9, metalMat);
  bracket.position.set(0.96, 0.6, 0);
  bracket.userData.sourceFile = SRC;
  group.add(bracket);

  // Metal support legs at front
  for (const dz of [-0.8, 0.8]) {
    const leg = cylMesh(0.025, 0.025, 0.55, 8, metalMat);
    leg.position.set(-0.3, 0.28, dz);
    leg.userData.sourceFile = SRC;
    group.add(leg);
  }

  // Thin mattress on top
  const mattress = boxMesh(0.96, 0.05, 1.96, mattMat);
  mattress.position.set(0, 0.73, 0);
  mattress.userData.sourceFile = SRC;
  group.add(mattress);

  // Pillow (folded thin mattress style)
  const pillowMat = new THREE.MeshLambertMaterial({ color: 0x8a9a4a });
  const pillow = boxMesh(0.5, 0.06, 0.4, pillowMat);
  pillow.position.set(0.65, 0.77, 0);
  pillow.userData.sourceFile = SRC;
  group.add(pillow);

  // Blanket (folded at foot)
  const blanketMat = new THREE.MeshLambertMaterial({ color: 0x7a8a8a });
  const blanket = boxMesh(0.5, 0.04, 0.6, blanketMat);
  blanket.position.set(-0.65, 0.76, 0);
  blanket.userData.sourceFile = SRC;
  group.add(blanket);

  return group;
}
