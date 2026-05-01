# 3D-JS-Open-world-Game

> **Tarayıcı tabanlı GTA tarzı 3D açık dünya oyunu** — Three.js · Cannon-es · Socket.io
>
> **Browser-based GTA-style 3D open-world game** — Three.js · Cannon-es · Socket.io

---

## 📋 İçindekiler / Table of Contents

- [Proje Nedir?](#-proje-nedir--what-is-this-project)
- [Teknoloji Yığını](#-teknoloji-yığını--tech-stack)
- [Mevcut Durum](#-mevcut-durum--current-status)
- [Proje Yapısı](#-proje-yapısı--project-structure)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma--setup--run)
- [Kontroller](#-kontroller--controls)
- [Eksikler ve Yapılacaklar](#-eksikler-ve-yapılacaklar--missing-features--todo)
- [Yol Haritası](#-yol-haritası--roadmap)

---

## 🎮 Proje Nedir? / What Is This Project?

**TR:** Bu proje, GTA (Grand Theft Auto) serisinden ilham alarak tamamen tarayıcıda çalışan bir 3D açık dünya oyunudur. Harici 3D model veya asset dosyası kullanılmaz; tüm geometriler **Three.js procedural geometry** (BoxGeometry, CylinderGeometry vb.) ile çalışma zamanında üretilir. Şehir, binalar, yollar, araçlar, ağaçlar — hepsi kod ile oluşturulur.

**EN:** This project is a browser-based 3D open-world game inspired by the GTA (Grand Theft Auto) series. It uses no external 3D model or asset files — all geometry is generated at runtime using **Three.js procedural geometry** (BoxGeometry, CylinderGeometry, etc.). The city, buildings, roads, vehicles, and trees are all built with code.

### Hedef / Goal

Tek bir tarayıcı sekmesinde açılabilen, **çok oyunculu**, GTA benzeri bir açık dünya deneyimi sunmak:

- Prosedürel üretilmiş şehir
- Araç sürme ve savaş sistemi
- NPC ve polis sistemi
- Ekonomi, görev, silah sistemleri
- Socket.io ile gerçek zamanlı çok oyuncu

---

## 🛠 Teknoloji Yığını / Tech Stack

| Katman / Layer | Teknoloji / Technology | Açıklama / Notes |
|---|---|---|
| 3D Render | [Three.js](https://threejs.org/) r160 | Sahne, kamera, ışık, geometri |
| Fizik / Physics | [Cannon-es](https://github.com/pmndrs/cannon-es) 0.20 | Rijit cisim fiziği |
| Ağ / Network | [Socket.io](https://socket.io/) 4.7 | Gerçek zamanlı çok oyuncu |
| Sunucu / Server | [Express](https://expressjs.com/) 4.18 | REST API + static serve |
| Build | [Vite](https://vitejs.dev/) 5.0 | Dev server + production build |
| Runtime | Node.js | `server.cjs` sunucu tarafı |

---

## ✅ Mevcut Durum / Current Status

> Proje şu anda **Faz 3** aşamasındadır.

### Tamamlananlar / Implemented

| Özellik / Feature | Durum / Status | Notlar / Notes |
|---|---|---|
| Three.js sahne kurulumu | ✅ | Renderer, kamera, sis, arka plan |
| Gündüz/Gece döngüsü | ✅ | 20 dakika tam döngü, 4 faz (gün/gece/gün batımı/şafak) |
| Güneş hareketi | ✅ | Gerçekçi doğu→güney→batı arkı |
| Prosedürel gökyüzü | ✅ | Faza göre gradyan dokular |
| Bulut animasyonu | ✅ | 4 animasyonlu bulut grubu |
| Prosedürel şehir | ✅ | 10×10 grid, InstancedMesh, LOD chunk sistemi |
| Bina fizik collision | ✅ | Cannon-es static box bodies |
| Bina pencere ışıkları | ✅ | Geceye göre emissive parlaklık |
| Yol ve kaldırım geometrisi | ✅ | Şerit çizgileri, kaldırım, çim |
| Park ve ağaçlar | ✅ | Prosedürel ağaç prop'ları |
| Park halindeki araçlar | ✅ | Dekoratif sedan, SUV, kamyon modelleri |
| Polis karakolu | ✅ | Tam detaylı prosedürel yapı |
| Su animasyonu | ✅ | Dalgalı su yüzeyi |
| Freecam modu | ✅ | WASD + fare, Shift boost |
| Fizik debug overlay | ✅ | D/P tuşu ile toggle |
| FPS sayacı | ✅ | Gerçek zamanlı, renkli |
| Oyun saati | ✅ | Dijital saat + faz etiketi |
| Express sunucu | 🔧 Stub | Temel yönlendirmeler mevcut |
| Socket.io | 🔧 Stub | Faz 10'da aktive edilecek |
| Lobi ekranı | 🔧 Stub | `lobby.html` var, henüz boş |

---

## 📁 Proje Yapısı / Project Structure

```
3D-JS-Open-world-Game/
├── index.html              # Ana oyun sayfası
├── lobby.html              # Lobi/giriş sayfası (stub)
├── server.cjs              # Node.js + Express sunucu
├── vite.config.js          # Vite yapılandırması
├── package.json
│
├── client/                 # İstemci tarafı oyun kodu
│   ├── main.js             # Sahne init, oyun döngüsü, gündüz/gece
│   ├── world.js            # Prosedürel şehir üretimi (InstancedMesh, chunk)
│   ├── physics.js          # Cannon-es dünya, body factory'leri, debug
│   ├── chunkManager.js     # Chunk tabanlı görünürlük / LOD
│   ├── textureBuilder.js   # Canvas tabanlı prosedürel dokular
│   ├── assetBuilder.js     # Prosedürel 3D model factory'leri (araçlar)
│   ├── policeStation.js    # Polis karakolu kompleksi
│   └── utils.js            # Math yardımcıları (lerp, clamp, vb.)
│
├── shared/
│   └── constants.js        # Tüm sabitler (ağ, dünya, oyuncu, araç, silah…)
│
├── styles/
│   ├── hud.css             # HUD stilleri (Faz 12'de doldurulacak)
│   └── lobby.css           # Lobi stilleri (Faz 4'te doldurulacak)
│
└── TODOO/                  # Gelecek görev tanımları
    ├── GÖREV: Polis Karakolu.md
    └── GÖREV: Hastane.md
```

### Anahtar Sabitler / Key Constants (`shared/constants.js`)

- **`WORLD`** — Grid boyutu, blok boyutu, yerçekimi, spawn noktaları
- **`PLAYER`** — Hızlar, capsule boyutları, HP/armor, kamera offset
- **`VEHICLE`** — 8 araç tipi (SEDAN, SPORTS, SUV, TRUCK, MOTORCYCLE, HELICOPTER, BOAT, POLICE_CAR)
- **`WEAPONS`** — 10 silah (FIST, KNIFE, BASEBALL_BAT, PISTOL, SHOTGUN, SMG, ASSAULT_RIFLE, SNIPER, RPG, GRENADE, MINIGUN)
- **`WANTED`** — 5 yıldız sistemi, köşe görüş konisi, arama yarıçapı
- **`GAME_MODES`** — 7 oyun modu (Free Roam, Deathmatch, Team DM, Cops & Robbers, Last Standing, Street Race, King of the Hill)

---

## 🚀 Kurulum ve Çalıştırma / Setup & Run

### Gereksinimler / Requirements

- **Node.js** ≥ 18
- **npm** ≥ 9

### Adımlar / Steps

```bash
# 1. Bağımlılıkları yükle / Install dependencies
npm install

# 2. Geliştirme modunda çalıştır (Vite dev + Express sunucu aynı anda)
npm run dev

# 3. Tarayıcıda aç / Open in browser
# http://localhost:5173
```

**Production:**
```bash
npm run build   # Dist klasörüne derle
npm start       # Express sunucusunu başlat (port 3000)
```

---

## 🎮 Kontroller / Controls

| Tuş / Key | Eylem / Action |
|---|---|
| `U` | Freecam modunu aç/kapat |
| `W A S D` | Freecam hareketi (freecam aktifken) |
| `Q / E` | Freecam aşağı / yukarı |
| `Shift` | Hızlı freecam hareketi (3× hız) |
| `K / L` | Oyun saatini -1 / +1 saat geri al / ileri al |
| `D` veya `P` | Fizik debug wireframe'i aç/kapat |
| `F` | Test kutusu fırlat (pointer lock aktifken) |
| **Fare / Mouse** | Freecam yön kontrolü |
| **Canvas tıklama** | Pointer lock iste |

---

## ❌ Eksikler ve Yapılacaklar / Missing Features & TODO

Aşağıdaki sistemler `main.js` içinde **stub (boş yer tutucu)** olarak tanımlanmış, henüz implemente edilmemiştir:

### 🧍 Oyuncu Sistemi / Player System
- [ ] Oyuncu kapsülü (fizik body, kamera takibi, 3. şahıs görünüm)
- [ ] Yürüme / koşma / sprint hareketi
- [ ] Zıplama ve yerçekimi tepkisi
- [ ] Yüzme sistemi (su tespiti)
- [ ] Can (HP) ve zırh sistemi
- [ ] Oyuncu mesh'i / karakter modeli
- [ ] Karakter kişiselleştirme

### 🚗 Araç Sistemi / Vehicle System
- [ ] Araçlara binme / inme (E tuşu)
- [ ] Araç sürüş fiziği (Cannon.js RaycastVehicle)
- [ ] Motor gücü, fren, direksiyon
- [ ] Süspansiyon ve teker fiziği
- [ ] Araç hasarı (duman → alev → patlama)
- [ ] Helikopter ve tekne fiziği
- [ ] Araç sesi ve egzoz partikülleri
- [ ] HUD göstergesi (hız, vites)

### ⚔️ Savaş Sistemi / Combat System
- [ ] Silah tutma ve ateş etme animasyonu
- [ ] Raycasting ile isabet tespiti
- [ ] Hasar hesaplama (kafa + kol + bacak çarpanları)
- [ ] Mermi iz efekti ve yara yüzeyi
- [ ] El bombası fırlatma fiziği
- [ ] Patlama alanı hasarı (splash damage)
- [ ] Ragdoll sistemi (ölüm animasyonu)
- [ ] Silah toplama (pickup)
- [ ] Silah değiştirme (1–9 tuşları)
- [ ] Nişan alma / zoom sistemi

### 🤖 NPC Sistemi / NPC System
- [ ] Yaya NPC'leri (yürüme, kaçma, panik)
- [ ] NPC sürücüleri (araçlarda)
- [ ] NPC AI davranış ağacı
- [ ] NPC ile etkileşim (soygun, konuşma)

### 👮 Polis Sistemi / Police System
- [ ] İstenen yıldız seviyesi (1–5 yıldız)
- [ ] Polis AI (kovalama, görüş konisi)
- [ ] Polis araçları spawn sistemi
- [ ] Bribe (rüşvet) ve Pay-n-Spray sıfırlama
- [ ] SWAT seviyesinde yüksek yıldız yanıtları
- [ ] Arama yarıçapı ve gizlenme sistemi

### 💰 Ekonomi Sistemi / Economy System
- [ ] Para birimi ve cüzdan sistemi
- [ ] NPC soygunları
- [ ] Mağaza soygunları
- [ ] Banka soygunları
- [ ] Hastane tedavi ücreti (ölüm sonrası)
- [ ] Pay-n-Spray arındırma ücreti

### 🎯 Görev Sistemi / Mission System
- [ ] Görev tetikleyici bölgeleri
- [ ] Görev ilerlemesi ve hedefler
- [ ] Ödül / ceza sistemi
- [ ] Görev geçmişi

### 🏗️ Dünya İçeriği / World Content
- [ ] Hastane binası (`hospital.js` — TODOO'da tanımlandı)
- [ ] Banka binası
- [ ] Alışveriş merkezleri ve dükkanlar
- [ ] Pay-n-Spray garage
- [ ] Silah dükkanı
- [ ] Gece kulübü / bar
- [ ] İtfaiye istasyonu
- [ ] Daha fazla landmark yapı
- [ ] Tüneller ve köprüler

### 🌦️ Ortam / Environment
- [ ] Hava durumu sistemi (yağmur, sis, kar)
- [ ] Yağmur partikül sistemi
- [ ] Yol ıslak görünümü (yağmur)
- [ ] Daha fazla bulut çeşidi
- [ ] Gece şehir ışıkları (sokak lambaları)

### 🎨 HUD / Arayüz
- [ ] Can ve zırh barları
- [ ] Para göstergesi
- [ ] Mini harita (radar)
- [ ] Silah seçim tekerleği
- [ ] İstenen yıldız göstergesi
- [ ] Crosshair (nişangah)
- [ ] Bildirim sistemi (para kazandı, öldürme besleme)
- [ ] Mesaj / sohbet kutusu

### 🔊 Ses Sistemi / Audio System
- [ ] Arka plan müziği (Web Audio API)
- [ ] SFX: adım sesleri, silah, araç
- [ ] Yakınlık tabanlı ses (3D spatial audio)
- [ ] Sesle konuşma (Voice proximity — push-to-talk V)

### 🌐 Çok Oyuncu / Multiplayer
- [ ] Socket.io oda sistemi (lobi, oda oluşturma/katılma)
- [ ] Oyuncu konum senkronizasyonu (20 tick/sn)
- [ ] Interpolasyon ve lag kompansasyonu
- [ ] Öldürme besleme yayını
- [ ] Yakın alan sohbeti
- [ ] Çok oyunculu oyun modları aktifleştirme
- [ ] Sunucu taraflı yetkilendirme (hileler önleme)

### 💾 Veri Kalıcılığı / Persistence
- [ ] Oyuncu profili kaydetme (local veya DB)
- [ ] Yüksek skor tablosu
- [ ] Oda ayarları kalıcılığı

---

## 🗺️ Yol Haritası / Roadmap

| Faz / Phase | İçerik / Content | Durum / Status |
|---|---|---|
| **Faz 1** | Proje yapısı, Vite, Express, Socket.io stub | ✅ Tamamlandı |
| **Faz 2** | Three.js sahne, kamera, ışıklar, gökyüzü | ✅ Tamamlandı |
| **Faz 3** | Prosedürel şehir, fizik, InstancedMesh, LOD | ✅ Tamamlandı |
| **Faz 4** | Lobi ekranı, oda oluşturma/katılma UI | 🔧 Planlandı |
| **Faz 5** | Oyuncu kontrolcüsü (hareket, zıplama, kamera) | 🔧 Planlandı |
| **Faz 6** | Araç sistemi (sürüş fiziği) | 🔧 Planlandı |
| **Faz 7** | Savaş sistemi (silahlar, isabet tespiti) | 🔧 Planlandı |
| **Faz 8** | NPC + Polis AI, istenen seviye | 🔧 Planlandı |
| **Faz 9** | Ekonomi, görevler, dünya içeriği | 🔧 Planlandı |
| **Faz 10** | Socket.io çok oyuncu (oda senkronizasyonu) | 🔧 Planlandı |
| **Faz 11** | Ses sistemi, hava durumu, partiküller | 🔧 Planlandı |
| **Faz 12** | HUD, minimap, bildirimler | 🔧 Planlandı |
| **Faz 13** | Performans optimizasyonu, mobil destek | 🔧 Planlandı |

---

## ⚡ Performans Notları / Performance Notes

- Gölge haritası **devre dışı** (GPU tasarrufu — özellikle GTX 1050 gibi orta segment GPU'lar için)
- Binalar **InstancedMesh** kullanır (tek draw call ile binlerce bina)
- **Chunk sistemi**: sadece kamera yakınındaki chunk'lar görünür
- Uzak chunk'lar için **impostor** (düşük poligon temsil) sistemi hazır
- Geometriler `mergeGeometries` ile birleştirilir (draw call azaltma)
- Fizik dünyası: static-static body çarpışmaları atlanır

---

## 📄 Lisans / License

Bu proje kişisel/eğitim amaçlı geliştirilmektedir.
