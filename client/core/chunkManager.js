// client/chunkManager.js — Spatial chunking with impostor support for distant chunks

const CHUNK_SIZE = 120;

export class ChunkManager {
  constructor(worldHalf) {
    this.chunkSize = CHUNK_SIZE;
    this.worldHalf = worldHalf;
    this.renderRadius = 1;
    this.lastCamCX = Infinity;
    this.lastCamCZ = Infinity;
    /** Map<chunkKey, { objects: Array, impostors: Array, visible: boolean }> */
    this.chunks = new Map();
  }

  /** Get chunk coordinates from world position */
  _getChunkCoords(wx, wz) {
    return {
      cx: Math.floor((wx + this.worldHalf) / CHUNK_SIZE),
      cz: Math.floor((wz + this.worldHalf) / CHUNK_SIZE),
    };
  }

  /** Get chunk key string */
  getKey(wx, wz) {
    const { cx, cz } = this._getChunkCoords(wx, wz);
    return `${cx},${cz}`;
  }

  /** Register a detailed 3D object with a chunk */
  register(chunkKey, object) {
    if (!this.chunks.has(chunkKey)) {
      this.chunks.set(chunkKey, { objects: [], impostors: [], visible: true });
    }
    this.chunks.get(chunkKey).objects.push(object);
  }

  /** Register an impostor (low-poly distant representation) for a chunk */
  registerImpostor(chunkKey, object) {
    if (!this.chunks.has(chunkKey)) {
      this.chunks.set(chunkKey, { objects: [], impostors: [], visible: true });
    }
    this.chunks.get(chunkKey).impostors.push(object);
    object.visible = false; // impostors start hidden
  }

  /** Update chunk visibility based on camera position */
  update(cameraPos) {
    const { cx, cz } = this._getChunkCoords(cameraPos.x, cameraPos.z);
    if (cx === this.lastCamCX && cz === this.lastCamCZ) return false;

    this.lastCamCX = cx;
    this.lastCamCZ = cz;

    const R = this.renderRadius;
    const activeKeys = new Set();
    for (let dx = -R; dx <= R; dx++) {
      for (let dz = -R; dz <= R; dz++) {
        activeKeys.add(`${cx + dx},${cz + dz}`);
      }
    }

    this.chunks.forEach((chunk, key) => {
      const isActive = activeKeys.has(key);
      if (chunk.visible !== isActive) {
        chunk.visible = isActive;
        chunk.objects.forEach(obj => { if (obj) obj.visible = isActive; });
        chunk.impostors.forEach(obj => { if (obj) obj.visible = !isActive; });
      }
    });

    return true;
  }
}
