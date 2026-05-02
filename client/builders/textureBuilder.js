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

/**
 * Draws building facade onto an existing canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} baseColor - wall color hex
 * @param {number} litRatio - 0..1 fraction of lit windows
 * @param {number} nightFactor - 0=full day, 1=full night (smooth)
 * @param {Array<{x:number,y:number,lit:boolean}>} windowData - pre-generated window states
 */
function drawBuildingFacade(ctx, baseColor, litRatio, nightFactor, windowData) {
  // Base wall
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  // Wall noise
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    ctx.fillStyle = Math.random() < 0.5
      ? `rgba(255,255,255,${Math.random() * 0.05})`
      : `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(x, y, 3, 2);
  }

  // Warmth interpolates with nightFactor
  const litR = Math.round(255);
  const litG = Math.round(210 + nightFactor * 40);
  const litB = Math.round(130 + nightFactor * 50);
  const glassColor = `rgb(${litR},${litG},${litB})`;
  const darkR = Math.round(10 + (1 - nightFactor) * 16);
  const darkB = Math.round(24 + (1 - nightFactor) * 38);
  const darkColor = `rgb(${darkR},${darkR + 2},${darkB})`;
  const reflAlpha = (0.10 * (1 - nightFactor)).toFixed(2);
  const reflColor = nightFactor < 0.5
    ? `rgba(180,210,255,${reflAlpha})`
    : `rgba(160,140,100,0.04)`;

  for (let f = 0; f < 2; f++) {
    const floorY = f * 128;

    // Ledge
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(8, floorY + 2, 240, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(8, floorY + 6, 240, 2);

    for (let w = 0; w < 4; w++) {
      const wx = 18 + w * 60;
      const wy = floorY + 16;
      const ww = 42, wh = 90;
      const wi = f * 4 + w;
      const lit = windowData ? windowData[wi].lit : (Math.random() < litRatio);

      // Window recess
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(wx, wy, ww, wh);

      // Glass
      ctx.fillStyle = lit ? glassColor : darkColor;
      ctx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);

      // Fake reflection streak on glass (fades at night)
      if (nightFactor < 0.7) {
        ctx.fillStyle = reflColor;
        ctx.fillRect(wx + 8, wy + 8, 8, wh - 24);
        ctx.fillRect(wx + 18, wy + 12, 6, wh - 30);
      }

      // Window glow spill on lit windows at night
      if (lit && nightFactor > 0.3) {
        const glowAlpha = (nightFactor * 0.25).toFixed(2);
        ctx.fillStyle = `rgba(255,200,120,${glowAlpha})`;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = `rgba(255,180,80,${(nightFactor * 0.20).toFixed(2)})`;
        ctx.fillRect(wx, wy - 3, ww, 6);
      }

      // Mullions
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(wx + 4, wy + wh / 2 - 1, ww - 8, 3);
      ctx.fillRect(wx + ww / 2 - 1, wy + 4, 3, wh - 8);

      // Sill
      ctx.fillStyle = '#DDDDDD';
      ctx.fillRect(wx - 2, wy + wh, ww + 4, 3);
    }

    // Top ledge shadow
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(8, floorY + 126, 240, 2);
  }
}

/**
 * Creates a building facade texture with day/night support and fake glass reflections.
 * Returns canvas metadata so the texture can be redrawn dynamically for day/night cycle.
 */
export function makeBuildingFacadeTexture(baseColor = '#8899AA') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Pre-generate consistent window states so pattern doesn't change on redraw
  const windowData = [];
  for (let f = 0; f < 2; f++) {
    for (let w = 0; w < 4; w++) {
      windowData.push({ lit: Math.random() < 0.35 });
    }
  }

  drawBuildingFacade(ctx, baseColor, 0.35, 0, windowData);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return { texture, canvas, ctx, baseColor, windowData };
}

/**
 * Updates a building facade texture for a given nightFactor (0=day, 1=night).
 * Smooth continuous transitions — call every few frames during day/night cycle.
 */
export function updateBuildingFacadeContinuous(texData, nightFactor) {
  const { ctx, baseColor, windowData } = texData;
  const nf = Math.max(0, Math.min(1, nightFactor));
  const litRatio = 0.30 + nf * 0.55;
  drawBuildingFacade(ctx, baseColor, litRatio, nf, windowData);
  texData.texture.needsUpdate = true;
}

/**
 * Updates a building facade texture to match the given time-of-day phase.
 * Legacy wrapper — calls the continuous version internally.
 */
export function updateBuildingFacadeTexture(texData, phase) {
  const map = { day: 0, sunset: 0.55, dawn: 0.4, night: 1.0 };
  updateBuildingFacadeContinuous(texData, map[phase] || 0);
}

