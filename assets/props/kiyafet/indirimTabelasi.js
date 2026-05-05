// assets/props/kiyafet/indirimTabelasi.js — Indirim Tabelasi Prefab
// Hanging sale sign with CanvasTexture badge, string, and eye-catching design.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/indirimTabelasi.js';

/** Generate a sale badge texture */
function makeIndirimTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 1.45);
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Red burst background
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(0, 0, w, h);

  // Yellow starburst rays
  ctx.fillStyle = '#ffcc00';
  const cx = w / 2, cy = h * 0.45;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - 0.12) * w * 0.7, cy + Math.sin(angle - 0.12) * h * 0.55);
    ctx.lineTo(cx + Math.cos(angle + 0.12) * w * 0.7, cy + Math.sin(angle + 0.12) * h * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  // Red center circle
  const gradient = ctx.createRadialGradient(cx, cy, w * 0.08, cx, cy, w * 0.35);
  gradient.addColorStop(0, '#ee2222');
  gradient.addColorStop(1, '#aa0000');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // White ring border for center
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.33, 0, Math.PI * 2);
  ctx.stroke();

  // "%50" big text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('%50', cx, cy - 6);

  // "İNDİRİM" below
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('İNDİRİM', cx, cy + 42);

  // Top "BÜYÜK" text
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('BÜYÜK', cx, h * 0.15);

  // Bottom "FI RSAT" text
  ctx.fillText('FIRSAT', cx, h * 0.84);

  // White border around entire sign
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;
function getTexture() {
  if (!cachedTexture) cachedTexture = makeIndirimTexture();
  return cachedTexture;
}

export function createIndirimTabelasi() {
  const group = new THREE.Group();
  group.name = 'IndirimTabelasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'İndirim Tabelası';

  const w = 0.45, h = 0.65;

  // Main sign panel with CanvasTexture
  const tex = getTexture();
  const signMat = new THREE.MeshLambertMaterial({ map: tex });
  const panel = boxMesh(w, h, 0.03, signMat);
  panel.position.set(0, h / 2, 0);
  panel.userData.sourceFile = SRC;
  group.add(panel);

  // White border trim
  const fw = w + 0.015, fh = h + 0.015;
  const frame = boxMesh(fw, fh, 0.025, MAT.WHITE);
  frame.position.set(0, h / 2, -0.006);
  frame.userData.sourceFile = SRC;
  group.add(frame);

  // Top hole for string
  const hole = boxMesh(0.025, 0.02, 0.035, MAT.DARK_METAL);
  hole.position.set(0, h - 0.025, 0);
  hole.userData.sourceFile = SRC;
  group.add(hole);

  // Hanging string (thin cylinder going up)
  const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6);
  const string = new THREE.Mesh(stringGeo, MAT.DARK_METAL);
  string.position.set(0, h + 0.12, 0);
  string.userData.sourceFile = SRC;
  group.add(string);

  // Ceiling attachment ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.03, 0.008, 6, 8),
    MAT.DARK_METAL
  );
  ring.position.set(0, h + 0.25, 0);
  ring.userData.sourceFile = SRC;
  group.add(ring);

  return group;
}
