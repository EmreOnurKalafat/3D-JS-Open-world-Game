// config/buildings.js — Building type definitions + zone registry
// Plain data — NO Three.js imports.
// Migrated from data/buildings/ (7 files merged into 1).

/** @type {Record<string, {typeName:string, label:string, facadeColor:string, roofStyle:string, entranceStyle:string, minW:number, maxW:number, minH:number, maxH:number}>} */
export const BUILDING_TYPES = {
  gokdelen: {
    typeName: 'gokdelen', label: 'Gökdelen',
    facadeColor: '#7080A0', roofStyle: 'flat_detailed', entranceStyle: 'awning',
    minW: 18, maxW: 22, minH: 45, maxH: 85,
  },
  ofisKulesi: {
    typeName: 'ofisKulesi', label: 'Ofis Kulesi',
    facadeColor: '#7890A0', roofStyle: 'flat_detailed', entranceStyle: 'awning',
    minW: 14, maxW: 18, minH: 25, maxH: 50,
  },
  apartman: {
    typeName: 'apartman', label: 'Apartman',
    facadeColor: '#D0A878', roofStyle: 'flat_simple', entranceStyle: 'awning',
    minW: 9, maxW: 14, minH: 8, maxH: 20,
  },
  mustakilEv: {
    typeName: 'mustakilEv', label: 'Müstakil Ev',
    facadeColor: '#D8C0A0', roofStyle: 'pitched', entranceStyle: 'porch',
    minW: 6, maxW: 10, minH: 4, maxH: 12,
  },
  depo: {
    typeName: 'depo', label: 'Depo',
    facadeColor: '#666666', roofStyle: 'flat_vents', entranceStyle: 'rollup',
    minW: 20, maxW: 28, minH: 10, maxH: 22,
  },
  sahilEvi: {
    typeName: 'sahilEvi', label: 'Sahil Evi',
    facadeColor: '#80C0C0', roofStyle: 'flat_simple', entranceStyle: 'simple',
    minW: 7, maxW: 12, minH: 3, maxH: 8,
  },
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
