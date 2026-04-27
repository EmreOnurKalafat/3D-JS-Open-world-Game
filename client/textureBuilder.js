// client/textureBuilder.js — Procedural CanvasTexture generators

import * as THREE from 'three';

/**
 * Creates a sky gradient texture based on time of day phase
 */
export function makeSkyGradient(phase = 'day') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  switch (phase) {
    case 'sunset':
      gradient.addColorStop(0, '#2c1654');
      gradient.addColorStop(0.3, '#e8734a');
      gradient.addColorStop(0.6, '#f4a261');
      gradient.addColorStop(1, '#e9c46a');
      break;
    case 'night':
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#0d1128');
      gradient.addColorStop(1, '#111133');
      break;
    case 'dawn':
      gradient.addColorStop(0, '#1a1a3e');
      gradient.addColorStop(0.3, '#6b3fa0');
      gradient.addColorStop(0.7, '#f4a261');
      gradient.addColorStop(1, '#87CEEB');
      break;
    default:
      gradient.addColorStop(0, '#4a90d9');
      gradient.addColorStop(0.5, '#87CEEB');
      gradient.addColorStop(1, '#c9e4f7');
      break;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/** Creates a road asphalt texture with lane markings */
export function makeRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#444444';
  ctx.fillRect(0, 0, 256, 256);

  // Asphalt noise
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shade = 60 + Math.random() * 30;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Center dashed line
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.setLineDash([25, 20]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();

  // Edge lines
  ctx.setLineDash([]);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(10, 256);
  ctx.moveTo(246, 0);
  ctx.lineTo(246, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Creates a concrete sidewalk texture */
export function makeSidewalkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(0, 0, 256, 256);

  // Slab grid lines
  ctx.strokeStyle = '#A0A0A0';
  ctx.lineWidth = 2;
  for (let x = 0; x < 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y < 256; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Creates a building facade texture with lit/unlit windows */
export function makeBuildingTexture(floorCount = 6) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Facade base
  ctx.fillStyle = '#3D3D3D';
  ctx.fillRect(0, 0, 128, 256);

  // Horizontal lines between floors
  ctx.strokeStyle = '#2A2A2A';
  ctx.lineWidth = 3;
  const floorH = 256 / floorCount;
  for (let f = 0; f <= floorCount; f++) {
    ctx.beginPath();
    ctx.moveTo(0, f * floorH);
    ctx.lineTo(128, f * floorH);
    ctx.stroke();
  }

  // Windows
  for (let f = 0; f < floorCount; f++) {
    for (let col = 0; col < 3; col++) {
      const wx = 18 + col * 40;
      const wy = f * floorH + 8;
      const lit = Math.random() > 0.3;
      ctx.fillStyle = lit ? '#FFEAA7' : '#1A1A2E';
      ctx.fillRect(wx, wy, 28, 20);
      // Window frame
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx, wy, 28, 20);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Creates a grass texture */
export function makeGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#4A7C3F';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shade = 50 + Math.random() * 60;
    ctx.fillStyle = `rgb(${30 + Math.random() * 20},${shade},${15 + Math.random() * 15})`;
    ctx.fillRect(x, y, 2, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Creates a sand/beach texture */
export function makeSandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#E8D5A3';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shade = 190 + Math.random() * 50;
    ctx.fillStyle = `rgb(${shade},${shade - 20},${shade - 60})`;
    ctx.fillRect(x, y, 3, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Creates an animated water texture */
export function makeWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1A5276';
  ctx.fillRect(0, 0, 256, 256);

  // Simple wave pattern
  for (let y = 0; y < 256; y += 16) {
    for (let x = 0; x < 256; x += 4) {
      const shade = 20 + Math.sin(x * 0.1 + y * 0.05) * 15;
      ctx.fillStyle = `rgb(${15 + shade},${50 + shade},${100 + shade})`;
      ctx.fillRect(x, y + Math.sin(x * 0.05) * 4, 4, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return { texture, canvas, ctx };
}

/** Creates a car paint texture with subtle highlight */
export function makeCarPaintTexture(color = '#FF0000') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);

  // Highlight stripe
  const gradient = ctx.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.15)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/** Creates a minimap road element texture */
export function makeMinimapRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#666666';
  ctx.fillRect(0, 0, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
