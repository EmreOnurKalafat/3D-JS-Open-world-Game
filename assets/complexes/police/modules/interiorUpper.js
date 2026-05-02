// assets/prefabs/complexes/police/modules/interiorUpper.js
// Upper floor interior: captain's office, briefing room, detectives area.

import { GEO, MAT } from '../../../resources.js';
import { wx, wz } from '../constants.js';
import { add, addCyl, placeChair, placeDesk, placeDolap } from './helpers.js';
import { createBayrak } from '../../../props/decorative/bayrak.js';
import { createToplantiMasasi } from '../../../props/office/toplantiMasasi.js';

const { CHALK:chalkMat, METAL:metalMat } = MAT;

export function buildUpperFloorInterior(scene, uY) {
  /* ── Captain's office ──────────────────────────────────── */
  placeDesk(scene, 0, uY, -8.0, 's');
  placeDolap(scene, 3.5, uY, -12.0);
  addCyl(scene, 0.02, 0.02, 2.5, 8, metalMat, -3.5, uY + 1.25, -12.0);
  const flag = createBayrak();
  flag.position.set(wx(-3.2), uY + 2.0, wz(-12.0));
  scene.add(flag);

  /* ── Briefing room ──────────────────────────────────────── */
  const bTable = createToplantiMasasi({ width: 4.0, depth: 1.6, legInsetX: 0.2, legInsetZ: 0.2 });
  bTable.position.set(wx(-9.0), uY, wz(-8.0));
  scene.add(bTable);
  add(scene, GEO.BOX_1, chalkMat, -9.0, uY + 2.0, -12.4, 0, { sx: 3.0, sy: 1.5, sz: 0.05 });
  for (const [cx, cz] of [[-10.5, -9.5], [-7.5, -9.5]]) placeChair(scene, cx, uY, cz, Math.PI);

  /* ── Detectives open area ───────────────────────────────── */
  placeDesk(scene, 8, uY, -10.0, 's');
  placeDesk(scene, 11, uY, -10.0, 's');
  placeDesk(scene, 8, uY, -6.0, 's');
  placeDesk(scene, 11, uY, -6.0, 's');
}
