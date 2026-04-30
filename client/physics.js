// client/physics.js — Cannon-es world setup, body factories, mesh sync, debug

import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { WORLD } from '/shared/constants.js';

let physicsWorld;
let debugEnabled = false;
const debugMeshes = [];
const bodyMeshMap = new Map();

/**
 * Initialises the Cannon-es physics world
 */
export function initPhysicsWorld() {
  physicsWorld = new CANNON.World();
  physicsWorld.gravity.set(0, WORLD.GRAVITY, 0);
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
  physicsWorld.solver.iterations = 5;
  physicsWorld.allowSleep = true;

  // Skip collision between static-static body pairs (buildings don't collide with each other)
  physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e7;
  physicsWorld.defaultContactMaterial.contactEquationRelaxation = 3;
  physicsWorld.defaultContactMaterial.friction = 0.3;
  physicsWorld.defaultContactMaterial.restitution = 0.2;

  // Skip collision resolution between static-static body pairs
  physicsWorld.addEventListener('preSolve', (evt) => {
    if (evt.bodyA.type === CANNON.Body.STATIC && evt.bodyB.type === CANNON.Body.STATIC) {
      evt.contactEquations.forEach(eq => eq.enabled = false);
    }
  });

  console.log('[PHYSICS] World initialised. Bodies before ground:', physicsWorld.bodies.length);
  return physicsWorld;
}

/** @returns {CANNON.World} */
export function getPhysicsWorld() {
  return physicsWorld;
}

/**
 * Creates a static ground body using a large box
 */
export function createGroundPlane() {
  if (!physicsWorld) {
    console.error('[PHYSICS] Cannot create ground — physics world not initialised!');
    return null;
  }

  const groundShape = new CANNON.Box(new CANNON.Vec3(200, 2, 200));
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.position.set(0, -2, 0); // top surface at y = -2 + 2 = 0
  groundBody.type = CANNON.Body.STATIC;

  physicsWorld.addBody(groundBody);

  console.log('[PHYSICS] Ground body created. Total bodies:', physicsWorld.bodies.length,
    'ground id:', groundBody.id, 'ground type:', groundBody.type);
  return groundBody;
}

/**
 * Creates a box-shaped physics body
 */
export function createBodyBox(width, height, depth, mass = 1, position = { x: 0, y: 5, z: 0 }) {
  if (!physicsWorld) {
    console.error('[PHYSICS] Cannot create box — physics world not initialised!');
    return null;
  }

  const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2);
  const shape = new CANNON.Box(halfExtents);
  const body = new CANNON.Body({ mass });
  body.addShape(shape);
  body.position.set(position.x, position.y, position.z);
  body.linearDamping = 0.1;
  body.angularDamping = 0.1;
  body.sleepSpeedLimit = 0.1;
  body.sleepTimeLimit = 1;

  physicsWorld.addBody(body);

  console.log('[PHYSICS] Box body created. Total bodies:', physicsWorld.bodies.length,
    'box id:', body.id, 'pos:', JSON.stringify(position));

  // Expose for console debugging
  window.__lastBoxBody = body;

  return body;
}

/**
 * Creates a sphere-shaped physics body
 */
export function createBodySphere(radius, mass = 1, position = { x: 0, y: 5, z: 0 }) {
  if (!physicsWorld) return null;
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass });
  body.addShape(shape);
  body.position.set(position.x, position.y, position.z);
  body.linearDamping = 0.1;
  body.angularDamping = 0.1;
  physicsWorld.addBody(body);
  return body;
}

/**
 * Creates a capsule-shaped physics body
 */
export function createBodyCapsule(radius, height, mass = 1, position = { x: 0, y: 5, z: 0 }) {
  if (!physicsWorld) return null;
  const body = new CANNON.Body({ mass });
  const halfHeight = height / 2;
  body.addShape(new CANNON.Cylinder(radius, radius, height, 8));
  body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, halfHeight, 0));
  body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, -halfHeight, 0));
  body.position.set(position.x, position.y, position.z);
  body.linearDamping = 0.1;
  physicsWorld.addBody(body);
  return body;
}

/**
 * Registers a Three.js mesh to be synced with a Cannon-es body each frame
 */
export function bindMeshToBody(mesh, body) {
  bodyMeshMap.set(body, mesh);
}

/**
 * Syncs a single mesh to its physics body
 */
export function syncMeshToBody(mesh, body) {
  if (!mesh || !body) return;
  mesh.position.copy(body.position);
  mesh.quaternion.copy(body.quaternion);
}

/**
 * Syncs all registered meshes to their physics bodies
 */
function syncAllMeshes() {
  bodyMeshMap.forEach((mesh, body) => {
    if (mesh && body) {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  });
}

/**
 * Steps the physics simulation forward
 */
export function stepPhysics(delta) {
  if (!physicsWorld) {
    console.warn('[PHYSICS] stepPhysics called but world is null!');
    return;
  }
  try {
    const fixedDelta = Math.min(delta, 0.05);
    physicsWorld.step(1 / 60, fixedDelta, 3);
    syncAllMeshes();
    if (debugEnabled) updateDebugMeshes();
  } catch (err) {
    console.error('[ERROR][physics] step:', err);
  }
}

// --- Debug wireframe ---

const debugMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 1 });

/** Updates all debug wireframe positions to match bodies */
function updateDebugMeshes() {
  for (const entry of debugMeshes) {
    if (entry.line && entry.body) {
      entry.line.position.copy(entry.body.position);
      entry.line.quaternion.copy(entry.body.quaternion);
    }
  }
}

/** Creates debug wireframes for all bodies in the world */
function buildDebugMeshes(scene) {
  console.log('[PHYSICS] Building debug meshes for', physicsWorld.bodies.length, 'bodies');

  for (let i = 0; i < physicsWorld.bodies.length; i++) {
    const body = physicsWorld.bodies[i];
    for (let j = 0; j < body.shapes.length; j++) {
      const shape = body.shapes[j];
      let geo;

      if (shape.type === CANNON.Shape.types.BOX) {
        const hs = shape.halfExtents;
        geo = new THREE.BoxGeometry(hs.x * 2, hs.y * 2, hs.z * 2);
      } else if (shape.type === CANNON.Shape.types.SPHERE) {
        geo = new THREE.SphereGeometry(shape.radius, 8, 6);
      } else if (shape.type === CANNON.Shape.types.CYLINDER) {
        geo = new THREE.CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, 8);
      } else {
        continue;
      }

      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, debugMaterial.clone());
      line.position.copy(body.position);
      line.quaternion.copy(body.quaternion);

      const offset = body.shapeOffsets[j];
      const orient = body.shapeOrientations[j];
      if (offset) line.position.add(offset);
      if (orient) line.quaternion.multiply(orient);

      scene.add(line);
      debugMeshes.push({ line, body });
    }
  }
}

/** Removes all debug wireframes from the scene */
function clearDebugMeshes(scene) {
  for (const entry of debugMeshes) {
    scene.remove(entry.line);
    if (entry.line.geometry) entry.line.geometry.dispose();
    if (entry.line.material) entry.line.material.dispose();
  }
  debugMeshes.length = 0;
}

/**
 * Toggles physics debug wireframe overlay
 */
export function toggleDebug(scene) {
  debugEnabled = !debugEnabled;
  if (debugEnabled) {
    buildDebugMeshes(scene);
    console.log('[PHYSICS] Debug ON — Bodies:', physicsWorld.bodies.length);
  } else {
    clearDebugMeshes(scene);
    console.log('[PHYSICS] Debug OFF');
  }
}

// Expose for browser console debugging
window.__physicsWorld = () => physicsWorld;
window.__debugMeshes = () => debugMeshes;
