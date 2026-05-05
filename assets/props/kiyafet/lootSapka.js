// assets/props/kiyafet/lootSapka.js — Loot: Hat/Cap (A-grade)
// Baseball cap with CanvasTexture fabric, curved brim, ventilation eyelets.

import * as THREE from 'three';
import { boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/lootSapka.js';

function makeCapTex(colorHex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, size, size);

  // Panel seams (6-panel cap)
  for (let i = 1; i < 6; i++) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    const x = i * (size / 6);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Top button
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Subtle worn edges
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBrimTex(colorHex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.7);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Brim curvature shading
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, 'rgba(0,0,0,0.1)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stitch lines
  for (let x = 0; x < canvas.width; x += 12) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cacheCrown = {}, cacheBrim = {};
function getCrownTex(hex) { if (!cacheCrown[hex]) cacheCrown[hex] = makeCapTex(hex); return cacheCrown[hex]; }
function getBrimTex(hex) { if (!cacheBrim[hex]) cacheBrim[hex] = makeBrimTex(hex); return cacheBrim[hex]; }

export function createLootSapka() {
  const group = new THREE.Group();
  group.name = 'LootSapka';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Şapka (Loot)';
  group.userData.lootType = 'accessory';

  const baseColor = '#2c3e50';
  const crownMat = new THREE.MeshLambertMaterial({ map: getCrownTex(baseColor) });
  const brimMat = new THREE.MeshLambertMaterial({ map: getBrimTex(baseColor) });
  const accentMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });

  // Crown (main dome of cap)
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.12, 16), crownMat);
  crown.position.set(0, 0.1, 0);
  crown.userData.sourceFile = SRC;
  group.add(crown);

  // Crown top (flat top closure)
  const topDisc = cylMesh(0.07, 0.08, 0.02, 12, crownMat);
  topDisc.position.set(0, 0.17, 0);
  topDisc.userData.sourceFile = SRC;
  group.add(topDisc);

  // Top button
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), accentMat);
  button.position.set(0, 0.185, 0);
  button.userData.sourceFile = SRC;
  group.add(button);

  // Curved brim
  const brim = boxMesh(0.12, 0.025, 0.18, brimMat);
  brim.position.set(0, 0.08, 0.14);
  brim.rotation.x = -0.15;
  brim.userData.sourceFile = SRC;
  group.add(brim);

  // Brim edge stitch
  const brimEdge = boxMesh(0.12, 0.01, 0.18, accentMat);
  brimEdge.position.set(0, 0.065, 0.15);
  brimEdge.userData.sourceFile = SRC;
  group.add(brimEdge);

  // Eyelets (ventilation holes)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const ex = Math.cos(angle) * 0.09, ez = Math.sin(angle) * 0.09;
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.01, 0.004, 4, 8), accentMat);
    eyelet.position.set(ex, 0.12, ez);
    eyelet.rotation.x = Math.PI / 2;
    eyelet.userData.sourceFile = SRC;
    group.add(eyellet);
  }

  return group;
}
