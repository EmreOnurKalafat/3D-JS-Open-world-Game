// assets/props/kiyafet/bedenEtiketi.js — Beden Etiketi Prefab
// Shelf-edge size tag with CanvasTexture size letter and string hole.

import * as THREE from 'three';
import { GEO, MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/kiyafet/bedenEtiketi.js';

const SIZE_COLORS = {
  XS: '#9944aa',
  S:  '#339955',
  M:  '#3366aa',
  L:  '#cc7733',
  XL: '#cc3333',
  XXL:'#aa2222',
};

/** Generate a tag texture with the size letter */
function makeSizeTagTexture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  const bgColor = SIZE_COLORS[size] || '#3366aa';

  // Rounded rectangle background
  const r = 12;
  const pad = 6;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(pad + r, pad);
  ctx.lineTo(canvas.width - pad - r, pad);
  ctx.arcTo(canvas.width - pad, pad, canvas.width - pad, pad + r, r);
  ctx.lineTo(canvas.width - pad, canvas.height - pad - r);
  ctx.arcTo(canvas.width - pad, canvas.height - pad, canvas.width - pad - r, canvas.height - pad, r);
  ctx.lineTo(pad + r, canvas.height - pad);
  ctx.arcTo(pad, canvas.height - pad, pad, canvas.height - pad - r, r);
  ctx.lineTo(pad, pad + r);
  ctx.arcTo(pad, pad, pad + r, pad, r);
  ctx.closePath();
  ctx.fill();

  // White border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Size text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(size, canvas.width / 2, canvas.height / 2 - 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const texCache = {};
function getSizeTexture(size) {
  if (!texCache[size]) texCache[size] = makeSizeTagTexture(size);
  return texCache[size];
}

export function createBedenEtiketi(size = 'M') {
  const group = new THREE.Group();
  group.name = 'BedenEtiketi_' + size;
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Beden: ' + size;

  const w = 0.15, h = 0.19;

  // Tag with CanvasTexture
  const tex = getSizeTexture(size);
  const tagMat = new THREE.MeshLambertMaterial({ map: tex });
  const tag = boxMesh(w, h, 0.01, tagMat);
  tag.position.set(0, h / 2, 0);
  tag.userData.sourceFile = SRC;
  group.add(tag);

  // White border frame
  const fw = w + 0.012, fh = h + 0.012;
  const frame = boxMesh(fw, fh, 0.004, MAT.WHITE);
  frame.position.set(0, h / 2, -0.004);
  frame.userData.sourceFile = SRC;
  group.add(frame);

  // String hole (small dark circle at top, simulated with tiny dark box)
  const hole = boxMesh(0.02, 0.015, 0.012, MAT.TRIM);
  hole.position.set(0, h - 0.025, 0.006);
  hole.userData.sourceFile = SRC;
  group.add(hole);

  // Attachment string/loop
  const stringLoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.02, 0.005, 6, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b7355 })
  );
  stringLoop.position.set(0, h - 0.025, 0.01);
  stringLoop.userData.sourceFile = SRC;
  group.add(stringLoop);

  return group;
}
