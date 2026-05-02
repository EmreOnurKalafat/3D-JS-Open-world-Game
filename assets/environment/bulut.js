// assets/prefabs/environment/bulut.js — Cloud group prefab
// Returns a THREE.Group of randomly placed puff spheres + flat bottom.
// Uses CLOUD config for all dimensions. userData.sourceFile = SRC for freecam editor.

import * as THREE from 'three';
import { CLOUD } from '/config/environment.js';

const SRC = 'assets/prefabs/environment/bulut.js';

const cloudMat = new THREE.MeshLambertMaterial({
  color: CLOUD.puffColor, transparent: true, opacity: CLOUD.puffOpacity, depthWrite: false,
});
const flatBottomMat = new THREE.MeshLambertMaterial({
  color: CLOUD.flatColor, transparent: true, opacity: CLOUD.flatOpacity, depthWrite: false,
});

/**
 * Build a single cloud group with animated movement data.
 * @returns {THREE.Group}
 */
export function createCloud() {
  const group = new THREE.Group();
  group.name = 'Cloud';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bulut Grubu';

  // Random position on a circle around origin
  const angle = Math.random() * Math.PI * 2;
  const dist = CLOUD.distMin + Math.random() * (CLOUD.distMax - CLOUD.distMin);
  const x = Math.cos(angle) * dist;
  const z = Math.sin(angle) * dist;
  const y = CLOUD.heightMin + Math.random() * (CLOUD.heightMax - CLOUD.heightMin);

  // Puff spheres
  const puffCount = CLOUD.puffCountMin + Math.floor(Math.random() * (CLOUD.puffCountMax - CLOUD.puffCountMin));
  for (let p = 0; p < puffCount; p++) {
    const r = CLOUD.puffRadiusMin + Math.random() * (CLOUD.puffRadiusMax - CLOUD.puffRadiusMin);
    const geo = new THREE.SphereGeometry(r, CLOUD.puffSegments, CLOUD.puffSegmentsFlat);
    const mesh = new THREE.Mesh(geo, cloudMat);
    mesh.position.set(
      (Math.random() - 0.5) * CLOUD.puffSpread,
      (Math.random() - 0.5) * CLOUD.puffSpreadY,
      (Math.random() - 0.5) * CLOUD.puffSpread,
    );
    mesh.scale.set(1, CLOUD.puffScaleYMin + Math.random() * (CLOUD.puffScaleYMax - CLOUD.puffScaleYMin), 1);
    mesh.userData.sourceFile = SRC;
    group.add(mesh);
  }

  // Flat bottom disc
  const flatR = CLOUD.flatRadiusMin + Math.random() * (CLOUD.flatRadiusMax - CLOUD.flatRadiusMin);
  const flatGeo = new THREE.SphereGeometry(flatR, CLOUD.flatSegments, CLOUD.flatSegmentsFlat);
  const flatMesh = new THREE.Mesh(flatGeo, flatBottomMat);
  flatMesh.position.y += CLOUD.flatYOffset;
  flatMesh.scale.set(CLOUD.flatScale.x, CLOUD.flatScale.y, CLOUD.flatScale.z);
  flatMesh.userData.sourceFile = SRC;
  group.add(flatMesh);

  // World position + animation data
  group.position.set(x, y, z);
  group.userData = {
    ...group.userData,
    speed: CLOUD.speedMin + Math.random() * (CLOUD.speedMax - CLOUD.speedMin),
    baseX: x,
    baseZ: z,
    amplitude: CLOUD.amplitudeMin + Math.random() * (CLOUD.amplitudeMax - CLOUD.amplitudeMin),
    offset: Math.random() * Math.PI * 2,
  };

  return group;
}
