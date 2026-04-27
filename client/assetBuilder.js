// client/assetBuilder.js — Procedural 3D model factories (all THREE.Group outputs)

import * as THREE from 'three';
import { makeCarPaintTexture } from './textureBuilder.js';

// --- Shared materials ---
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1A1A1A });
const windowMat = new THREE.MeshPhongMaterial({ color: 0x87CEEB, opacity: 0.6, transparent: true });
const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
const redLightMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
const metalMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

/**
 * Builds a 4-door sedan
 * @param {number} color — hex color for the body
 * @returns {THREE.Group}
 */
export function buildSedanCar(color = 0xFF4444) {
  const group = new THREE.Group();
  const paintTex = makeCarPaintTexture('#' + color.toString(16).padStart(6, '0'));
  const bodyMat = new THREE.MeshPhongMaterial({ map: paintTex });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 1.9), bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.7), windowMat);
  cabin.position.set(-0.2, 1.1, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Wheels
  for (const [x, z] of [[-1.3, 1], [1.3, 1], [-1.3, -1], [1.3, -1]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.3, z);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    group.add(wheel);
  }

  // Headlights
  const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.5), lightMat);
  hl.position.set(2.1, 0.5, 0.55);
  group.add(hl);
  const hl2 = hl.clone();
  hl2.position.z = -0.55;
  group.add(hl2);

  // Taillights
  const tl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.5), redLightMat);
  tl.position.set(-2.1, 0.5, 0.55);
  group.add(tl);
  const tl2 = tl.clone();
  tl2.position.z = -0.55;
  group.add(tl2);

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a low-profile sports car
 */
export function buildSportsCar(color = 0xFF8800) {
  const group = new THREE.Group();
  const paintTex = makeCarPaintTexture('#' + color.toString(16).padStart(6, '0'));
  const bodyMat = new THREE.MeshPhongMaterial({ map: paintTex });

  // Body — low and wide
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.55, 2.0), bodyMat);
  body.position.y = 0.4;
  body.castShadow = true;
  group.add(body);

  // Cabin — low profile
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.8), windowMat);
  cabin.position.set(-0.3, 0.75, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Spoiler
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 2.2), metalMat);
  spoiler.position.set(-1.8, 0.7, 0);
  group.add(spoiler);

  // Wheels — wider
  for (const [x, z] of [[-1.2, 1.1], [1.2, 1.1], [-1.2, -1.1], [1.2, -1.1]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.32, z);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    group.add(wheel);
  }

  // Headlights
  const hl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.6), lightMat);
  hl.position.set(2.0, 0.35, 0.6);
  group.add(hl);
  const hl2 = hl.clone();
  hl2.position.z = -0.6;
  group.add(hl2);

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a tall SUV
 */
export function buildSUV(color = 0x4444FF) {
  const group = new THREE.Group();
  const paintTex = makeCarPaintTexture('#' + color.toString(16).padStart(6, '0'));
  const bodyMat = new THREE.MeshPhongMaterial({ map: paintTex });

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.0, 2.0), bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 1.8), windowMat);
  cabin.position.set(-0.1, 1.35, 0);
  cabin.castShadow = true;
  group.add(cabin);

  for (const [x, z] of [[-1.4, 1.1], [1.4, 1.1], [-1.4, -1.1], [1.4, -1.1]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.38, z);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    group.add(wheel);
  }

  const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), lightMat);
  hl.position.set(2.2, 0.65, 0.55);
  group.add(hl);
  const hl2 = hl.clone();
  hl2.position.z = -0.55;
  group.add(hl2);

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a box truck
 */
export function buildTruck(color = 0xFFFFFF) {
  const group = new THREE.Group();
  const paintTex = makeCarPaintTexture('#' + color.toString(16).padStart(6, '0'));
  const bodyMat = new THREE.MeshPhongMaterial({ map: paintTex });

  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.0), bodyMat);
  cab.position.set(1.5, 0.8, 0);
  cab.castShadow = true;
  group.add(cab);

  // Cargo box
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.6, 2.0), bodyMat);
  cargo.position.set(-1.4, 1.1, 0);
  cargo.castShadow = true;
  group.add(cargo);

  // Wheels (6 for truck)
  for (const [x, z] of [[0, 1.1], [1.8, 1.1], [-1.8, 1.1], [0, -1.1], [1.8, -1.1], [-1.8, -1.1]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.4, z);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    group.add(wheel);
  }

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a motorcycle
 */
export function buildMotorcycle(color = 0x333333) {
  const group = new THREE.Group();
  const paintTex = makeCarPaintTexture('#' + color.toString(16).padStart(6, '0'));
  const bodyMat = new THREE.MeshPhongMaterial({ map: paintTex });

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.3), bodyMat);
  frame.position.y = 0.55;
  frame.castShadow = true;
  group.add(frame);

  // Tank
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), bodyMat);
  tank.position.set(0.3, 0.85, 0);
  tank.castShadow = true;
  group.add(tank);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.4), new THREE.MeshLambertMaterial({ color: 0x1A1A1A }));
  seat.position.set(-0.4, 0.85, 0);
  group.add(seat);

  // Handlebar
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.7), metalMat);
  bar.position.set(1.0, 1.0, 0);
  group.add(bar);

  // Wheels
  for (const [x, z] of [[-1.0, 0], [1.0, 0]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.35, z);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    group.add(wheel);
  }

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a helicopter
 */
export function buildHelicopter(color = 0x555555) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshPhongMaterial({ color });

  // Fuselage
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 3.0), bodyMat);
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  // Tail boom
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 2.5), bodyMat);
  tail.position.set(0, 0.9, -2.5);
  tail.castShadow = true;
  group.add(tail);

  // Main rotor
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 0.3), metalMat);
  rotor.position.y = 1.1;
  rotor.userData.isRotor = true;
  group.add(rotor);

  // Tail rotor
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.0), metalMat);
  tailRotor.position.set(0, 0.9, -3.7);
  tailRotor.userData.isRotor = true;
  group.add(tailRotor);

  // Skids
  for (const x of [-0.5, 0.5]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.0), metalMat);
    skid.position.set(x, 0.15, 0);
    group.add(skid);
  }

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a boat
 */
export function buildBoat(color = 0xFFFFFF) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshPhongMaterial({ color });

  // Hull — tapered box
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 4.0), bodyMat);
  hull.position.y = 0.25;
  hull.castShadow = true;
  group.add(hull);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.5), windowMat);
  cabin.position.y = 0.7;
  cabin.castShadow = true;
  group.add(cabin);

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a police car with roof light bar
 */
export function buildPoliceCar() {
  const group = buildSedanCar(0x111111);

  // Light bar
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.4), metalMat);
  bar.position.set(0.2, 1.45, 0);
  group.add(bar);

  const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.2), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
  redLight.position.set(-0.2, 1.55, 0);
  redLight.userData.isPoliceLight = true;
  group.add(redLight);

  const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.2), new THREE.MeshBasicMaterial({ color: 0x0000FF }));
  blueLight.position.set(0.6, 1.55, 0);
  blueLight.userData.isPoliceLight = true;
  group.add(blueLight);

  group.userData.type = 'vehicle';
  return group;
}

/**
 * Builds a blocky humanoid male character
 */
export function buildMaleCharacter(skinColor = 0xF5CBA7, shirtColor = 0x2980B9, pantsColor = 0x1A252F) {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), skinMat);
  head.position.y = 1.7;
  head.castShadow = true;
  group.add(head);
  group.userData.headMesh = head;

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.3), shirtMat);
  torso.position.y = 1.2;
  torso.castShadow = true;
  group.add(torso);

  // Arms
  for (const side of [-1, 1]) {
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), shirtMat);
    upperArm.position.set(side * 0.45, 1.45, 0);
    upperArm.castShadow = true;
    upperArm.userData.isArm = true;
    group.add(upperArm);

    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.18), skinMat);
    lowerArm.position.set(side * 0.45, 1.15, 0);
    lowerArm.castShadow = true;
    group.add(lowerArm);
  }

  // Legs
  for (const side of [-1, 1]) {
    const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.4, 0.22), pantsMat);
    upperLeg.position.set(side * 0.15, 0.7, 0);
    upperLeg.castShadow = true;
    upperLeg.userData.isLeg = true;
    group.add(upperLeg);

    const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), pantsMat);
    lowerLeg.position.set(side * 0.15, 0.35, 0);
    lowerLeg.castShadow = true;
    group.add(lowerLeg);
  }

  group.userData.type = 'character';
  return group;
}

/**
 * Builds a blocky humanoid female character
 */
export function buildFemaleCharacter(skinColor = 0xF5CBA7, shirtColor = 0xE91E63, pantsColor = 0x2C3E50) {
  const group = buildMaleCharacter(skinColor, shirtColor, pantsColor);
  // Slightly narrower torso
  group.children.forEach(c => {
    if (c.position.y === 1.2) c.scale.x = 0.85;
  });
  group.userData.type = 'character';
  return group;
}

/**
 * Builds a procedural building with windows
 * @param {number} w — width
 * @param {number} h — height
 * @param {number} d — depth
 * @param {number} color — hex color
 * @returns {THREE.Group}
 */
export function buildBuilding(w, h, d, color = 0x888888) {
  const group = new THREE.Group();
  const baseColor = new THREE.Color(color);
  const darkerColor = baseColor.clone().multiplyScalar(0.6);

  // Main structure
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof (slightly darker, inset)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1, 0.3, d - 1),
    new THREE.MeshLambertMaterial({ color: darkerColor })
  );
  roof.position.y = h + 0.15;
  roof.castShadow = true;
  group.add(roof);

  // Window strips — bright rectangles on facade
  const winMat = new THREE.MeshBasicMaterial({ color: 0xADD8E6 });
  const floorCount = Math.max(1, Math.floor(h / 4));
  for (let f = 0; f < floorCount; f++) {
    const fy = 2 + f * (h / floorCount);
    for (let col = 0; col < Math.floor(w / 3); col++) {
      if (Math.random() > 0.25) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.1), winMat);
        win.position.set(-w / 2 + 2 + col * 3, fy, d / 2 + 0.05);
        group.add(win);
      }
    }
  }

  group.userData.type = 'building';
  return group;
}

/**
 * Builds a low-poly tree
 */
export function buildTree() {
  const group = new THREE.Group();

  // Trunk
  const trunkH = 2 + Math.random() * 2;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, trunkH, 6),
    new THREE.MeshLambertMaterial({ color: 0x8B4513 })
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Canopy
  const canopyR = 1.5 + Math.random() * 1.5;
  const canopy = new THREE.Mesh(
    new THREE.IcosahedronGeometry(canopyR, 0),
    new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.8, 0.25 + Math.random() * 0.2) })
  );
  canopy.position.y = trunkH + canopyR * 0.6;
  canopy.castShadow = true;
  group.add(canopy);

  group.userData.type = 'tree';
  return group;
}

/**
 * Builds a street lamp
 */
export function buildStreetLight() {
  const group = new THREE.Group();

  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 6, 8),
    metalMat
  );
  pole.position.y = 3;
  pole.castShadow = true;
  group.add(pole);

  // Arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), metalMat);
  arm.position.set(0.7, 6, 0);
  group.add(arm);

  // Lamp head
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), lightMat);
  lamp.position.set(1.1, 5.85, 0);
  group.add(lamp);

  group.userData.type = 'streetLight';
  return group;
}

/**
 * Builds a traffic light
 */
export function buildTrafficLight() {
  const group = new THREE.Group();

  // Post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 5, 8),
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  post.position.y = 2.5;
  post.castShadow = true;
  group.add(post);

  // Box
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.5), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  box.position.set(0, 5, 0.6);
  group.add(box);

  // Lights
  const colors = [0xFF0000, 0xFFAA00, 0x00FF00];
  const names = ['red', 'yellow', 'green'];
  for (let i = 0; i < 3; i++) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 4), new THREE.MeshBasicMaterial({ color: colors[i] }));
    light.position.set(0, 5.6 - i * 0.5, 0.85);
    light.userData.lightName = names[i];
    group.add(light);
  }

  group.userData.type = 'trafficLight';
  return group;
}

/**
 * Builds a pistol mesh
 */
export function buildPistol() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.6), new THREE.MeshLambertMaterial({ color: 0x444444 }));
  group.add(body);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.05, 0.5);
  group.add(barrel);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.18), new THREE.MeshLambertMaterial({ color: 0x2A1A0A }));
  grip.position.set(0, -0.3, -0.1);
  group.add(grip);

  return group;
}

/**
 * Builds an assault rifle mesh
 */
export function buildRifle() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 1.2), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  group.add(body);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.05, 0.9);
  group.add(barrel);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.4), new THREE.MeshLambertMaterial({ color: 0x2A1A0A }));
  stock.position.set(0, 0.05, -0.6);
  group.add(stock);

  return group;
}

/**
 * Builds a spinning pickup item icon
 */
export function buildPickupItem(type = 'money') {
  const group = new THREE.Group();

  const colors = {
    money: 0x00FF00,
    health: 0xFF0000,
    armor: 0x0000FF,
    ammo: 0xFFAA00,
    weapon: 0xFFFF00,
  };

  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: colors[type] || 0xFFFFFF }));
  inner.position.y = 0.8;
  group.add(inner);

  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 8, 12), new THREE.MeshLambertMaterial({ color: 0xFFFFFF }));
  torus.position.y = 0.8;
  torus.rotation.x = Math.PI / 2;
  group.add(torus);

  group.userData.type = 'pickup';
  group.userData.pickupType = type;
  return group;
}
