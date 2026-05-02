// client/builders/environmentBuilder.js — Beach, water, and environmental elements
// Water texture is animated each frame via the returned canvas/ctx/texture refs.
// userData.sourceFile = SRC on all created meshes for freecam editor.
//
// Pattern: Read config from data/environment/beachWaterConfig.js →
//          create sand + water planes → write waterData to cityData

import * as THREE from 'three';
import { WORLD } from '../../shared/constants.js';
import { makeSandTexture, makeWaterTexture } from './textureBuilder.js';
import { BEACH, WATER, WATER_ANIM } from '../../data/environment/beachWaterConfig.js';

const SRC = 'client/builders/environmentBuilder.js';

/**
 * Create beach (sand) + animated water plane.
 * @param {THREE.Scene} scene
 * @param {Object} cityData — mutated in place: .waterMesh, .waterData set here
 * @param {number} WH — half world width
 * @param {number} ROAD — road width
 */
export function createBeachWater(scene, cityData, WH, ROAD) {
  const sandTex = makeSandTexture();
  sandTex.wrapS = THREE.RepeatWrapping;
  sandTex.wrapT = THREE.RepeatWrapping;
  sandTex.repeat.set(BEACH.sandTexRepeat.x, BEACH.sandTexRepeat.y);
  const sandMat = new THREE.MeshLambertMaterial({ map: sandTex });

  const bw = WH * 2 + 60;
  const beachZ = -WH + ROAD / 2 - BEACH.depth / 2;
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(bw, BEACH.depth), sandMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, 0.04, beachZ);
  beach.receiveShadow = true;
  beach.userData.sourceFile = SRC;
  beach.userData.editorLabel = 'Beach (Sand)';
  scene.add(beach);

  const { texture, canvas, ctx } = makeWaterTexture();
  const waterGeo = new THREE.PlaneGeometry(bw + 60, WATER.depth);
  const waterMat = new THREE.MeshLambertMaterial({
    map: texture, color: WATER.color,
    transparent: true, opacity: WATER.opacity,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, WORLD.WATER_Y, beachZ - BEACH.depth / 2 - WATER.depth / 2);
  water.receiveShadow = true;
  water.userData.sourceFile = SRC;
  water.userData.editorLabel = 'Water (Animated)';
  scene.add(water);

  cityData.waterMesh = water;
  cityData.waterData = { canvas, ctx, texture };
}

/**
 * Animate water texture. Called each frame by updateWorld().
 * Uses WATER_ANIM config for all rendering params.
 * @param {Object} wd — { ctx, texture }
 * @param {number} elapsed — seconds since game start
 */
export function animateWater(wd, elapsed) {
  const { ctx, texture } = wd;
  const a = WATER_ANIM;

  ctx.fillStyle = '#1A5276';
  ctx.fillRect(0, 0, 256, 256);
  const t = elapsed * a.speed;

  for (let y = 0; y < 256; y += a.rowStride) {
    for (let x = 0; x < 256; x += a.cellW) {
      const shade = a.shadeCenter + Math.sin(x * 0.1 + y * 0.05 + t) * a.shadeAmplitude;
      ctx.fillStyle = `rgb(${a.baseR + shade},${a.baseG + shade},${a.baseB + shade})`;
      ctx.fillRect(x, y + Math.sin(x * 0.05 + t) * a.cellH, a.cellW, a.cellH);
    }
  }
  texture.needsUpdate = true;
}
