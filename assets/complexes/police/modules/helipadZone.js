// assets/prefabs/complexes/police/modules/helipadZone.js
// Helipad + police helicopter.

import { wx, wz } from '../constants.js';
import { placeHelikopter } from './helpers.js';
import { createHelipad } from '../../helipad.js';

export function buildHelipadZone(scene) {
  const heliPadZ = 20;
  const pad = createHelipad();
  pad.position.set(wx(0), 0, wz(heliPadZ));
  scene.add(pad);

  placeHelikopter(scene, 0, 0.25, 14.5);
}
