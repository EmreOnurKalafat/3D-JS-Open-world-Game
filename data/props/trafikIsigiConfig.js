// data/props/trafikIsigiConfig.js — Traffic light geometry dimensions

export const POST = {
  width: 0.12,
  height: 5,
  depth: 0.12,
  yOffset: 2.5,             // Translate Y so base sits at ground
};

export const SIGNAL_BOX = {
  width: 0.5,
  height: 1.8,
  depth: 0.5,
  yOffset: 5,               // Height above ground
  zOffset: 0.6,             // Forward from post center
};
