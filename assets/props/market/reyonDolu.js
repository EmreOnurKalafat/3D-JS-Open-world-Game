// assets/props/market/reyonDolu.js — Dolu Market Reyonu Prefab
// Büyük raf ünitesi — üzerinde ürün kaplaması olan BoxGeometry.
// Performans için InstancedMesh ile batch edilir.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/reyonDolu.js';

/** Ürün dolu raf kaplaması — renkli kutu/sise siluetleri */
function makeShelfTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Raf metal rengi arka plan
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, 256, 320);

  // 5 raf seviyesi
  const rowH = 52;
  const colors = ['#ff4444', '#4488ff', '#ffaa00', '#44bb44', '#ff66aa',
                  '#8855cc', '#ff8866', '#44cccc', '#dddd44', '#cc6644'];

  for (let row = 0; row < 5; row++) {
    const y = 20 + row * rowH;
    // Raf tablası
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(10, y + 40, 236, 6);

    // Ürünler (rastgele renkli kutular/silindirler)
    let x = 15;
    while (x < 235) {
      const w = 18 + Math.random() * 30;
      const h = 22 + Math.random() * 18;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, y + 40 - h, w, h);
      // Parlama çizgisi
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 3, y + 40 - h, w * 0.3, h * 0.5);
      x += w + 4;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Paylaşılan texture (tüm dolu reyonlar aynı)
let _sharedTex = null;
function getSharedTex() {
  if (!_sharedTex) _sharedTex = makeShelfTexture();
  return _sharedTex;
}

export function createReyonDolu() {
  const group = new THREE.Group();
  group.name = 'ReyonDolu';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Dolu Reyon';
  group.userData.shelfType = 'full';

  const w = 2.0, h = 2.5, d = 0.6;

  // Ana gövde — ürün kaplamalı
  const tex = getSharedTex();
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const body = boxMesh(w, h, d, null);  // override material below
  body.material = mat;
  body.position.set(0, h / 2, 0);
  body.userData.sourceFile = SRC;
  group.add(body);

  // Yan dikmeler
  for (const side of [-1, 1]) {
    const post = boxMesh(0.06, h, 0.06, MAT.SHELF_METAL || MAT.METAL);
    post.position.set(side * (w / 2 - 0.03), h / 2, 0);
    post.userData.sourceFile = SRC;
    group.add(post);
  }

  // Üst şapka
  const topCap = boxMesh(w, 0.06, d + 0.04, MAT.SHELF_METAL || MAT.METAL);
  topCap.position.set(0, h + 0.03, 0);
  topCap.userData.sourceFile = SRC;
  group.add(topCap);

  return group;
}

/** Paylaşılan shelf geometrisi ve materyali (InstancedMesh için) */
export function getReyonDoluGeoTex() {
  return { geometry: new THREE.BoxGeometry(2.0, 2.5, 0.6), texture: getSharedTex() };
}
