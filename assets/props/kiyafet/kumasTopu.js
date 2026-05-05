// assets/props/kiyafet/kumasTopu.js — Kumas Topu Prefab
// Fabric bolt/roll with CanvasTexture pattern, end caps, shelf decor.

import * as THREE from 'three';
import { cylMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/kumasTopu.js';

function makeFabricTexture(colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 200;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 128, 200);

  // Fabric weave lines (horizontal)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 200; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }

  // Subtle vertical lines
  for (let x = 0; x < 128; x += 3) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 200);
    ctx.stroke();
  }

  // Light highlight stripe
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.12)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 200);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const texCache = {};
function getFabricTexture(colorHex) {
  if (!texCache[colorHex]) texCache[colorHex] = makeFabricTexture(colorHex);
  return texCache[colorHex];
}

export function createKumasTopu(color = 0xcc3333) {
  const colorHex = '#' + color.toString(16).padStart(6, '0');
  const tex = getFabricTexture(colorHex);

  const group = new THREE.Group();
  group.name = 'KumasTopu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Kumaş Topu';

  const fabricMat = new THREE.MeshLambertMaterial({ map: tex });
  const capMat = new THREE.MeshLambertMaterial({ color: 0x444444 });

  // Main roll body with fabric texture
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 14), fabricMat);
  body.position.y = 0.19;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top end cap
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 12), capMat);
  capTop.position.y = 0.39;
  capTop.userData.sourceFile = SRC;
  group.add(capTop);

  // Bottom end cap
  const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 12), capMat);
  capBot.position.y = 0.01;
  capBot.userData.sourceFile = SRC;
  group.add(capBot);

  // Cardboard core visible at top (small inner circle)
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8),
    new THREE.MeshLambertMaterial({ color: 0xc4956a })
  );
  core.position.y = 0.40;
  core.userData.sourceFile = SRC;
  group.add(core);

  return group;
}
