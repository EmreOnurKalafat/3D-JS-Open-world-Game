// data/config/furniture.js — Street furniture placement params + prop geometry dimensions

export const LAMP = {
  spacing: 50,               // Distance between lamps along a road
  minEdgeGap: 10,            // Minimum distance from intersection
  roadOffset: 1,             // Extra offset beyond sidewalk (SW + roadOffset)
  occClearance: 2,           // OccupancyGrid clearance
  occFillW: 1, occFillD: 1,  // OccupancyGrid fill size
};

export const TRAFFIC_LIGHT = {
  cornerInset: 1,            // How far from corner into sidewalk
  occClearance: 2,
  occFillW: 1.5, occFillD: 1.5,
  // 2 per intersection, diagonal placement
  positions: [
    { sx: 1, sz: 1, ry: Math.PI / 4 },           // NE corner
    { sx: -1, sz: -1, ry: -3 * Math.PI / 4 },     // SW corner
  ],
};

export const STREET_TREE = {
  sidewalkGap: 1,            // Distance inward from sidewalk edge
  occClearance: 2.5,
  occFillW: 1, occFillD: 1,
  trunkHMin: 2, trunkHMax: 4,
  canopyRMin: 1, canopyRMax: 2,
  canopyHueMin: 0.22, canopyHueMax: 0.34,
  canopySaturation: 0.8,
  canopyLightnessMin: 0.2, canopyLightnessMax: 0.45,
};

export const PARKED_CAR = {
  sidewalkGap: 0.5,          // Distance inward from sidewalk edge
  occClearance: 3,
  occFillW: 4.5, occFillD: 2.5,
  occFillExtra: 0.5,
  jitterFraction: 0.4,       // Jitter × BLOCK for offset along curb
  rotJitter: 0.1,            // Random rotation jitter in radians
};

// --- Street lamp geometry ---
export const POLE = {
  radiusTop: 0.1,
  radiusBottom: 0.15,
  height: 6,
  segments: 8,
  yOffset: 3,
};

export const ARM = {
  width: 1.5,
  height: 0.1,
  depth: 0.1,
  offsetX: 0.7,
  offsetY: 6,
};

// --- Traffic light geometry ---
export const POST = {
  width: 0.12,
  height: 5,
  depth: 0.12,
  yOffset: 2.5,
};

export const SIGNAL_BOX = {
  width: 0.5,
  height: 1.8,
  depth: 0.5,
  yOffset: 5,
  zOffset: 0.6,
};
