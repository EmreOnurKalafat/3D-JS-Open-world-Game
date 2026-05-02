// assets/prefabs/environment/gunes.js — Sun mesh + glow prefab
// Returns a THREE.Group with sun sphere and transparent glow shell.
// userData.sourceFile = SRC for freecam editor.

import * as THREE from 'three';
import { SUN } from '/config/environment.js';

const SRC = 'assets/prefabs/environment/gunes.js';

/**
 * Build sun mesh group (sphere + glow).
 * @returns {THREE.Group}
 */
export function createSun() {
  const group = new THREE.Group();
  group.name = 'Sun';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Güneş';

  const sunGeo = new THREE.SphereGeometry(SUN.radius, SUN.segments, SUN.segments);
  const sunMat = new THREE.MeshBasicMaterial({ color: SUN.color });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.userData.sourceFile = SRC;
  group.add(sunMesh);

  const glowGeo = new THREE.SphereGeometry(SUN.glow.radius, SUN.glow.segments, SUN.glow.segments);
  const glowMat = new THREE.MeshBasicMaterial({
    color: SUN.glow.color,
    transparent: true,
    opacity: SUN.glow.opacity,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.userData.sourceFile = SRC;
  group.add(glowMesh);

  return group;
}
