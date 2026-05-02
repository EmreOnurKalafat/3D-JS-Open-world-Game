// assets/prefabs/complexes/police/index.js — Police Station Complex orchestrator
// Coordinates 6 build-phase modules. Physics handled inline by each module.

import * as THREE from 'three';
import { POLICE_GRID_COL, POLICE_GRID_ROW, COMPLEX_X, COMPLEX_Z } from './constants.js';
import { makePoliceWallTexture } from './textures.js';
import { buildMainBuilding } from './modules/mainBuilding.js';
import { buildGroundFloorInterior } from './modules/interiorGround.js';
import { buildUpperFloorInterior } from './modules/interiorUpper.js';
import { buildGrounds } from './modules/grounds.js';
import { buildHelipadZone } from './modules/helipadZone.js';
import { buildPerimeter } from './modules/perimeter.js';

export { POLICE_GRID_COL, POLICE_GRID_ROW };

export function buildPoliceStationComplex(scene, occ, cityDataRef = null) {
  console.log('[POLICE] Constructing Police Department v3...');

  const GH = 4.5, TH = 9.0;
  const uY = 4.5;
  const iX1 = -13.5, iX2 = 13.5;
  const iZ1 = -12.5, iZ2 = 4.5;
  const WL = -4.5, WR = 4.5;
  const DIV = -2.5;

  const wallTex = makePoliceWallTexture();
  const facadeMat = new THREE.MeshLambertMaterial({ map: wallTex });

  const shared = { facadeMat, GH, TH, uY, iX1, iX2, iZ1, iZ2, WL, WR, DIV };

  buildMainBuilding(scene, shared);
  buildGroundFloorInterior(scene, shared);
  buildUpperFloorInterior(scene, uY);
  buildGrounds(scene, cityDataRef);
  buildHelipadZone(scene);
  buildPerimeter(scene);

  occ.fill(COMPLEX_X, COMPLEX_Z, 58, 58, 2);
  if (cityDataRef) {
    cityDataRef.buildings.push({
      position: { x: COMPLEX_X, y: 0, z: COMPLEX_Z },
      body: null, w: 28, h: TH, d: 18,
      type: 'police_station_complex',
    });
    cityDataRef._policeFacade = { texture: wallTex };
  }

  console.log('[POLICE] v3 Ready. Fence, door (no center pillar), outward-facing sign, deduplicated furniture/railings, larger helicopter, custom concrete texture.');
}
