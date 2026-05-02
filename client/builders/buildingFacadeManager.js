// client/builders/buildingFacadeManager.js — Facade texture cache + night lighting
// Manages per-building-type CanvasTextures and area lights for night window glow.

import * as THREE from 'three';
import { BUILDING_TYPES } from '/config/buildings.js';
import {
  makeBuildingFacadeTexture, updateBuildingFacadeTexture, updateBuildingFacadeContinuous,
} from './textureBuilder.js';

const SRC = 'client/builders/buildingFacadeManager.js';

// ═══════════════════════════════════════════════════════════
//  FACADE TEXTURE SYSTEM
// ═══════════════════════════════════════════════════════════

const typeTexData = {};

/** Get or create facade texture data for a building type */
export function getTypeTextureData(typeName) {
  if (!typeTexData[typeName]) {
    const bType = BUILDING_TYPES[typeName];
    typeTexData[typeName] = makeBuildingFacadeTexture(bType ? bType.facadeColor : '#888888');
  }
  return typeTexData[typeName];
}

/** Update all type textures for day/night phase transition */
export function updateBuildingTexturesForPhase(phase) {
  for (const key of Object.keys(typeTexData)) {
    updateBuildingFacadeTexture(typeTexData[key], phase);
  }
}

// ═══════════════════════════════════════════════════════════
//  NIGHT LIGHTING
// ═══════════════════════════════════════════════════════════

let buildingLights = [];
let nightFactor = 0;

/** Initialize area lights for night-time window glow */
export function initBuildingLights(scene, CELL, WH) {
  const lights = [];
  const STEP = CELL * 2;
  const off = WH * 0.7;

  for (let ix = -off; ix <= off + 1; ix += STEP) {
    for (let iz = -off; iz <= off + 1; iz += STEP) {
      const light = new THREE.PointLight(0xFFDDAA, 0, 220);
      light.position.set(ix, 20, iz);
      light.castShadow = false;
      light.userData = { maxIntensity: 200 };
      scene.add(light);
      lights.push(light);
    }
  }

  buildingLights = lights;
  console.log('[BUILDING] %d area lights created', lights.length);
}

/** Smoothly update building lighting for day/night cycle */
export function updateBuildingLighting(nf) {
  nightFactor = Math.max(0, Math.min(1, nf));

  for (const light of buildingLights) {
    light.intensity = nightFactor * light.userData.maxIntensity;
  }

  const prev = updateBuildingLighting._lastNf;
  if (prev === undefined || Math.abs(nightFactor - prev) > 0.05) {
    updateBuildingLighting._lastNf = nightFactor;
    for (const key of Object.keys(typeTexData)) {
      updateBuildingFacadeContinuous(typeTexData[key], nightFactor);
    }
  }
}

/** Get current night factor */
export function getNightFactor() {
  return nightFactor;
}

/** Get building lights array for external management */
export function getBuildingLights() {
  return buildingLights;
}
