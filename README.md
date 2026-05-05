# OpenCity — Tarayıcı Tabanlı 3D Açık Dünya Oyunu

> *Browser-Based 3D Open World Game*

**OpenCity**, tamamen tarayıcıda çalışan, WebGL + Three.js ile inşa edilmiş prosedürel açık dünya oyun motorudur. Şehir içi serbest dolaşım, araç kullanımı, soygun, polis kovalamacası ve çok oyunculu modları hedefler.

> **OpenCity** is a fully browser-based procedural open world game engine built with WebGL and Three.js. It aims to deliver free-roam city exploration, driving, heists, police chases, and multiplayer modes — all in the browser.

**Sıfır harici asset.** Tüm 3D modeller, dokular ve ses efektleri kod ile prosedürel olarak üretilir. `.glb`, `.png`, `.mp3` yok.

> **Zero external assets.** All 3D models, textures, and sound effects are generated procedurally in code. No `.glb`, `.png`, or `.mp3` files.

---

## Proje Durumu · *Project Status*

**Aşama:** Erken geliştirme — Oyun dünyası ve fizik motoru hazır, oyuncu sistemi sırada.

> **Stage:** Early development — Game world and physics engine are ready, player system is next.

**Çalışır durumdaki sistemler · *Working systems:***
- Prosedürel şehir (10×10 grid, yollar, binalar, park, plaj, su) · *Procedural city (10×10 grid, roads, buildings, park, beach, water)*
- Gündüz/gece döngüsü (20dk = 1 oyun günü) · *Day/night cycle (20min = 1 game day)*
- Cannon-es fizik (yerçekimi, çarpışma, debug) · *Physics engine (gravity, collision, debug)*
- Freecam editör (obje seçme, anlık kod düzenleme, AI asistanı) · *Freecam editor (object selection, live code editing, AI assistant)*
- Chunk tabanlı LOD ve performans yönetimi · *Chunk-based LOD & performance management*
- 18 modüler prefab (mobilya, araç, yapı, kıyafet mağazası) · *18 modular prefabs (furniture, vehicles, structures, clothing store)*

**Sıradaki adımlar · *Next steps:***
1. Oyuncu kontrolcüsü (WASD hareket, üçüncü şahıs kamera) · *Player controller (WASD movement, third-person camera)*
2. Araç sistemi (sürüş fiziği, araçlar arası geçiş) · *Vehicle system (driving physics, enter/exit)*
3. Combat ve silahlar (ateş etme, hit detection, particle sistemi) · *Combat & weapons (shooting, hit detection, particles)*
4. NPC sistemi (yayalar, sürücüler, esnaf) · *NPC system (pedestrians, drivers, shopkeepers)*

---

## Teknoloji Yığını · *Tech Stack*

| Katman · *Layer* | Teknoloji · *Technology* |
|---|---|
| 3D Render | Three.js |
| Fizik Motoru · *Physics* | Cannon-es |
| Multiplayer | Socket.io |
| Sesli Sohbet · *Voice Chat* | WebRTC |
| Ses Efektleri · *Audio* | Web Audio API (sentez · *synthesis*) |
| Mini Harita · *Minimap* | Canvas 2D |
| Sunucu · *Server* | Express + Node.js |
| Build | Vite |

---

## Başlangıç · *Getting Started*

```bash
npm install
npm run dev      # Vite (:5173) + Server (:3000)
```

Tarayıcıda `http://localhost:5173` aç. · *Open `http://localhost:5173` in your browser.*

---

## Kontroller · *Controls*

| Tuş · *Key* | İşlev · *Action* |
|---|---|
| **U** | Freecam (geliştirici kamerası · *developer camera*) |
| **W A S D** | Freecam uçuş · *fly* |
| **Q / E** | Alçal / Yüksel · *descend / ascend* |
| **Shift** | Hızlı uçuş · *fast fly* |
| **Mouse** | Bakış yönü · *look around* |
| **F** | Test kutusu fırlat · *spawn test box* |
| **D** | Debug panel |
| **P** | Fizik tel kafes · *physics wireframe* |
| **K / L** | Zamanı ileri/geri sar · *fast-forward / rewind time* |

---

## Geliştirme Yol Haritası · *Development Roadmap*

| Faz · *Phase* | Sistem · *System* | Durum · *Status* |
|---|---|---|
| 1 | Scaffold & Sahne · *Scene* | ✅ |
| 2 | Fizik Motoru · *Physics* | ✅ |
| 3 | Prosedürel Şehir · *Procedural City* | ✅ |
| 4 | Oyuncu Kontrolcüsü · *Player Controller* | ⬜ Bekliyor · *Pending* |
| 5 | Araç Sistemi · *Vehicle System* | ⬜ Bekliyor · *Pending* |
| 6 | Savaş & Silahlar · *Combat & Weapons* | ⬜ Bekliyor · *Pending* |
| 7 | NPC Sistemi · *NPC System* | ⬜ Bekliyor · *Pending* |
| 8 | Polis & Aranma · *Police & Wanted* | ⬜ Bekliyor · *Pending* |
| 9 | Ekonomi & Soygun · *Economy & Heists* | ⬜ Bekliyor · *Pending* |
| 10 | Multiplayer | 🔶 Sunucu hazır · *Server ready* |
| 11 | Sesli/Yazılı Chat · *Voice & Text Chat* | ⬜ Bekliyor · *Pending* |
| 12 | HUD & Arayüz · *UI* | 🔶 CSS hazır · *CSS ready* |
| 13 | Ses Efektleri · *Audio* | ⬜ Bekliyor · *Pending* |
| 14 | Oyun Modları · *Game Modes* | 🔶 Lobi hazır · *Lobby ready* |
| 15 | Optimizasyon · *Optimization* | ✅ |

---

## Proje Yapısı · *Project Structure*

```
server/server.cjs            ← Express + Socket.io sunucusu · server
shared/                      ← Ortak sabitler & yardımcılar · shared constants & utils
client/
├── core/                    ← main.js, renderManager, physicsManager, inputManager, chunkManager
├── builders/                ← entityBuilder, textureBuilder
├── zones/                   ← world.js (şehir · city), zone_police.js, zone_hospital.js
├── editor/                  ← freecamEditor.js
└── ui/                      ← hudManager.js, lobbyManager.js
assets/
├── prefabs/props/           ← Masa, sandalye, dolap, banko, yatak vb. · chair, desk, cabinet, bed...
├── prefabs/vehicles/        ← Polis aracı, helikopter, ambulans · police car, helicopter, ambulance
├── prefabs/structures/      ← Helipad, merdiven, çit, lamba · helipad, stairs, fence, lamp
├── complexes/               ← Polis karakolu, hastane, kıyafet mağazası, süpermarket · police station, hospital...
└── shared/resources.js      ← Geometri & materyal havuzu · geometry & material pool
styles/                      ← CSS
```

---

## Lisans · *License*

MIT — Copyright (c) 2026 Emre Onur Kalafat.

Bu proje eğitim ve araştırma amaçlıdır. Tüm varlıklar prosedürel olarak kod ile üretilir, üçüncü taraf telifli materyal içermez.

> *This project is for educational and research purposes. All assets are procedurally generated in code and contain no third-party copyrighted material.*
