// assets/props/market/yagVarili.js — Yağ Varili Prefab
// Oil barrel with CanvasTexture hazard label, ribbed body, oil puddle.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/yagVarili.js';

function makeVarilTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark metallic base
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal ribs
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 2;
  for (let y = 15; y < 256; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Yellow hazard label in center
  ctx.fillStyle = '#cc8800';
  ctx.fillRect(70, 80, 116, 90);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.strokeRect(70, 80, 116, 90);

  // Hazard symbol
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠', 128, 112);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText('MOTOR', 128, 136);
  ctx.fillText('YAĞI', 128, 152);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createYagVarili() {
  if (!cachedTexture) cachedTexture = makeVarilTexture();

  const group = new THREE.Group();
  group.name = 'YagVarili';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Yağ Varili';
  group.userData.flammable = true;
  group.userData.tags = ['barrel', 'oil', 'flammable'];

  const barrelR = 0.30, barrelL = 0.75;

  // Barrel body with texture
  const barrelMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(barrelR, barrelR, barrelL, 16), barrelMat);
  body.rotation.z = Math.PI / 2;
  body.position.set(0, barrelR * 0.75, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // End caps (rims)
  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(barrelR + 0.025, barrelR + 0.025, 0.05, 16),
      MAT.DARK_METAL
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.set(side * barrelL / 2, barrelR * 0.75, 0);
    rim.userData.sourceFile = SRC;
    group.add(rim);

    // End disc
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(barrelR, barrelR, 0.03, 16),
      MAT.METAL
    );
    disc.rotation.z = Math.PI / 2;
    disc.position.set(side * (barrelL / 2 + 0.03), barrelR * 0.75, 0);
    disc.userData.sourceFile = SRC;
    group.add(disc);
  }

  // Oil puddle underneath
  const puddle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.40, 0.02, 12),
    new THREE.MeshLambertMaterial({ color: 0x111111, transparent: true, opacity: 0.5 })
  );
  puddle.position.set(0, 0.01, -0.05);
  puddle.userData.sourceFile = SRC;
  group.add(puddle);

  return group;
}
