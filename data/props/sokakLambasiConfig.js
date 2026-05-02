// data/props/sokakLambasiConfig.js — Street lamp geometry dimensions

export const POLE = {
  radiusTop: 0.1,
  radiusBottom: 0.15,
  height: 6,
  segments: 8,
  yOffset: 3,               // Translate Y so base sits at ground
};

export const ARM = {
  width: 1.5,
  height: 0.1,
  depth: 0.1,
  offsetX: 0.7,             // How far the arm extends from pole
  offsetY: 6,               // Height at which arm attaches
};
