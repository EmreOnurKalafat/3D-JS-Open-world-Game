# CLAUDE.md — AI Assistant Context

Bu dosya yapay zeka destekli kod asistanlarına (GitHub Copilot, Claude vb.) proje bağlamını açıklar.
This file provides project context for AI coding assistants (GitHub Copilot, Claude, etc.).

---

## Proje Özeti / Project Summary

**browser-gta** — GTA tarzı, tamamen tarayıcıda çalışan 3D açık dünya oyunu.
- Harici 3D asset YOK — her şey Three.js procedural geometry ile çalışma zamanında üretilir.
- Tüm fizik Cannon-es ile yapılır (rigid body, raycasting, collision).
- Çok oyuncu Socket.io ile planlanmış (şu an stub).

---

## Teknoloji Stack

| Katman | Paket | Versiyon |
|---|---|---|
| 3D Render | three | ^0.160.0 |
| Fizik | cannon-es | ^0.20.0 |
| Multiplayer | socket.io / socket.io-client | ^4.7.0 |
| Sunucu | express | ^4.18.0 |
| Build | vite | ^5.0.0 |

---

## Dosya Dizini / File Map

```
client/main.js          ← Sahne init, oyun döngüsü, gündüz/gece döngüsü, freecam
client/world.js         ← Prosedürel şehir (generateCity, updateWorld, cityData)
client/physics.js       ← Cannon-es world, body factory'leri, mesh sync, debug
client/chunkManager.js  ← Chunk tabanlı görünürlük (LOD)
client/textureBuilder.js← Canvas CanvasTexture üreticileri (gökyüzü, yol, bina, araba)
client/assetBuilder.js  ← Prosedürel 3D model factory'leri (sedan, SUV, kamyon…)
client/policeStation.js ← Polis karakolu prosedürel yapısı
client/utils.js         ← lerp, clamp, degToRad, randomInt, randomFloat, scratch Vec3
shared/constants.js     ← Tüm oyun sabitleri (WORLD, PLAYER, VEHICLE, WEAPONS, WANTED…)
server.cjs              ← Express + http sunucu (Socket.io Faz 10'da)
vite.config.js          ← Vite konfigürasyonu (proxy /socket.io → :3000)
```

---

## Mimari Kurallar / Architecture Rules

### Geometri
- **Harici 3D model KULLANMA** (`GLTFLoader`, `.glb`, `.obj` vb.). Her şey `BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `PlaneGeometry` ile yapılır.
- Yüksek tekrar sayılı objeler için **`InstancedMesh`** kullan (binalar, ağaçlar, pencereler).
- Statik sahneler için `mergeGeometries` (BufferGeometryUtils) ile geometrileri birleştir.

### Koordinat Sistemi
- **Y-up** (Y ekseni yukarı)
- Harita merkezi: `(0, 0, 0)`
- Doğu = pozitif X, Kuzey = negatif Z
- Oyuncu capsule height = 1.8 birim ≈ 1.8 metre (ölçek referansı)

### Şehir Yerleşimi
- 10×10 grid (`WORLD.GRID_SIZE = 10`)
- Blok boyutu: 60 birim (`WORLD.BLOCK_SIZE = 60`)
- Yol genişliği: 12 birim (`WORLD.ROAD_WIDTH = 12`)
- Hücre boyutu: `CELL = BLOCK + ROAD = 72`
- Dünya yarıçapı: `WH = (GRID/2) * CELL = 360`

### Fizik
- Her yapı için **static body** (`mass: 0`) oluştur.
- Collision box'ları görsel mesh ile eşleştir.
- `getPhysicsWorld()` fonksiyonunu `physics.js`'den import et.
- Oyuncu ve araçlar için `createBodyBox`, `createBodySphere`, `createBodyCapsule` factory'lerini kullan.

### Performans
- Gölge haritası **kapalı** (`renderer.shadowMap.enabled = false`).
- Pixel ratio ≤ 1.25.
- PointLight sayısını kısıtla; gece ışıkları için emissive material tercih et.
- Yeni bina/yapı için: **toplam mesh sayısı < 200** hedefle.

### Sabitler
- Sabit değerleri **asla hardcode etme**; `shared/constants.js` içindeki `WORLD`, `PLAYER`, `VEHICLE`, `WEAPONS`, `WANTED`, `ECONOMY` objelerini kullan.

---

## Aktif Stub Sistemler / Active Stub Systems

`main.js` içindeki `stubSystems` objesi şu sistemlerin yer tutucularını içerir. Her birinin kendi dosyası olacak:

```
client/player.js     ← PLAYER sistemi (hareket, kamera, HP)
client/vehicle.js    ← VEHICLE sistemi (sürüş fiziği)
client/combat.js     ← COMBAT sistemi (silah, isabet)
client/npc.js        ← NPC sistemi (AI, pedestrian)
client/police.js     ← POLICE sistemi (wanted, chase AI)
client/economy.js    ← ECONOMY sistemi (para, robbery)
client/particles.js  ← PARTICLES sistemi (patlama, duman)
client/audio.js      ← AUDIO sistemi (SFX, müzik, spatial)
client/network.js    ← NETWORK sistemi (Socket.io sync)
client/hud.js        ← HUD sistemi (health bar, minimap, vb.)
client/minimap.js    ← MİNİMAP sistemi (radar)
```

---

## Yeni Bina Ekleme Rehberi / Adding a New Building

Yeni bir bina (örn. hastane) eklerken şu kalıbı takip et:

```javascript
// client/hospital.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from './physics.js';
import { cityData } from './world.js';

export const HOSPITAL_ORIGIN = { x: 200, y: 0, z: -10 };

export function buildHospital(scene) {
  const group = new THREE.Group();
  // ... geometriler buraya ...
  scene.add(group);
  return group;
}
```

`world.js` içindeki `generateCity(scene)` fonksiyonuna `buildHospital(scene)` çağrısını ekle.

---

## Oyun Döngüsü / Game Loop

```
boot()
 ├── initScene()           → Three.js renderer, kamera, sis
 ├── initLights()          → AmbientLight, HemisphereLight, DirectionalLight (güneş, ay)
 ├── initSky()             → Gradient sky dome
 ├── initSun()             → Güneş mesh + glow halo
 ├── initClouds()          → 4 animasyonlu bulut grubu
 ├── initPhysicsWorld()    → Cannon-es world, gravity, broadphase
 ├── createGroundPlane()   → 400×400 statik zemin body
 └── generateCity(scene)   → Şehir, binalar, yollar, araçlar, fizik

gameLoop() [requestAnimationFrame]
 ├── clock.getDelta()      → frame delta (max 50ms)
 ├── updateDayNight()      → ışık, gökyüzü, sis güncelleme
 ├── update(delta)
 │    ├── updateFreecam()  ← freecam aktifse
 │    ├── stepPhysics()    ← freecam kapalıysa
 │    ├── updateWorld()    ← su animasyonu
 │    └── chunkMgr.update()← chunk görünürlüğü
 ├── updateClouds()        → bulut drift animasyonu
 └── renderer.render()
```

---

## Socket Events Referansı / Socket Events Reference

`shared/constants.js` içindeki `SOCKET_EVENTS` objesi tüm event isimlerini içerir:

```
PLAYER_JOIN, PLAYER_LEAVE, GAME_STATE
PLAYER_MOVE, PLAYER_MOVED, PLAYER_SHOOT, PLAYER_HIT, PLAYER_DEAD, PLAYER_RESPAWN
EXPLOSION_AT
VEHICLE_ENTER, VEHICLE_EXIT, VEHICLE_MOVE, VEHICLE_DAMAGE, VEHICLE_EXPLODE
CHAT_MESSAGE, CHAT_RECEIVED, VOICE_SIGNAL
KILL_FEED, EMOTE
WANTED_CHANGE, MONEY_CHANGE, PICKUP_TAKEN
HEIST_EVENT, MODE_UPDATE, PLAYER_LIST
```

---

## Geliştirme Notları / Dev Notes

- `npm run dev` → Vite (port 5173) + Express (port 3000) eş zamanlı çalışır (`concurrently`).
- `/socket.io` proxy → Vite, Socket.io isteklerini `localhost:3000`'e yönlendirir.
- Tüm `import` path'leri mutlak (`/client/...`, `/shared/...`) — Vite root-relative.
- `server.cjs` CommonJS formatında (`require`), `client/` ES Module formatında (`import`).
