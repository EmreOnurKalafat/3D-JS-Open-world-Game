// assets/props/market/manavTezgahi.js — Manav Tezgahi Prefab
// Produce stand with CanvasTexture fruit display, slanted top, back shelf.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/manavTezgahi.js';

function makeManavTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Green produce display
  ctx.fillStyle = '#228833';
  ctx.fillRect(0, 0, 512, 128);

  // Fruit/vegetable items rendered as colored circles
  const items = [
    { x: 40, c: '#ff3333', r: 16 },   // apple
    { x: 85, c: '#ffaa00', r: 14 },   // orange
    { x: 130, c: '#ffdd00', r: 10 },  // lemon
    { x: 170, c: '#44cc44', r: 15 },  // lime
    { x: 215, c: '#cc3333', r: 17 },  // tomato
    { x: 265, c: '#8844cc', r: 13 },  // grape
    { x: 310, c: '#ff8833', r: 14 },  // peach
    { x: 355, c: '#ffdd00', r: 16 },  // banana
    { x: 400, c: '#44aa22', r: 18 },  // green apple
    { x: 448, c: '#ff5555', r: 14 },  // strawberry
  ];

  for (const item of items) {
    ctx.fillStyle = item.c;
    ctx.beginPath();
    ctx.arc(item.x, 42, item.r, 0, Math.PI * 2);
    ctx.fill();
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(item.x - 3, 36, item.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wood shelf edge at bottom
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 100, 512, 28);

  // Price tags
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.fillText('₺9.99', 32, 90);
  ctx.fillText('₺12.99', 77, 90);
  ctx.fillText('₺6.99', 122, 90);
  ctx.fillText('₺8.99', 163, 90);
  ctx.fillText('₺15.99', 205, 90);
  ctx.fillText('₺24.99', 255, 90);
  ctx.fillText('₺10.99', 302, 90);
  ctx.fillText('₺7.99', 347, 90);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createManavTezgahi() {
  if (!cachedTexture) cachedTexture = makeManavTexture();

  const group = new THREE.Group();
  group.name = 'ManavTezgahi';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Manav Tezgahı';

  const w = 3.0, d = 1.2, h = 1.0;

  // Slanted display top with CanvasTexture
  const texMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const top = boxMesh(w, 0.06, d, texMat);
  top.position.set(0, h, 0);
  top.rotation.x = -0.22;
  top.userData.sourceFile = SRC;
  group.add(top);

  // Front panel
  const front = boxMesh(w, 0.6, 0.05, MAT.FURNITURE_WOOD);
  front.position.set(0, 0.3, d / 2 - 0.03);
  front.userData.sourceFile = SRC;
  group.add(front);

  // Side panels
  for (const side of [-1, 1]) {
    const sidePanel = boxMesh(0.05, 0.6, d, MAT.FURNITURE_WOOD);
    sidePanel.position.set(side * (w / 2 - 0.03), 0.3, 0);
    sidePanel.userData.sourceFile = SRC;
    group.add(sidePanel);
  }

  // Legs
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = boxMesh(0.08, 0.35, 0.08, MAT.DARK_METAL);
      leg.position.set(sx * (w / 2 - 0.15), 0.18, sz * (d / 2 - 0.15));
      leg.userData.sourceFile = SRC;
      group.add(leg);
    }
  }

  // Back riser shelf
  const riser = boxMesh(w - 0.2, 0.10, 0.40, MAT.FURNITURE_WOOD);
  riser.position.set(0, h + 0.20, -d / 2 + 0.22);
  riser.userData.sourceFile = SRC;
  group.add(riser);

  // Green accent trim
  const trim = boxMesh(w - 0.1, 0.04, 0.06, MAT.LEAF);
  trim.position.set(0, h + 0.34, -d / 2 + 0.22);
  trim.userData.sourceFile = SRC;
  group.add(trim);

  return group;
}
