// assets/prefabs/complexes/police/textures.js
// CanvasTexture generators for police station signs and wall texture.

import * as THREE from 'three';

/** Creates a CanvasTexture with sign text (R3) */
export function makeSignTexture(text, bgColor, fgColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 88);

  ctx.fillStyle = fgColor;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/** Creates reinforced concrete wall texture (R8) */
export function makePoliceWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6e6e6e';
  ctx.fillRect(0, 0, 512, 512);

  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i] += n; data[i + 1] += n; data[i + 2] += n;
  }
  ctx.putImageData(imageData, 0, 0);

  const panelSize = 64;
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += panelSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y <= 512; y += panelSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const bx = px * panelSize, by = py * panelSize;
      for (let ry = 16; ry < panelSize; ry += 20) {
        ctx.beginPath();
        ctx.moveTo(bx + 4, by + ry);
        ctx.lineTo(bx + panelSize - 4, by + ry);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, 512, 8);
  ctx.fillRect(0, 504, 512, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
