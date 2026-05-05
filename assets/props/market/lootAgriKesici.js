// assets/props/market/lootAgriKesici.js — Agri Kesici Loot Prefab
// Medicine bottle with CanvasTexture label, child-safe cap, orange body.

import * as THREE from 'three';
import { MAT, cylMesh } from '../../resources.js';

const SRC = 'assets/props/market/lootAgriKesici.js';

function makeAgriKesiciTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 180;
  const ctx = canvas.getContext('2d');

  // White label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 128, 180);

  // Red cross top
  ctx.fillStyle = '#dd0000';
  ctx.fillRect(52, 8, 24, 8);
  ctx.fillRect(56, 4, 16, 16);

  // "AĞRI KESİCİ" text
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AĞRI', 64, 38);
  ctx.fillText('KESİCİ', 64, 56);

  // Dosage info
  ctx.fillStyle = '#555555';
  ctx.font = '9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Parasetamol 500mg', 64, 78);

  // Red divider line
  ctx.strokeStyle = '#dd0000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 92);
  ctx.lineTo(108, 92);
  ctx.stroke();

  // Instructions
  ctx.fillStyle = '#444444';
  ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Günde 3 defa', 64, 108);
  ctx.fillText('yemeklerden sonra', 64, 122);
  ctx.fillText('1-2 tablet', 64, 136);

  // Warning bottom
  ctx.fillStyle = '#ff6600';
  ctx.font = 'bold 8px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Reçetesiz satılamaz', 64, 158);

  // Orange border
  ctx.strokeStyle = '#ff8800';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 176);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

let cachedTexture = null;

export function createLootAgriKesici() {
  if (!cachedTexture) cachedTexture = makeAgriKesiciTexture();

  const group = new THREE.Group();
  group.name = 'LootAgriKesici';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Ağrı Kesici';
  group.userData.lootType = 'painkiller';
  group.userData.collectible = true;
  group.userData.tags = ['loot', 'medicine', 'painkiller'];

  // Orange bottle body
  const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff8800 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.32, 12), orangeMat);
  body.position.y = 0.16;
  body.userData.sourceFile = SRC;
  group.add(body);

  // White label with CanvasTexture
  const labelMat = new THREE.MeshLambertMaterial({ map: cachedTexture });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.065, 0.22, 12), labelMat);
  label.position.y = 0.17;
  label.userData.sourceFile = SRC;
  group.add(label);

  // White child-proof cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.07, 12),
    MAT.WHITE
  );
  cap.position.y = 0.35;
  cap.userData.sourceFile = SRC;
  group.add(cap);

  // Cap ridges (vertical lines effect with small boxes)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.04, 0.006),
      MAT.WHITE
    );
    ridge.position.set(
      Math.cos(angle) * 0.09,
      0.35,
      Math.sin(angle) * 0.09
    );
    ridge.rotation.y = -angle;
    ridge.userData.sourceFile = SRC;
    group.add(ridge);
  }

  return group;
}
