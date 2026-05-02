// data/buildings/registry.js — Imports all building type definitions, exports lookup maps
// Add new types here: import → BUILDING_TYPES → ZONE_BUILDING_TYPES

import gokdelen    from './gokdelen.js';
import ofisKulesi  from './ofisKulesi.js';
import apartman    from './apartman.js';
import mustakilEv  from './mustakilEv.js';
import depo        from './depo.js';
import sahilEvi    from './sahilEvi.js';

/** All building type definitions keyed by typeName */
export const BUILDING_TYPES = {
  gokdelen, ofisKulesi, apartman, mustakilEv, depo, sahilEvi,
};

/** Zone → available building type names (picked randomly per slot) */
export const ZONE_BUILDING_TYPES = {
  downtown_core: ['gokdelen'],
  downtown:      ['gokdelen', 'ofisKulesi'],
  commercial:    ['ofisKulesi', 'apartman'],
  residential:   ['apartman', 'mustakilEv'],
  suburban:      ['mustakilEv'],
  industrial:    ['depo'],
  beach:         ['sahilEvi'],
};

/** Get available building type names for a zone */
export function getZoneBuildingTypes(zone) {
  return ZONE_BUILDING_TYPES[zone] || ['mustakilEv'];
}

/** Get full type definition by name, falls back to mustakilEv */
export function getBuildingType(typeName) {
  return BUILDING_TYPES[typeName] || BUILDING_TYPES.mustakilEv;
}
