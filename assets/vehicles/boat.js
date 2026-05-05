// assets/vehicles/boat.js — Speedboat Prefab (Realistic)
// Fiberglass hull, center console, outboard motor, navigation lights.

import * as THREE from 'three';

const SRC = 'assets/vehicles/boat.js';

function makeGelcoat(hue) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  const col = `hsl(${hue}, 60%, 48%)`;
  const colDark = `hsl(${hue}, 50%, 28%)`;
  const colLight = `hsl(${hue}, 40%, 68%)`;
  grad.addColorStop(0, colLight);
  grad.addColorStop(0.4, col);
  grad.addColorStop(0.6, col);
  grad.addColorStop(1, colDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.005 + Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBoat(bodyColor) {
  const hue = bodyColor !== undefined
    ? bodyColor
    : [210, 0, 45, 180][Math.floor(Math.random() * 4)];
  const paintTex = makeGelcoat(hue);
  const hullMat = new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.35, metalness: 0.3 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f5, roughness: 0.4, metalness: 0.2 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2835, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
  const redLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.15, emissive: 0x440000, emissiveIntensity: 0.5 });
  const greenLightMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.15, emissive: 0x004400, emissiveIntensity: 0.5 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d5, roughness: 0.6, metalness: 0.05 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1 });

  const group = new THREE.Group();
  group.name = 'Boat';
  group.userData.sourceFile = SRC;
  group.userData.editorLabel = 'Bot / Tekne (Gerçekçi)';
  group.userData.paintHue = hue;

  // ── Hull (deep-V fiberglass) ──
  // Bottom/V-keel
  const keel = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.35, 1.2), hullMat);
  keel.position.set(0, 0.18, 0);
  keel.castShadow = true;
  keel.userData.sourceFile = SRC;
  group.add(keel);

  // Mid hull (flared)
  const midHull = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 1.9), hullMat);
  midHull.position.set(0, 0.5, 0);
  midHull.castShadow = true;
  midHull.userData.sourceFile = SRC;
  group.add(midHull);

  // Upper hull / gunwale
  const upperHull = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.22, 2.2), hullMat);
  upperHull.position.set(0, 0.78, 0);
  upperHull.castShadow = true;
  upperHull.userData.sourceFile = SRC;
  group.add(upperHull);

  // Rub rail (waterline trim)
  for (const sz of [-1.1, 1.1]) {
    const rubRail = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.04, 0.06), trimMat);
    rubRail.position.set(0, 0.65, sz);
    rubRail.userData.sourceFile = SRC;
    group.add(rubRail);
  }

  // ── Deck ──
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.05, 2.1), deckMat);
  deck.position.set(0, 0.92, 0);
  deck.receiveShadow = true;
  deck.userData.sourceFile = SRC;
  group.add(deck);

  // Deck non-skid lines
  for (const sx of [-1.5, 0, 1.5]) {
    const nonSkid = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 1.9), trimMat);
    nonSkid.position.set(sx, 0.95, 0);
    nonSkid.userData.sourceFile = SRC;
    group.add(nonSkid);
  }

  // ── Center console ──
  const consoleBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.4), whiteMat);
  consoleBase.position.set(0.3, 1.37, 0);
  consoleBase.castShadow = true;
  consoleBase.userData.sourceFile = SRC;
  group.add(consoleBase);

  // Console accent stripe
  const consoleStripe = new THREE.Mesh(new THREE.BoxGeometry(1.61, 0.08, 1.41), hullMat);
  consoleStripe.position.set(0.3, 1.15, 0);
  consoleStripe.userData.sourceFile = SRC;
  group.add(consoleStripe);

  // Windshield frame
  const windshieldFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 1.5), trimMat);
  windshieldFrame.position.set(1.1, 1.58, 0);
  windshieldFrame.userData.sourceFile = SRC;
  group.add(windshieldFrame);

  // Windshield glass
  const windshieldGlass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 1.4), glassMat);
  windshieldGlass.position.set(1.12, 1.58, 0);
  windshieldGlass.rotation.z = 0.12;
  windshieldGlass.userData.sourceFile = SRC;
  group.add(windshieldGlass);

  // Console top / dash
  const consoleTop = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.04, 1.45), trimMat);
  consoleTop.position.set(0.3, 1.78, 0);
  consoleTop.userData.sourceFile = SRC;
  group.add(consoleTop);

  // Steering wheel
  const steerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), chromeMat);
  steerCol.position.set(1.0, 1.6, 0);
  steerCol.rotation.z = Math.PI / 4;
  steerCol.userData.sourceFile = SRC;
  group.add(steerCol);

  const steerRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 12), chromeMat);
  steerRing.position.set(0.95, 1.68, 0);
  steerRing.userData.sourceFile = SRC;
  group.add(steerRing);

  // Console side grab rails
  for (const sz of [-0.7, 0.7]) {
    const grabRail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), chromeMat);
    grabRail.position.set(0.3, 1.45, sz);
    grabRail.userData.sourceFile = SRC;
    group.add(grabRail);
  }

  // ── Bow seating ──
  const bowSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.6), seatMat);
  bowSeat.position.set(2.0, 0.98, 0);
  bowSeat.userData.sourceFile = SRC;
  group.add(bowSeat);

  // Bow cushion backrests
  for (const sz of [-0.7, 0.7]) {
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.08), seatMat);
    backrest.position.set(2.0, 1.12, sz);
    backrest.userData.sourceFile = SRC;
    group.add(backrest);
  }

  // ── Stern seating ──
  const sternSeat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.8), seatMat);
  sternSeat.position.set(-1.5, 0.98, 0);
  sternSeat.userData.sourceFile = SRC;
  group.add(sternSeat);

  // ── Bow rail ──
  const bowRailH = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.8), chromeMat);
  bowRailH.position.set(2.6, 1.25, 0);
  bowRailH.userData.sourceFile = SRC;
  group.add(bowRailH);

  const bowRailV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.05), chromeMat);
  bowRailV.position.set(2.6, 1.05, 0);
  bowRailV.userData.sourceFile = SRC;
  group.add(bowRailV);

  // ── Cleats ──
  for (const [cx, cz] of [[1.5, 1.0], [-1.5, 1.0], [1.5, -1.0], [-1.5, -1.0]]) {
    const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.04), chromeMat);
    cleat.position.set(cx, 0.95, cz);
    cleat.userData.sourceFile = SRC;
    group.add(cleat);
  }

  // ── Navigation lights ──
  // Port (red)
  const portLight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), redLightMat);
  portLight.position.set(2.8, 0.95, -0.9);
  portLight.userData.sourceFile = SRC;
  group.add(portLight);

  // Starboard (green)
  const stbdLight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), greenLightMat);
  stbdLight.position.set(2.8, 0.95, 0.9);
  stbdLight.userData.sourceFile = SRC;
  group.add(stbdLight);

  // Stern all-around white
  const sternLight = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x444444, emissiveIntensity: 0.6 }));
  sternLight.position.set(-2.8, 1.2, 0);
  sternLight.userData.sourceFile = SRC;
  group.add(sternLight);

  // ── Outboard motor ──
  const motorMount = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.3), trimMat);
  motorMount.position.set(-2.8, 1.0, 0);
  motorMount.userData.sourceFile = SRC;
  group.add(motorMount);

  // Motor bracket
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.25), chromeMat);
  bracket.position.set(-2.85, 0.98, 0);
  bracket.userData.sourceFile = SRC;
  group.add(bracket);

  // Motor cowl
  const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), darkMetalMat);
  cowl.position.set(-3.0, 0.7, 0);
  cowl.castShadow = true;
  cowl.userData.sourceFile = SRC;
  group.add(cowl);

  // Lower unit
  const lowerUnit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), chromeMat);
  lowerUnit.position.set(-3.05, 0.1, 0);
  lowerUnit.userData.sourceFile = SRC;
  group.add(lowerUnit);

  // Anti-ventilation plate
  const avPlate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.22), chromeMat);
  avPlate.position.set(-3.05, -0.05, 0);
  avPlate.userData.sourceFile = SRC;
  group.add(avPlate);

  // Propeller
  const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), chromeMat);
  propHub.rotation.x = Math.PI / 2;
  propHub.position.set(-3.1, -0.35, 0);
  propHub.userData.sourceFile = SRC;
  group.add(propHub);

  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.02), chromeMat);
    blade.position.set(-3.1, -0.35, 0);
    blade.rotation.z = (i / 3) * Math.PI * 2;
    blade.userData.sourceFile = SRC;
    group.add(blade);
  }

  // ── Bumper/fender guards ──
  for (const sz of [-1.08, 1.08]) {
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 0.08), trimMat);
    bumper.position.set(0, 0.82, sz);
    bumper.userData.sourceFile = SRC;
    group.add(bumper);
  }

  return group;
}

