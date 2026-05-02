// data/config/environment.js — Sky, sun, clouds, lighting, day/night cycle config
// Tweak these to adjust atmosphere, lighting, and cloud appearance without touching render code.

export const SKY = {
  radius: 550,
  segments: 32,
  baseColor: 0x87CEEB,
  fogColor: 0x87CEEB,
  fogNear: 150,
  fogFar: 480,
};

export const SUN = {
  radius: 10,
  segments: 32,
  color: 0xfff8dc,
  distance: 500,            // Orbital radius from origin
  glow: {
    radius: 20,
    segments: 32,
    color: 0xffcc66,
    opacity: 0.15,
  },
};

export const CLOUD = {
  groupCount: 4,             // Number of cloud groups
  distMin: 50,
  distMax: 350,
  heightMin: 140,
  heightMax: 320,
  puffCountMin: 2,
  puffCountMax: 5,
  puffRadiusMin: 8,
  puffRadiusMax: 26,
  puffSegments: 7,           // Low-res for performance
  puffSegmentsFlat: 5,
  puffScaleYMin: 0.4,
  puffScaleYMax: 0.7,
  puffSpread: 35,            // Max random offset from group center
  puffSpreadY: 12,
  flatRadiusMin: 20,
  flatRadiusMax: 35,
  flatSegments: 8,
  flatSegmentsFlat: 4,
  flatScale: { x: 1.2, y: 0.15, z: 1.2 },
  flatYOffset: -6,
  // Materials
  puffColor: 0xf0f0f0,
  puffOpacity: 0.75,
  flatColor: 0xd8d8d8,
  flatOpacity: 0.45,
  // Animation
  speedMin: 1,
  speedMax: 5,
  amplitudeMin: 2,
  amplitudeMax: 10,
  animFreqXZ: 0.03,
  animFreqXZCos: 0.04,
  animFreqY: 0.5,
  animYDelta: 0.2,
  amplitudeMultiplier: 5,
};

export const LIGHT = {
  ambient:  { color: 0x404060, intensity: 0.4 },
  hemisphere: { skyColor: 0x87CEEB, groundColor: 0x3D2B1F, intensity: 0.6 },
  sun:  { color: 0xFFF5E0, intensity: 1.0, pos: { x: 100, y: 150, z: 50 } },
  moon: { color: 0x8899CC, intensity: 0,   pos: { x: -50, y: 80, z: -30 } },
};

export const DAY_CYCLE = {
  durationSeconds: 20 * 60,
  // { phase, hourStart, hourEnd, intensityStart, intensityEnd }
  // Evaluated top-to-bottom, first match wins
  phases: [
    { phase: 'night',  start: 0,  end: 5,  iStart: 0.15, iEnd: 0.15 },
    { phase: 'dawn',   start: 5,  end: 6,  iStart: 0.15, iEnd: 0.3  },
    { phase: 'dawn',   start: 6,  end: 7,  iStart: 0.3,  iEnd: 0.8  },
    { phase: 'day',    start: 7,  end: 19, iStart: 1.0,  iEnd: 1.0  },
    { phase: 'sunset', start: 19, end: 20, iStart: 1.0,  iEnd: 0.6  },
    { phase: 'night',  start: 20, end: 21, iStart: 0.6,  iEnd: 0.15 },
    { phase: 'night',  start: 21, end: 24, iStart: 0.15, iEnd: 0.15 },
  ],
  sunrise: 6,
  sunset: 19,
  nightStart: 21,
  nightEnd: 5,
  dayStart: 7,
  dayEnd: 19,
  fogColors: {
    day: 0x87CEEB,
    sunset: 0xf4a261,
    night: 0x0a0a1a,
    dawn: 0xf4a261,
  },
};

export const GROUND = {
  size: 600,
  color: 0x3D2B1F,
};
