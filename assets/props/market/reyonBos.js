// assets/props/market/reyonBos.js — Boş Market Reyonu Prefab
// Empty shelf frame — 4 posts, 5 shelves, back cross brace. Paint chipped look.

import * as THREE from 'three';
import { MAT, boxMesh } from '../../resources.js';

const SRC = 'assets/props/market/reyonBos.js';

export function createReyonBos() {
  const group = new THREE.Group();
  group.name = 'ReyonBos';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Boş Reyon';
  group.userData.shelfType = 'empty';

  const w = 2.0, h = 2.5, d = 0.6;

  // 4 corner posts
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = boxMesh(0.05, h, 0.05, MAT.METAL);
      post.position.set(sx * (w / 2 - 0.03), h / 2, sz * (d / 2 - 0.03));
      post.userData.sourceFile = SRC;
      group.add(post);
    }
  }

  // 5 shelf boards
  for (let i = 0; i < 5; i++) {
    const ry = 0.25 + i * 0.55;
    const shelf = boxMesh(w - 0.1, 0.03, d - 0.06, MAT.METAL);
    shelf.position.set(0, ry, 0);
    shelf.userData.sourceFile = SRC;
    group.add(shelf);

    // Price rail on front edge
    const rail = boxMesh(w - 0.1, 0.015, 0.025, MAT.WHITE);
    rail.position.set(0, ry + 0.02, d / 2 - 0.03);
    rail.userData.sourceFile = SRC;
    group.add(rail);
  }

  // Back cross brace
  const brace = boxMesh(w - 0.2, 0.03, 0.03, MAT.DARK_METAL);
  brace.position.set(0, h * 0.7, d / 2 - 0.04);
  brace.rotation.z = 0.3;
  brace.userData.sourceFile = SRC;
  group.add(brace);

  // Second cross brace (X pattern)
  const brace2 = boxMesh(w - 0.2, 0.03, 0.03, MAT.DARK_METAL);
  brace2.position.set(0, h * 0.7, d / 2 - 0.04);
  brace2.rotation.z = -0.3;
  brace2.userData.sourceFile = SRC;
  group.add(brace2);

  return group;
}
