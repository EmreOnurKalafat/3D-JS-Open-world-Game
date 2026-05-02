// data/config/beachWater.js — Beach & animated water appearance

export const BEACH = {
  depth: 70,                 // How far beach extends south
  sandTexRepeat: { x: 14, y: 2 },
};

export const WATER = {
  color: 0x1155AA,
  opacity: 0.85,
  depth: 150,                // Water plane depth
};

export const WATER_ANIM = {
  throttleFrames: 6,         // Update every N frames
  speed: 0.5,                // Animation speed multiplier
  cellW: 6,                  // Drawing cell width
  cellH: 4,                  // Drawing cell height
  rowStride: 24,             // Vertical spacing
  shadeCenter: 20,
  shadeAmplitude: 15,
  baseR: 15, baseG: 50, baseB: 100,
};
