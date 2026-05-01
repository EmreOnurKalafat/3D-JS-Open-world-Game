# Project Instructions for AI Assistants

See [CLAUDE.md](../CLAUDE.md) in the repository root for full project context, architecture rules, file map, and development notes.

## Quick Reference

- **Stack:** Three.js r160, Cannon-es 0.20, Socket.io 4.7, Express 4.18, Vite 5
- **Phase:** 3 (Procedural City) — player/vehicle/combat systems are stubs
- **No external 3D assets** — all geometry is procedural (BoxGeometry, CylinderGeometry, etc.)
- **Key entry:** `client/main.js` → `boot()` → `gameLoop()`
- **Constants:** `shared/constants.js` — never hardcode values
- **New buildings** go in `client/` and are called from `world.js` → `generateCity()`
