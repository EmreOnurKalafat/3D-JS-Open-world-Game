// assets/props/market/lootEnerji.js — Enerji Icecegi Loot Prefab
// Energy drink can with CanvasTexture logo, metallic ends, sleek design.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootEnerji.js';

function makeEnerjiTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 280;
  const ctx = canvas.getContext('2d');
  const w = 200, h = 280;

  // Dark blue/black base
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);

  // Green lightning bolt stripes
  for (let i = 0; i < 3; i++) {
    const y = h * 0.25 + i * h * 0.22;
    ctx.strokeStyle = i === 1 ? '#00ff66' : '#00cc44';
    ctx.lineWidth = i === 1 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, y);
    ctx.lineTo(w * 0.5, y);
    ctx.lineTo(w * 0.35, y + h * 0.08);
    ctx.lineTo(w * 0.7, y + h * 0.08);
    ctx.lineTo(w * 0.4, y + h * 0.16);
    ctx.stroke();
  }

  // Central "ENERGY" text
  const gradient = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.52);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#88ccff');
  ctx.fillStyle = gradient;
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ENERGY', w / 2, h * 0.44);

  // Silver top and bottom bands
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillRect(0, h - 10, w, 10);

  // Brand arc
  ctx.fillStyle = '#00ff66';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('BOOST', w / 2, h * 0.18);

  // Volume
  ctx.fillStyle = '#888888';
  ctx.font = '10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('500ml', w / 2, h * 0.62);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootEnerji() {
  if (!cachedTexture) cachedTexture = makeEnerjiTexture();

  const group = new THREE.Group();
  group.name = 'LootEnerji';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Enerji İçeceği';
  group.userData.lootType = 'stamina_boost';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'drink', 'energy'];

  const canMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.52, 16), canMat);
  body.position.y = 0.26;
  body.userData.sourceFile = SRC;
  group.add(body);

  // Top rim
  const topRim = cylMesh(0.105, 0.105, 0.03, 12, MAT.METAL);
  topRim.position.y = 0.53;
  topRim.userData.sourceFile = SRC;
  group.add(topRim);

  // Bottom rim
  const botRim = cylMesh(0.105, 0.105, 0.03, 12, MAT.METAL);
  botRim.position.y = 0.015;
  botRim.userData.sourceFile = SRC;
  group.add(botRim);

  return group;
}
