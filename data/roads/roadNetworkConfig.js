// data/roads/roadNetworkConfig.js — Road, sidewalk, marking dimensions & material colors
// Tweak these to adjust the entire road network appearance without touching builder code.

export const ROAD = {
  height: 0.05,          // Road slab thickness
  yOffset: 0.025,        // Vertical position above ground
  color: 0x123444,       // Asphalt dark blue-gray
};

export const SIDEWALK = {
  height: 0.2,           // Sidewalk curb height
};

export const BLOCK_FILL = {
  fillColor: 0x8a8a8a,       // Regular block ground
  asphaltFillColor: 0x1A1A1A, // Special cells (police, hospital)
};

export const MARKING = {
  thickness: 0.004,          // Line thickness (flat)
  yellowWidth: 0.2,          // Center line width
  whiteWidth: 0.12,          // Edge line width
  whiteEdgeOffset: 0.7,      // Distance from road edge
  zBias: 0.0005,             // Z-layer offset to prevent z-fighting
};

export const CROSSWALK = {
  stripeLength: null,        // null = use ROAD width dynamically
  stripeWidth: 0.25,
  count: 4,                  // Stripes per approach
  spacing: 0.5,              // Gap between stripes
  curbOffset: 1.2,           // Distance from intersection corner
};
