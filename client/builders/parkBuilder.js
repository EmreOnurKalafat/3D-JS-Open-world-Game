// client/builders/parkBuilder.js — Central park ground + tree coordinates
// Tree rendering is delegated to agacManager for InstancedMesh performance.
// userData.sourceFile = SRC on the park ground mesh for freecam editor.
//
// Pattern: Read config from data/environment/parkConfig.js →
//          create ground plane → generate tree coords → return coords

import * as THREE from 'three';
import { makeGrassTexture } from './textureBuilder.js';
import { PARK, PARK_TREE } from '../../data/environment/parkConfig.js';

const SRC = 'client/builders/parkBuilder.js';

/**
 * Create park ground plane + collect tree coordinates.
 * @param {THREE.Scene} scene
 * @param {Object} opts - { GRID, CELL, WH, HALF, BLOCK }
 * @returns {Array<{x:number, z:number, trunkH:number, canopyR:number, canopyColor:THREE.Color}>}
 */
export function createPark(scene, opts) {
  const { GRID, CELL, WH, HALF, BLOCK } = opts;
  const r = Math.floor(GRID / 2), c = Math.floor(GRID / 2);
  const cx = c * CELL - WH + HALF, cz = r * CELL - WH + HALF;

  const grassTex = makeGrassTexture();
  grassTex.wrapS = THREE.RepeatWrapping;
  grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(PARK.grassTexRepeat.x, PARK.grassTexRepeat.y);
  const grassMat = new THREE.MeshLambertMaterial({ map: grassTex });

  const geo = new THREE.PlaneGeometry(BLOCK, BLOCK);
  const park = new THREE.Mesh(geo, grassMat);
  park.rotation.x = -Math.PI / 2;
  park.position.set(cx, PARK.groundY, cz);
  park.receiveShadow = true;
  park.userData.sourceFile = SRC;
  park.userData.editorLabel = 'Park (Ground)';
  scene.add(park);

  // Collect park tree coordinates using config ranges
  const treeCoords = [];
  const g = PARK.treeGrid;
  for (let pr = 0; pr < g; pr++) {
    for (let pc = 0; pc < g; pc++) {
      const tx = cx + (pc / (g - 1) - 0.5) * BLOCK * PARK.blockCoverage
                   + (Math.random() - 0.5) * PARK.jitter;
      const tz = cz + (pr / (g - 1) - 0.5) * BLOCK * PARK.blockCoverage
                   + (Math.random() - 0.5) * PARK.jitter;
      const trunkH = PARK_TREE.trunkHeightMin
                      + Math.random() * (PARK_TREE.trunkHeightMax - PARK_TREE.trunkHeightMin);
      const canopyR = PARK_TREE.canopyRadiusMin
                      + Math.random() * (PARK_TREE.canopyRadiusMax - PARK_TREE.canopyRadiusMin);
      const hue = PARK_TREE.canopyHueMin
                  + Math.random() * (PARK_TREE.canopyHueMax - PARK_TREE.canopyHueMin);
      const lightness = PARK_TREE.canopyLightnessMin
                        + Math.random() * (PARK_TREE.canopyLightnessMax - PARK_TREE.canopyLightnessMin);
      const canopyColor = new THREE.Color().setHSL(hue, PARK_TREE.canopySaturation, lightness);

      treeCoords.push({ x: tx, z: tz, trunkH, canopyR, canopyColor });
    }
  }

  return treeCoords;
}
