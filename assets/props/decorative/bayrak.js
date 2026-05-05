// assets/props/decorative/bayrak.js — Turkish Flag Prefab
// Pole + CanvasTexture crescent & star on red field.

import * as THREE from 'three';
import { GEO, MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/decorative/bayrak.js';

/** Generate Turkish flag texture — red field, white crescent & star */
function makeTurkishFlagTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 2 / 3); // 3:2 aspect
  const ctx = canvas.getContext('2d');

  // Red field
  ctx.fillStyle = '#e30a17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  // Crescent and star geometry based on Turkish flag spec (scaled to canvas)
  // Outer circle of crescent
  const cx = w * 0.42;
  const cy = h * 0.50;
  const outerR = w * 0.17;
  const innerR = w * 0.14;

  // Draw crescent (white)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.063, cy, innerR, 0, Math.PI * 2, true);
  ctx.fill();

  // Draw 5-point star
  const starCx = cx + w * 0.12;
  const starCy = cy - outerR * 0.45;
  const starR = w * 0.045;

  drawStar(ctx, starCx, starCy, 5, starR, starR * 0.4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function drawStar(ctx, cx, cy, points, outerR, innerR) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// Cache the texture (singleton)
let flagTexture = null;
function getFlagTexture() {
  if (!flagTexture) flagTexture = makeTurkishFlagTexture();
  return flagTexture;
}

export function createBayrak() {
  const group = new THREE.Group();
  group.name = 'Bayrak';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bayrak (Türk Bayrağı)';

  // ── Flag pole ────────────────────────────
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.5, 8), poleMat);
  pole.position.set(0, 2.25, 0);
  pole.castShadow = true;
  pole.userData.sourceFile = SRC;
  group.add(pole);

  // Pole top ornament (gold sphere)
  const topOrnament = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xd4a843 })
  );
  topOrnament.position.set(0, 4.5, 0);
  topOrnament.userData.sourceFile = SRC;
  group.add(topOrnament);

  // ── Flag cloth (plane with texture) ──────
  const tex = getFlagTexture();
  const flagMat = new THREE.MeshLambertMaterial({
    map: tex,
    side: THREE.DoubleSide,
  });

  // Use a custom plane so we can set UVs properly
  const flagGeo = new THREE.PlaneGeometry(1.2, 0.8, 6, 4);
  // Slight vertex displacement for wavy look
  const posAttr = flagGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    // Gentle wave along x, varying with y
    posAttr.setZ(i, Math.sin(x * 4.5) * 0.04 + Math.sin(y * 3.0) * 0.02);
  }
  flagGeo.computeVertexNormals();

  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(0.04, 3.8, 0.40);
  flag.rotation.y = 0.05;
  flag.castShadow = true;
  flag.userData.sourceFile = SRC;
  group.add(flag);

  // ── Rope/tie detail ──────────────────────
  for (let yOff of [0.0, -0.35]) {
    const rope = boxMesh(0.06, 0.03, 0.03, new THREE.MeshLambertMaterial({ color: 0x8b7355 }));
    rope.position.set(0.02, 3.85 + yOff, 0.02);
    rope.userData.sourceFile = SRC;
    group.add(rope);
  }

  return group;
}
