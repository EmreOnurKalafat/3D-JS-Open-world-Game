// assets/prefabs/complexes/police/modules/perimeter.js
// Perimeter fence with gate, physics rails, and gate posts.

import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../../../../client/core/physicsManager.js';
import { MAT } from '../../../resources.js';
import { wx, wz } from '../constants.js';
import { addCyl } from './helpers.js';
import { createCitFenceRun } from '../../../props/outdoor/cit.js';

const { METAL:metalMat } = MAT;

const FH = 3.0;
const F_NORTH = 27, F_SOUTH = -27;
const F_EAST = 27, F_WEST = -27;
const gateX1 = -3, gateX2 = 3;

function placeFenceRun(scene, axis, fixedCoord, start, end) {
  const run = createCitFenceRun({ axis, start, end, fixedCoord, fenceHeight: FH });
  run.position.set(wx(0), 0, wz(0));
  scene.add(run);

  const len = end - start;
  const mid = (start + end) / 2;
  const phys = getPhysicsWorld();
  if (axis === 'x') {
    const shape = new CANNON.Box(new CANNON.Vec3((len + 0.3) / 2, 0.075, 0.075));
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(shape);
    body.position.set(wx(mid), 0.5, wz(fixedCoord));
    phys.addBody(body);
  } else {
    const shape = new CANNON.Box(new CANNON.Vec3(0.075, 0.075, (len + 0.3) / 2));
    const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
    body.addShape(shape);
    body.position.set(wx(fixedCoord), 0.5, wz(mid));
    phys.addBody(body);
  }
}

export function buildPerimeter(scene) {
  // Front fence (SOUTH) — split at gate
  placeFenceRun(scene, 'x', F_SOUTH, F_WEST, gateX1);
  placeFenceRun(scene, 'x', F_SOUTH, gateX2, F_EAST);

  // Gate posts
  for (const gx of [gateX1, gateX2]) {
    addCyl(scene, 0.04, 0.04, FH + 0.4, 8, metalMat, gx, (FH + 0.4) / 2, F_SOUTH);
  }

  // Back fence (NORTH)
  placeFenceRun(scene, 'x', F_NORTH, F_WEST, F_EAST);

  // East + West fences
  placeFenceRun(scene, 'z', F_EAST, F_SOUTH, F_NORTH);
  placeFenceRun(scene, 'z', F_WEST, F_SOUTH, F_NORTH);
}
