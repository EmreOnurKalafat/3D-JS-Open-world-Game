// assets/props/market/tavanTabelasi.js — Ceiling Directional Sign Prefab
// Hanging sign panel with CanvasTexture text & arrow, suspension cables.

import * as THREE from 'three';
import { GEO, MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/tavanTabelasi.js';

/** Build a sign face texture with text and arrow */
function makeSignTexture(label = 'REYON', arrowDir = 'left') {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Blue background
  ctx.fillStyle = '#003399';
  ctx.fillRect(0, 0, w, h);

  // White border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Arrow
  ctx.fillStyle = '#ffffff';
  const arrowY = h / 2;
  const arrowSize = 30;

  if (arrowDir === 'left') {
    ctx.beginPath();
    ctx.moveTo(w * 0.78, arrowY);
    ctx.lineTo(w * 0.78 + 50, arrowY - arrowSize);
    ctx.lineTo(w * 0.78 + 50, arrowY - 12);
    ctx.lineTo(w * 0.95, arrowY - 12);
    ctx.lineTo(w * 0.95, arrowY + 12);
    ctx.lineTo(w * 0.78 + 50, arrowY + 12);
    ctx.lineTo(w * 0.78 + 50, arrowY + arrowSize);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(w * 0.78 + 50, arrowY);
    ctx.lineTo(w * 0.78, arrowY - arrowSize);
    ctx.lineTo(w * 0.78, arrowY - 12);
    ctx.lineTo(w * 0.22, arrowY - 12);
    ctx.lineTo(w * 0.22, arrowY + 12);
    ctx.lineTo(w * 0.78, arrowY + 12);
    ctx.lineTo(w * 0.78, arrowY + arrowSize);
    ctx.closePath();
    ctx.fill();
  }

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w * 0.45, h / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Cache textures by label+dir combo
const texCache = {};
function getSignTexture(label, arrowDir) {
  const key = `${label}_${arrowDir}`;
  if (!texCache[key]) texCache[key] = makeSignTexture(label, arrowDir);
  return texCache[key];
}

export function createTavanTabelasi(label = 'REYON', arrowDir = 'left') {
  const group = new THREE.Group();
  group.name = 'TavanTabelasi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = `Tavan Tabelası: ${label}`;

  // ── Sign panel with CanvasTexture ────────
  const tex = getSignTexture(label, arrowDir);
  const signMat = new THREE.MeshLambertMaterial({ map: tex });
  const panel = boxMesh(2.2, 0.30, 0.06, signMat);
  panel.userData.sourceFile = SRC;
  group.add(panel);

  // ── Thin white border trim ───────────────
  const topTrim = boxMesh(2.24, 0.03, 0.07, MAT.WHITE);
  topTrim.position.y = 0.16;
  topTrim.userData.sourceFile = SRC;
  group.add(topTrim);

  const botTrim = boxMesh(2.24, 0.03, 0.07, MAT.WHITE);
  botTrim.position.y = -0.16;
  botTrim.userData.sourceFile = SRC;
  group.add(botTrim);

  // ── Suspension cables (2) ────────────────
  for (const side of [-1, 1]) {
    const cable = boxMesh(0.025, 0.45, 0.025, MAT.DARK_METAL);
    cable.position.set(side * 0.85, 0.37, 0);
    cable.userData.sourceFile = SRC;
    group.add(cable);
  }

  // ── Ceiling bracket ──────────────────────
  const bracket = boxMesh(2.1, 0.05, 0.06, MAT.DARK_METAL);
  bracket.position.set(0, 0.60, 0);
  bracket.userData.sourceFile = SRC;
  group.add(bracket);

  return group;
}
