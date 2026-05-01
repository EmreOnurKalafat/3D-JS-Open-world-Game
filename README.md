# webGTA — Tarayıcı Tabanlı 3D Açık Dünya Multiplayer Oyun

Tamamen tarayıcıda çalışan, Three.js + Cannon-es ile inşa edilmiş, GTA Online benzeri açık dünya oyunu.

**Harici asset yok.** Tüm modeller, dokular ve sesler prosedürel olarak kod ile üretilir.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| 3D Render | Three.js |
| Fizik Motoru | Cannon-es |
| Multiplayer | Socket.io |
| Sesli Sohbet | WebRTC |
| Ses Sentezi | Web Audio API |
| Mini Harita | Canvas 2D |
| Sunucu | Express + Node.js |
| Build | Vite |

---

## Başlangıç

```bash
npm install
npm run dev      # Vite (:5173) + Sunucu (:3000)
```

Tarayıcıda `http://localhost:5173` adresini aç.

---

## Kontroller

| Tuş | İşlev |
|---|---|
| W A S D | Hareket |
| Shift | Koşma |
| Space | Zıplama |
| U | Freecam (geliştirici kamerası) |
| F | Test kutusu fırlat |
| D / P | Fizik debug tel kafes |
| K / L | Zamanı geri/ileri sar |

**Freecam modunda (U):**

| Tuş | İşlev |
|---|---|
| W A S D | Uçuş |
| Q / E | Alçal / Yüksel |
| Shift | Hızlı uçuş |
| Mouse | Bakış yönü |
| Sol Tık | Obje seç (editör) |

---

## Mevcut Özellikler

- 10×10 grid prosedürel şehir (yollar, binalar, park, plaj, su)
- Gündüz/gece döngüsü (20 dakika = 1 oyun günü)
- Cannon-es fizik motoru (yerçekimi, çarpışma, debug modu)
- Chunk-based LOD ve performans yönetimi
- Freecam editör (obje seçimi, kaynak kod düzenleme, silme kaydı, AI asistanı)
- 13 modüler prefab (mobilya, araç, yapı)
- Polis karakolu kompleksi (prefab tabanlı)
- Hastane binası

---

## Faz Durumu

| Faz | Durum |
|---|---|
| 1 — Scaffold & Sahne | ✅ |
| 2 — Fizik Motoru | ✅ |
| 3 — Prosedürel Şehir | ✅ |
| 4 — Oyuncu Kontrolcüsü | ⌛ |
| 5 — Araç Sistemi | ⌛ |
| 6 — Savaş & Silahlar | ⌛ |
| 7 — NPC Sistemi | ⌛ |
| 8 — Polis & Aranma | ⌛ |
| 9 — Ekonomi & Soygun | ⌛ |
| 10 — Multiplayer | 🔶 Sunucu hazır |
| 15 — Optimizasyon | ✅ |

---

## Proje Yapısı

```
├── server/server.cjs         ← Express + Socket.io sunucusu
├── shared/                   ← Ortak sabitler & yardımcılar
├── client/
│   ├── core/                 ← main.js, renderManager, physicsManager, inputManager, chunkManager
│   ├── builders/             ← entityBuilder, textureBuilder
│   ├── zones/                ← world.js, zone_police.js, zone_hospital.js
│   ├── editor/               ← freecamEditor.js
│   └── ui/                   ← hudManager.js, lobbyManager.js (stub)
├── assets/
│   ├── prefabs/props/        ← sandalye, masa, dolap, suSebili, bayrak, hucreYatagi, toplantiMasasi
│   ├── prefabs/vehicles/     ← polisArabasi, helikopter
│   ├── prefabs/structures/   ← helipad, merdiven, cit, sokakLambasi
│   └── shared/resources.js   ← Geometri & materyal havuzu
└── styles/                   ← CSS
```

---

---

# webGTA — Browser-Based 3D Open World Multiplayer Game

A fully browser-based open-world game built with Three.js + Cannon-es, inspired by GTA Online mechanics.

**Zero external assets.** All models, textures, and sounds are generated procedurally in code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D Render | Three.js |
| Physics | Cannon-es |
| Multiplayer | Socket.io |
| Voice Chat | WebRTC |
| Audio | Web Audio API |
| Minimap | Canvas 2D |
| Server | Express + Node.js |
| Build | Vite |

---

## Getting Started

```bash
npm install
npm run dev      # Vite (:5173) + Server (:3000)
```

Open `http://localhost:5173` in your browser.

---

## Controls

| Key | Action |
|---|---|
| W A S D | Move |
| Shift | Sprint |
| Space | Jump |
| U | Freecam (developer camera) |
| F | Spawn test box |
| D / P | Toggle physics wireframe |
| K / L | Rewind / fast-forward time |

**Freecam mode (U):**

| Key | Action |
|---|---|
| W A S D | Fly |
| Q / E | Descend / Ascend |
| Shift | Fast fly |
| Mouse | Look around |
| Left Click | Select object (editor) |

---

## Current Features

- 10×10 grid procedural city (roads, buildings, park, beach, water)
- Day/night cycle (20 min = 1 game day)
- Cannon-es physics engine (gravity, collision, debug wireframe)
- Chunk-based LOD and performance management
- Freecam editor (object selection, source editing, deletion registry, AI assistant)
- 13 modular prefabs (furniture, vehicles, structures)
- Police station complex (prefab-based)
- Hospital building

---

## Phase Status

| Phase | Status |
|---|---|
| 1 — Scaffold & Scene | ✅ |
| 2 — Physics Engine | ✅ |
| 3 — Procedural City | ✅ |
| 4 — Player Controller | ⌛ |
| 5 — Vehicle System | ⌛ |
| 6 — Combat & Weapons | ⌛ |
| 7 — NPC System | ⌛ |
| 8 — Police & Wanted | ⌛ |
| 9 — Economy & Heists | ⌛ |
| 10 — Multiplayer | 🔶 Server ready |
| 15 — Optimization | ✅ |

---

## Project Structure

```
├── server/server.cjs         ← Express + Socket.io server
├── shared/                   ← Shared constants & utilities
├── client/
│   ├── core/                 ← main.js, renderManager, physicsManager, inputManager, chunkManager
│   ├── builders/             ← entityBuilder, textureBuilder
│   ├── zones/                ← world.js, zone_police.js, zone_hospital.js
│   ├── editor/               ← freecamEditor.js
│   └── ui/                   ← hudManager.js, lobbyManager.js (stub)
├── assets/
│   ├── prefabs/props/        ← chair, desk, cabinet, water cooler, flag, cell bed, meeting table
│   ├── prefabs/vehicles/     ← police car, helicopter
│   ├── prefabs/structures/   ← helipad, stairs, fence, street lamp
│   └── shared/resources.js   ← Shared geometry & material pool
└── styles/                   ← CSS
```
