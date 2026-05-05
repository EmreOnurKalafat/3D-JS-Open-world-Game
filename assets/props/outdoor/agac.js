// assets/props/outdoor/agac.js — Low-Poly Tree (A-grade)
// Tree with CanvasTexture bark, dual-layer canopy, and roots.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/agac.js';

function makeBarkTex() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#5c4033';
  ctx.fillRect(0, 0, size, size);

  // Bark ridges
  for (let i = 0; i < 80; i++) {
    const alpha = 0.05 + Math.random() * 0.15;
    ctx.strokeStyle = `rgba(30,15,5,${alpha})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    const y = Math.random() * size;
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.04) * 5);
    }
    ctx.stroke();
  }

  // Cracks
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = 'rgba(20,10,0,0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const sy = Math.random() * size;
    ctx.moveTo(0, sy);
    for (let x = 0; x < size; x += 5) {
      ctx.lineTo(x, sy + (Math.random() - 0.5) * 6);
    }
    ctx.stroke();
  }

  // Lighter patches
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = 'rgba(140,110,80,0.15)';
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 8 + Math.random() * 15, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLeafTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2d6a1e';
  ctx.fillRect(0, 0, size, size);

  // Leaf cluster pattern
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 80 + Math.random() * 100;
    ctx.fillStyle = `rgba(0,${shade},0,0.4)`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlight patches
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = 'rgba(120,200,40,0.15)';
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 15 + Math.random() * 25, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedBark = null, cachedLeaf = null;
function getBarkTex() { if (!cachedBark) cachedBark = makeBarkTex(); return cachedBark; }
function getLeafTex() { if (!cachedLeaf) cachedLeaf = makeLeafTex(); return cachedLeaf; }

export function createAgac(scale = 1.0) {
  const group = new THREE.Group();
  group.name = 'Agac';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ağaç';

  const s = scale;
  const barkMat = new THREE.MeshLambertMaterial({ map: getBarkTex() });
  const leafMat = new THREE.MeshLambertMaterial({ map: getLeafTex() });

  // Trunk (tapered)
  const trunk = cylMesh(0.12 * s, 0.2 * s, 2.6 * s, 12, barkMat);
  trunk.position.set(0, 1.3 * s, 0);
  trunk.userData.sourceFile = SRC;
  group.add(trunk);

  // Surface roots
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const root = cylMesh(0.04 * s, 0.08 * s, 0.4 * s, 8, barkMat);
    root.position.set(Math.cos(angle) * 0.15 * s, 0.1 * s, Math.sin(angle) * 0.15 * s);
    root.rotation.z = Math.cos(angle) * 0.6;
    root.rotation.x = Math.sin(angle) * 0.6;
    root.userData.sourceFile = SRC;
    group.add(root);
  }

  // Branch stubs
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.3;
    const branch = cylMesh(0.025 * s, 0.04 * s, 0.5 * s, 8, barkMat);
    branch.position.set(Math.cos(angle) * 0.1 * s, 2.2 * s, Math.sin(angle) * 0.1 * s);
    branch.rotation.z = Math.cos(angle) * 0.5;
    branch.rotation.x = Math.sin(angle) * 0.5;
    branch.userData.sourceFile = SRC;
    group.add(branch);
  }

  // Main canopy
  const canopyGeo = new THREE.IcosahedronGeometry(1.4 * s, 2);
  const canopy = new THREE.Mesh(canopyGeo, leafMat);
  canopy.position.set(0, 3.3 * s, 0);
  canopy.castShadow = true;
  canopy.userData.sourceFile = SRC;
  group.add(canopy);

  // Secondary canopy (lower, wider spread)
  const canopy2Geo = new THREE.IcosahedronGeometry(1.2 * s, 1);
  const canopy2 = new THREE.Mesh(canopy2Geo, leafMat);
  canopy2.position.set(0.4 * s, 2.6 * s, -0.2 * s);
  canopy2.castShadow = true;
  canopy2.userData.sourceFile = SRC;
  group.add(canopy2);

  const canopy3Geo = new THREE.IcosahedronGeometry(1.0 * s, 1);
  const canopy3 = new THREE.Mesh(canopy3Geo, leafMat);
  canopy3.position.set(-0.3 * s, 2.8 * s, 0.3 * s);
  canopy3.castShadow = true;
  canopy3.userData.sourceFile = SRC;
  group.add(canopy3);

  return group;
}
