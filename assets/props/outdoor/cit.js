// assets/props/outdoor/cit.js — Fence Segment (A-grade)
// Chain-link style fence with CanvasTexture metal posts, rails, and mesh panels.

import * as THREE from 'three';
import { MAT, boxMesh, cylMesh } from '../../resources.js';

const SRC = 'assets/props/outdoor/cit.js';

function makeChainLinkTex() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, size, size);

  // Diamond mesh pattern
  ctx.strokeStyle = 'rgba(150,160,170,0.6)';
  ctx.lineWidth = 0.8;
  const spacing = 8;

  for (let y = 0; y < size * 2; y += spacing) {
    ctx.beginPath();
    for (let x = -size; x < size * 2; x += spacing) {
      if (x === -size) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Rotate the pattern to create diamond shapes
  // Actually, let's draw zigzag
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(140,150,160,0.5)';
  ctx.lineWidth = 0.7;

  for (let row = -2; row < size / spacing + 2; row++) {
    const baseY = row * spacing;
    ctx.beginPath();
    for (let col = -1; col < size / spacing + 2; col++) {
      const x = col * spacing + (row % 2 === 0 ? 0 : spacing / 2);
      if (col === -1) ctx.moveTo(x, baseY);
      else ctx.lineTo(x, baseY - spacing / 2);
      ctx.lineTo(x + spacing, baseY);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedTex = null;
function getTex() { if (!cachedTex) cachedTex = makeChainLinkTex(); return cachedTex; }

export function createCitFenceRun(opts) {
  const {
    axis,
    start,
    end,
    fixedCoord,
    fenceHeight = 3.0,
    postSpacing = 1.0,
  } = opts;

  const group = new THREE.Group();
  group.name = 'CitFenceRun';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Çit';

  const len = end - start;
  const mid = (start + end) / 2;
  const postMat = new THREE.MeshLambertMaterial({ color: 0x5a5a5a });
  const railMat = new THREE.MeshLambertMaterial({ color: 0x6a6a6a });
  const meshMat = new THREE.MeshLambertMaterial({ map: getTex(), transparent: true });

  // Posts
  const posts = [];
  for (let p = start; p <= end + 0.01; p += postSpacing) {
    posts.push(p);
  }

  for (const p of posts) {
    let px, pz;
    if (axis === 'x') { px = p; pz = fixedCoord; }
    else { px = fixedCoord; pz = p; }

    const post = cylMesh(0.04, 0.04, fenceHeight, 8, postMat);
    post.position.set(px, fenceHeight / 2 + 0.1, pz);
    post.userData.sourceFile = SRC;
    group.add(post);

    // Post cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), postMat);
    cap.position.set(px, fenceHeight + 0.1, pz);
    cap.userData.sourceFile = SRC;
    group.add(cap);
  }

  // Top rail
  if (axis === 'x') {
    const topRail = boxMesh(len + 0.3, 0.04, 0.04, railMat);
    topRail.position.set(mid, fenceHeight, fixedCoord);
    topRail.userData.sourceFile = SRC;
    group.add(topRail);
  } else {
    const topRail = boxMesh(0.04, 0.04, len + 0.3, railMat);
    topRail.position.set(fixedCoord, fenceHeight, mid);
    topRail.userData.sourceFile = SRC;
    group.add(topRail);
  }

  // Bottom rail
  if (axis === 'x') {
    const botRail = boxMesh(len + 0.3, 0.04, 0.04, railMat);
    botRail.position.set(mid, 0.5, fixedCoord);
    botRail.userData.sourceFile = SRC;
    group.add(botRail);
  } else {
    const botRail = boxMesh(0.04, 0.04, len + 0.3, railMat);
    botRail.position.set(fixedCoord, 0.5, mid);
    botRail.userData.sourceFile = SRC;
    group.add(botRail);
  }

  // Mesh panels between posts
  for (let i = 0; i < posts.length - 1; i++) {
    const segLen = posts[i + 1] - posts[i];
    const segMid = (posts[i] + posts[i + 1]) / 2;

    if (axis === 'x') {
      const panel = boxMesh(segLen - 0.05, fenceHeight - 0.6, 0.01, meshMat);
      panel.position.set(segMid, fenceHeight / 2 + 0.4, fixedCoord);
      panel.userData.sourceFile = SRC;
      group.add(panel);
    } else {
      const panel = boxMesh(0.01, fenceHeight - 0.6, segLen - 0.05, meshMat);
      panel.position.set(fixedCoord, fenceHeight / 2 + 0.4, segMid);
      panel.userData.sourceFile = SRC;
      group.add(panel);
    }
  }

  return group;
}
