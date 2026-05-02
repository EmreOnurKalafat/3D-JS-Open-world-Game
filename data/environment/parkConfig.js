// data/environment/parkConfig.js — Central park appearance & tree generation params

export const PARK = {
  groundY: 0.07,             // Park plane vertical offset
  grassTexRepeat: { x: 3, y: 3 },
  treeGrid: 5,               // N×N tree grid
  blockCoverage: 0.8,        // How much of BLOCK the trees span
  jitter: 3,                 // Max random tree offset
};

export const PARK_TREE = {
  trunkHeightMin: 2,
  trunkHeightMax: 4,
  canopyRadiusMin: 0.9,
  canopyRadiusMax: 1.6,
  canopyHueMin: 0.22,
  canopyHueMax: 0.34,
  canopySaturation: 0.8,
  canopyLightnessMin: 0.25,
  canopyLightnessMax: 0.45,
};
