# Sistem İyileştirmesi — 02.05.2026

## Proje: webGTA — Phase 3 Sonu Temizlik ve Yeniden Yapılandırma
## Amaç: Phase 4'e temiz, modüler, okunabilir bir kod tabanıyla başlamak
## Tahmini Toplam Süre: ~5.5 saat

---

Bu rehber, `SistemRaporu02.05.2026.md` raporundaki tespitlere dayanarak hazırlanmış **adım adım uygulama kılavuzudur**. Her adımda ne yapılacağı, nelere dikkat edilmesi gerektiği ve doğrulama yöntemi belirtilmiştir.

**Altın Kural:** Her adımdan sonra projeyi çalıştırıp test et. Bir sonraki adıma geçmeden önce her şeyin çalıştığından emin ol.

---

# BÖLÜM 1 — ZOMBİ KOD TEMİZLİĞİ (45 dk)

Bu bölümde hiçbir yerden çağrılmayan, sadece kafa karışıklığı yaratan ölü kodları siliyoruz.

---

## Adım 1.1 — `entityBuilder.js` Dosyasını Sil (5 dk)

**Dosya:** `client/builders/entityBuilder.js`
**Durum:** 597 satır. Phase 1-2'den kalma monolitik builder. İçindeki 17 fonksiyonun 12'si duplicate (artık ayrı prefab'ları var), 5 tanesi gelecek fazlara ait stub. **Hiçbir yerden import edilmiyor.**

**Yapılacak:**
```bash
rm client/builders/entityBuilder.js
```

**Dikkat edilecek:**
1. Hiçbir dosya bu dosyayı import etmiyor — güvenle silebilirsin.
2. Phase 4'te `buildMaleCharacter/buildFemaleCharacter`, Phase 6'da `buildPistol/buildRifle` ihtiyacı olacak. Bunları **sıfırdan, ilgili fazda** prefab olarak yazacağız. Bu zombi koda asla dokunma.
3. `masa.js` raporun aksine entityBuilder'dan import ETMİYOR — temiz.

**Doğrulama:** Projeyi başlat, konsolda import hatası olmamalı.

---

## Adım 1.2 — `textureBuilder.js` Ölü Fonksiyonları Temizle (15 dk)

**Dosya:** `client/builders/textureBuilder.js` (421 satır → ~250 satır)

Bu dosyada 4 fonksiyon hiç kullanılmıyor. Silinecekler:

### Silinecek #1: `makeBuildingTexture()` — Satır 127-167
Eski 6-katlı, 3-sütun pencere sistemi. Yerine `makeBuildingFacadeTexture()` kullanılıyor.

### Silinecek #2: `makeRoadTexture()` — Satır 50-92
Yollar düz renk `MeshLambertMaterial` + `BoxGeometry` kullanıyor, texture değil.

### Silinecek #3: `makeCarPaintTexture()` — Satır 244-265
Arabalar `InstancedMesh` + `instanceColor` kullanıyor, texture değil.

### Silinecek #4: `makeMinimapRoadTexture()` — Satır 408-421
Minimap henüz implemente edilmedi (Phase 12).

### Silinecek #5 (data): `worldData.js` içindeki `ZONE_FACADE_COLORS` — Satır 22-30
Bina cephe renkleri `data/buildings/registry.js` üzerinden `BUILDING_TYPES[typeName].facadeColor` ile geliyor. Bu sabitler kullanılmıyor.

**Yapılacak:**
1. `textureBuilder.js` dosyasını aç
2. Yukarıdaki 4 fonksiyonu **tamamen** sil (fonksiyon gövdesi + JSDoc dahil)
3. `worldData.js` dosyasını aç, `ZONE_FACADE_COLORS` objesini ve export'unu sil
4. `worldData.js` başındaki `import * as THREE from 'three';` artık gerekli mi kontrol et — `CAR_COLORS` içinde `new THREE.Color()` kullanılıyor, yani import gerekli KALACAK

**Doğrulama:** Projeyi başlat, binalar ve yollar normal görünmeli.

---

## Adım 1.3 — `main.js` Stub Sistemleri ve ChunkManager'ı Temizle (15 dk)

**Dosya:** `client/core/main.js`

### 1.3a — Stub sistemleri kaldır (Satır 36-41 ve 93-103)

```javascript
// ŞU satırları SİL:
const stubSystems = {
  player: () => {}, vehicle: () => {}, combat: () => {},
  npc: () => {}, police: () => {}, economy: () => {},
  particles: () => {}, audio: () => {}, network: () => {},
  hud: () => {}, minimap: () => {},
};
```

```javascript
// update() fonksiyonunda ŞU satırları SİL:
stubSystems.player(delta);
stubSystems.vehicle(delta);
stubSystems.combat(delta);
stubSystems.npc(delta);
stubSystems.police(delta);
stubSystems.economy(delta);
stubSystems.particles(delta);
stubSystems.audio(delta);
stubSystems.network(delta);
stubSystems.hud();
stubSystems.minimap();
```

### 1.3b — ChunkManager çağrısını devre dışı bırak (Satır 91-93)

```javascript
// ŞU satırları SİL:
if (cityData.chunkMgr) {
  cityData.chunkMgr.update(camera.position);
}
```

**Dikkat edilecek:**
- `update()` fonksiyonu içinde `stepPhysics(delta)` kalmalı
- `updateWorld(elapsed)` kalmalı
- Sadece stubSystems ve chunkMgr çağrıları gidecek

**Doğrulama:** Projeyi başlat, konsolda `[STUB]` log'u kalmamalı. FPS ve şehir normal.

---

## Adım 1.4 — `renderManager.js` Çift Import'u Düzelt (2 dk)

**Dosya:** `client/core/renderManager.js`

```javascript
// Satır 9-10, ŞU:
import { CLOUD } from '../../data/environment/skyConfig.js';
import { SKY, LIGHT, DAY_CYCLE, GROUND } from '../../data/environment/skyConfig.js';

// ŞU olacak:
import { SKY, LIGHT, DAY_CYCLE, GROUND, CLOUD } from '../../data/environment/skyConfig.js';
```

**Doğrulama:** Konsolda uyarı kalmamalı. Gökyüzü ve bulutlar normal.

---

## Adım 1.5 — Kök Dizin Çöplüğünü Temizle (5 dk)

**Yapılacak:**
```bash
# 1. Eski spec dosyasını sil
rm ClaudeEski.md

# 2. folderStructer.md'yi docs/'a taşı
mv folderStructer.md docs/folderStructure.md

# 3. Boş scripts/ klasörünü sil
rmdir scripts/

# 4. .ai_prompt_queue.json'u .gitignore'a ekle
echo ".ai_prompt_queue.json" >> .gitignore
```

**Doğrulama:** `ls` ile kök dizinde sadece gerekli dosyalar kalmalı.

---

# BÖLÜM 2 — KLASÖR YENİDEN YAPILANDIRMA (55 dk)

Bu bölümde prefab klasörlerini mantıklı bir hiyerarşiye kavuşturuyoruz.

**Hedef yapı:**
```
assets/prefabs/
├── environment/          ← Gökyüzü, güneş, bulut (DEĞİŞMEYECEK)
├── props/                ← Tekil objeler (alt klasörlü)
│   ├── outdoor/          ← Sokak ekipmanları
│   ├── office/           ← Ofis mobilyaları
│   └── decorative/       ← Dekoratif objeler
├── managers/             ← InstancedMesh fabrikaları (YENİ)
├── vehicles/             ← Araç prefab'ları
└── complexes/            ← Kompleks binalar (YENİ)
```

---

## Adım 2.1 — Yeni Klasörleri Oluştur (2 dk)

```bash
mkdir -p assets/prefabs/managers
mkdir -p assets/prefabs/complexes
mkdir -p assets/prefabs/props/outdoor
mkdir -p assets/prefabs/props/office
mkdir -p assets/prefabs/props/decorative
```

---

## Adım 2.2 — InstancedMesh Fabrikalarını `managers/` Klasörüne Taşı (10 dk)

Bu dosyalar InstancedMesh ile toplu render yapan fabrikalardır. Hepsi `managers/` altında toplanacak ve `Instanced` suffix'i alacak.

### Taşıma listesi:

| Eski Konum | Yeni Konum |
|---|---|
| `props/sokakLambasiManager.js` | `managers/sokakLambasiInstanced.js` |
| `props/agacManager.js` | `managers/agacInstanced.js` |
| `props/trafikIsigiManager.js` | `managers/trafikIsigiInstanced.js` |
| `vehicles/parkEdilmisArabaManager.js` | `managers/parkEdilmisArabaInstanced.js` |

**Yapılacak:**
```bash
mv assets/prefabs/props/sokakLambasiManager.js assets/prefabs/managers/sokakLambasiInstanced.js
mv assets/prefabs/props/agacManager.js assets/prefabs/managers/agacInstanced.js
mv assets/prefabs/props/trafikIsigiManager.js assets/prefabs/managers/trafikIsigiInstanced.js
mv assets/prefabs/vehicles/parkEdilmisArabaManager.js assets/prefabs/managers/parkEdilmisArabaInstanced.js
```

### Import'ları güncelle:

**`client/zones/world.js` Satır 13-14:**
```javascript
// ESKİ:
import { createTreeInstances } from '../../assets/prefabs/props/agacManager.js';
import { createParkedCarInstances } from '../../assets/prefabs/vehicles/parkEdilmisArabaManager.js';

// YENİ:
import { createTreeInstances } from '../../assets/prefabs/managers/agacInstanced.js';
import { createParkedCarInstances } from '../../assets/prefabs/managers/parkEdilmisArabaInstanced.js';
```

**`client/builders/furnitureBuilder.js`:** Bu dosyanın import'larını kontrol et. `sokakLambasiManager.js` ve `trafikIsigiManager.js` import ediyorsa güncelle.

**Dikkat edilecek:**
- Taşınan dosyaların İÇİNDEKİ relative import path'leri de güncelle. Örneğin `agacInstanced.js` içinde `../../shared/resources.js` gibi path'ler değişmemiş olmalı (aynı derinlikte). Kontrol et.

**Doğrulama:** Projeyi başlat, ağaçlar, lambalar, trafik ışıkları ve park etmiş arabalar görünmeli.

---

## Adım 2.3 — `structures/` Klasörünü Boşalt ve Sil (10 dk)

`structures/` klasöründeki dosyaların hepsi aslında ya prop ya da complexes kategorisine ait.

### Taşıma listesi:

| Eski Konum | Yeni Konum | Açıklama |
|---|---|---|
| `structures/sokakLambasi.js` | `props/outdoor/sokakLambasi.js` | Sokak lambası = outdoor prop |
| `structures/helipad.js` | `complexes/helipad.js` | Helipad bir yapı kompleksi |
| `structures/merdiven.js` | `props/outdoor/merdiven.js` | Merdiven outdoor prop |
| `structures/cit.js` | `props/outdoor/cit.js` | Çit outdoor prop |

```bash
mv assets/prefabs/structures/sokakLambasi.js assets/prefabs/props/outdoor/sokakLambasi.js
mv assets/prefabs/structures/helipad.js assets/prefabs/complexes/helipad.js
mv assets/prefabs/structures/merdiven.js assets/prefabs/props/outdoor/merdiven.js
mv assets/prefabs/structures/cit.js assets/prefabs/props/outdoor/cit.js
rmdir assets/prefabs/structures
```

### Import'ları güncelle:

**`client/zones/zone_police.js` Satır 22-27:**
```javascript
// ESKİ:
import { createSokakLambasi } from '../../assets/prefabs/structures/sokakLambasi.js';
import { createHelipad } from '../../assets/prefabs/structures/helipad.js';
import { createMerdiven } from '../../assets/prefabs/structures/merdiven.js';
import { createCitFenceRun } from '../../assets/prefabs/structures/cit.js';

// YENİ:
import { createSokakLambasi } from '../../assets/prefabs/props/outdoor/sokakLambasi.js';
import { createHelipad } from '../../assets/prefabs/complexes/helipad.js';
import { createMerdiven } from '../../assets/prefabs/props/outdoor/merdiven.js';
import { createCitFenceRun } from '../../assets/prefabs/props/outdoor/cit.js';
```

**`client/zones/zone_hospital.js` Satır 11-12:**
```javascript
// ESKİ:
import { createSokakLambasi } from '../../assets/prefabs/structures/sokakLambasi.js';
import { createCitFenceRun } from '../../assets/prefabs/structures/cit.js';

// YENİ:
import { createSokakLambasi } from '../../assets/prefabs/props/outdoor/sokakLambasi.js';
import { createCitFenceRun } from '../../assets/prefabs/props/outdoor/cit.js';
```

**Doğrulama:** Polis karakolu ve hastane bölgeleri eksiksiz görünmeli.

---

## Adım 2.4 — `props/` Alt Klasörlerine Dağıt (20 dk)

Mevcut props/ klasöründe 19 dosya var (temizlik sonrası ~15). Bunları kategorilere ayıracağız.

### Kategori ataması:

| Dosya | Kategori | Yeni Konum |
|---|---|---|
| `agac.js` | outdoor | `props/outdoor/agac.js` |
| `bank.js` | office | `props/office/bank.js` |
| `banko.js` | office | `props/office/banko.js` |
| `bayrak.js` | decorative | `props/decorative/bayrak.js` |
| `beklemeSandalyasi.js` | office | `props/office/beklemeSandalyasi.js` |
| `copKonteyneri.js` | outdoor | `props/outdoor/copKonteyneri.js` |
| `dolap.js` | office | `props/office/dolap.js` |
| `guvenlikKamerasi.js` | office | `props/office/guvenlikKamerasi.js` |
| `hastaneYatagi.js` | office | `props/office/hastaneYatagi.js` |
| `hucreYatagi.js` | office | `props/office/hucreYatagi.js` |
| `jenerator.js` | outdoor | `props/outdoor/jenerator.js` |
| `masa.js` | office | `props/office/masa.js` |
| `sandalye.js` | office | `props/office/sandalye.js` |
| `sehpa.js` | office | `props/office/sehpa.js` |
| `suSebili.js` | office | `props/office/suSebili.js` |
| `toplantiMasasi.js` | office | `props/office/toplantiMasasi.js` |

**Yapılacak:** Her dosya için `mv` komutu çalıştır.

Ardından **taşınan her dosyanın içindeki relative import'ları güncelle.** Örneğin:

```javascript
// props/office/masa.js içinde:
// ESKİ:
import { MAT, boxMesh, cylMesh } from '../../shared/resources.js';
import { createSandalye } from './sandalye.js';

// YENİ:
import { MAT, boxMesh, cylMesh } from '../../../shared/resources.js';
import { createSandalye } from './sandalye.js'; // aynı klasörde, değişmez
```

**Zone dosyalarındaki import'ları güncelle:**

`zone_police.js` içinde masa, sandalye, dolap, suSebili, bayrak, hucreYatagi, toplantiMasasi import'larını yeni path'lere güncelle:
```javascript
// ESKİ:
import { createSandalye } from '../../assets/prefabs/props/sandalye.js';
import { createMasa } from '../../assets/prefabs/props/masa.js';
// ...vb

// YENİ:
import { createSandalye } from '../../assets/prefabs/props/office/sandalye.js';
import { createMasa } from '../../assets/prefabs/props/office/masa.js';
// ...vb
```

`zone_hospital.js` içinde benzer güncellemeleri yap.

**Dikkat edilecek:**
- Bir alt klasöre inen her dosya için relative import path'leri bir seviye yukarı (`../` → `../../`) çıkacak
- Aynı klasör içindeki import'lar (`'./sandalye.js'`) değişmez
- Zone dosyalarındaki import'lar bir seviye DERİNE inecek (`/props/` → `/props/office/` veya `/props/outdoor/`)

**Doğrulama:** Tüm zone'lar çalışıyor olmalı. Hiçbir "module not found" hatası almamalısın.

---

## Adım 2.5 — Tüm Import'ları Global Ara ve Kontrol Et (10 dk)

Tüm taşımalar bittikten sonra, kırık import kalmadığından emin olmak için:

```bash
# Eski path'leri ara - hiçbir sonuç dönmemeli
grep -r "structures/sokakLambasi" --include="*.js" .
grep -r "structures/helipad" --include="*.js" .
grep -r "structures/merdiven" --include="*.js" .
grep -r "structures/cit" --include="*.js" .
grep -r "props/sokakLambasiManager" --include="*.js" .
grep -r "props/agacManager" --include="*.js" .
grep -r "vehicles/parkEdilmisArabaManager" --include="*.js" .
grep -r "entityBuilder" --include="*.js" .
```

Herhangi bir eşleşme bulursan, o import'u yeni path ile güncelle.

**Doğrulama:** Tüm grep'ler boş dönmeli. Proje başlatılabilmeli.

---

# BÖLÜM 3 — ZONE DOSYALARINI TAŞI VE YENİDEN YAPILANDIR (75 dk)

Zone dosyaları şu an `client/zones/` altında. Bunlar aslında "kompleks bina prefab'ları" — `assets/prefabs/complexes/` altına taşıyacağız.

---

## Adım 3.1 — Zone Dosyalarını Birebir Taşı (15 dk)

```bash
mv client/zones/zone_police.js assets/prefabs/complexes/polisKarakolu.js
mv client/zones/zone_hospital.js assets/prefabs/complexes/hastane.js
```

### `polisKarakolu.js` içindeki relative import'ları güncelle:

```javascript
// ESKİ (zone_police.js satır 12-27):
import { getPhysicsWorld } from '../core/physicsManager.js';
import { cityData } from './world.js';
import { GEO, MAT, boxMesh, cylMesh } from '../../assets/shared/resources.js';
import { createSandalye } from '../../assets/prefabs/props/sandalye.js';
// ... ve diğer prefab import'ları

// YENİ:
import { getPhysicsWorld } from '../../client/core/physicsManager.js';
import { cityData } from '../../client/zones/world.js'; // dairesel bağımlılık — Adım 6'da kıracağız
import { GEO, MAT, boxMesh, cylMesh } from '../../assets/shared/resources.js';
import { createSandalye } from '../props/office/sandalye.js';
// ... diğerlerini de yeni path'lere güncelle
```

### `hastane.js` içindeki relative import'ları güncelle:

Aynı mantıkla tüm `../../` path'lerini yeni konuma göre düzelt.

### `world.js` içindeki import'ları güncelle:

```javascript
// Satır 10-11, ESKİ:
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from './zone_police.js';
import { createHospital, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW } from './zone_hospital.js';

// YENİ:
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from '../../assets/prefabs/complexes/polisKarakolu.js';
import { createHospital, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW } from '../../assets/prefabs/complexes/hastane.js';
```

**Doğrulama:** Projeyi başlat, polis karakolu ve hastane görünmeli.

---

## Adım 3.2 — Hastane Dosyasını Alt Modüllere Böl (30 dk)

**Mevcut:** `hastane.js` — 654 satır
**Hedef:** 11 dosya, her biri 40-80 satır

### Adım 3.2a — Alt klasörü oluştur:
```bash
mkdir -p assets/prefabs/complexes/hospital
```

### Adım 3.2b — `hastane.js`'i analiz et ve parçala:

Hastane dosyasında şu build fonksiyonları var (isimler kod incelenerek belirlenecek):
- `buildShell()` — Bina dış kabuğu
- `buildRoof()` — Çatı + helipad alanı
- `buildEmergencyInterior()` — Acil servis iç mekanı
- `buildMainLobby()` — Ana lobi
- `buildAmbulanceBay()` — Ambulans girişi
- `buildMainCanopy()` — Ana giriş saçağı
- `buildParking()` — Otopark
- `buildGarden()` — Bahçe
- `buildServiceArea()` — Servis alanı
- `buildPerimeter()` — Çevre düzenlemesi

Her biri için ayrı dosya oluştur:

```
assets/prefabs/complexes/hospital/
├── index.js              ← Orkestrasyon: tüm build fonksiyonlarını sırayla çağırır
├── shell.js
├── roof.js
├── emergency.js
├── lobby.js
├── ambulanceBay.js
├── canopy.js
├── parking.js
├── garden.js
├── serviceArea.js
└── perimeter.js
```

### Nasıl parçalanacak:

1. **`index.js`** — `createHospital(scene, physicsWorld)` fonksiyonu. Diğer tüm modülleri import edip sırayla çağırır. Layout sabitleri (HW, HD, FH, NS, BH) burada kalır. Her alt modüle parametre olarak geçirir.

```javascript
// assets/prefabs/complexes/hospital/index.js
import { buildShell } from './shell.js';
import { buildRoof } from './roof.js';
import { buildEmergencyInterior } from './emergency.js';
// ... diğer import'lar

export const HOSPITAL_ORIGIN = { x: 180, y: 0, z: -36 };
export const HOSPITAL_GRID_COL = 7;
export const HOSPITAL_GRID_ROW = 4;

export function createHospital(scene, physicsWorld) {
  const group = new THREE.Group();
  const layouts = { HW: 14, HD: 10, FH: 4, NS: 3, BH: 12 }; // mevcut sabitleri koru

  buildShell(group, layouts);          // S1
  buildRoof(group, layouts);           // S2
  buildEmergencyInterior(group);       // S3
  buildMainLobby(group);               // S4
  buildAmbulanceBay(group);            // S5
  buildMainCanopy(group);              // S6
  buildParking(group, physicsWorld);   // S7
  buildGarden(group, physicsWorld);    // S8
  buildServiceArea(group, physicsWorld);// S9
  buildPerimeter(group, physicsWorld, layouts); // S10

  scene.add(group);
  return { group };
}
```

2. **Her alt modül** — İlgili build fonksiyonunu ve yardımcılarını içerir. SADECE o bölümün sorumlu olduğu geometriyi üretir.

```javascript
// assets/prefabs/complexes/hospital/shell.js (örnek)
import * as THREE from 'three';

export function buildShell(parent, L) {
  // Sadece binanın dış duvarları
  // ...
}
```

### Dikkat edilecek:
- **Ortak yardımcı fonksiyonları** (b, wb, cyl, slab, ptl, placePrefab) bir `helpers.js` dosyasına çıkar. Tüm alt modüller buradan import etsin.
- Her alt modülün en üstüne `const SRC = 'assets/prefabs/complexes/hospital/shell.js';` ekle ki freecam editör doğru kaynağı göstersin.
- Materyaller için `resources.js`'ten MAT kullan. Hastanenin kendi materyallerini tanımlamaktan vazgeç.

### Doğrulama:
- Hastane görsel olarak bölme işleminden ÖNCEKİ ile AYNI olmalı
- Freecam ile hastane objelerine tıklayınca doğru sourceFile gösterilmeli

---

## Adım 3.3 — Polis Karakolu Dosyasını Alt Modüllere Böl (25 dk)

**Mevcut:** `polisKarakolu.js` — 611 satır
**Hedef:** Benzer alt modül yapısı

### Alt klasörü oluştur:
```bash
mkdir -p assets/prefabs/complexes/police
```

Polis karakolunun build aşamalarını inceleyip karşılık gelen modüllere ayır. Pattern hastane ile aynı:

```
assets/prefabs/complexes/police/
├── index.js              ← buildPoliceStationComplex() orkestrasyonu
├── mainBuilding.js       ← Ana karakol binası
├── perimeter.js          ← Çevre çiti + bariyerler
├── parking.js            ← Otopark
├── helipad.js            ← Helikopter pisti
├── interior.js           ← İç mekan (masalar, sandalyeler, hücreler)
├── lighting.js           ← Işıklandırma
└── helpers.js            ← box(), add(), addCyl(), wallX(), wallZ(), placeFenceRun()
```

### Dikkat edilecek:
- `cityData` import'u ve circular dependency **bu aşamada hala duracak**. Bunu Bölüm 6'da kıracağız. Şimdilik path'i düzelt, çalışır halde bırak.
- `placeFenceRun()` fonksiyonu `helpers.js`'te kalsın, `perimeter.js` import etsin.

---

## Adım 3.4 — Zone'ların `complexes/` Entegrasyonunu Tamamla (5 dk)

`world.js` import'larını güncelle:

```javascript
// world.js — yeni import'lar:
import { buildPoliceStationComplex, POLICE_GRID_COL, POLICE_GRID_ROW } from '../../assets/prefabs/complexes/police/index.js';
import { createHospital, HOSPITAL_GRID_COL, HOSPITAL_GRID_ROW } from '../../assets/prefabs/complexes/hospital/index.js';
```

**Doğrulama:** Tüm şehir eksiksiz render edilmeli. Polis karakolu ve hastane yerli yerinde.

---

# BÖLÜM 4 — ORTAK MODÜLLER (45 dk)

---

## Adım 4.1 — `zoneHelpers.js` Ortak Modülünü Yaz (25 dk)

**Yeni dosya:** `assets/shared/zoneHelpers.js`

Bu modül, tüm zone (complexes) dosyalarının kullanacağı standart geometri yerleştirme fonksiyonlarını içerir.

```javascript
// assets/shared/zoneHelpers.js — Standard zone placement helpers
// All complexes MUST use these instead of writing their own box/cylinder/slab helpers.

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GEO, MAT } from './resources.js';
import { getPhysicsWorld } from '../../client/core/physicsManager.js';

const SRC = 'assets/shared/zoneHelpers.js';

/**
 * Place a box mesh into a parent group. Optionally adds a static physics body.
 * @param {THREE.Group} parent - The group to add the mesh to
 * @param {Object} opts
 * @param {[number,number,number]} opts.dims - [sx, sy, sz] scale/boyut
 * @param {[number,number,number]} opts.pos - [lx, ly, lz] world position (center)
 * @param {number} [opts.rotY=0] - Y-axis rotation in radians
 * @param {THREE.Material} opts.material
 * @param {string} [opts.sourceFile] - Freecam source tracking
 * @param {boolean} [opts.physics=false] - Add static CANNON.Body?
 * @returns {THREE.Mesh}
 */
export function placeBox(parent, { dims: [sx, sy, sz], pos: [lx, ly, lz], rotY = 0, material, sourceFile = SRC, physics = false }) {
  const mesh = new THREE.Mesh(GEO.BOX_1, material);
  mesh.scale.set(sx, sy, sz);
  mesh.position.set(lx, ly + sy / 2, lz);
  mesh.rotation.y = rotY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.sourceFile = sourceFile;
  parent.add(mesh);

  if (physics) {
    const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2)) });
    body.position.set(lx, ly + sy / 2, lz);
    body.quaternion.setFromEuler(0, rotY, 0);
    getPhysicsWorld().addBody(body);
  }

  return mesh;
}

/**
 * Place a cylinder mesh. Physics auto-computed as cylinder shape.
 */
export function placeCylinder(parent, { radiusTop, radiusBottom, height, segs = 8, pos: [lx, ly, lz], rotZ = 0, material, sourceFile = SRC, physics = false }) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segs);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(lx, ly + height / 2, lz);
  mesh.rotation.z = rotZ;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.sourceFile = sourceFile;
  parent.add(mesh);

  if (physics) {
    const avgR = (radiusTop + radiusBottom) / 2;
    const body = new CANNON.Body({ mass: 0, shape: new CANNON.Cylinder(avgR, avgR, height, segs) });
    body.position.set(lx, ly + height / 2, lz);
    if (rotZ) body.quaternion.setFromEuler(0, 0, rotZ);
    getPhysicsWorld().addBody(body);
  }

  return mesh;
}

/**
 * Place a flat slab (plane-like box, good for floors/pads).
 */
export function placeSlab(parent, { dims: [sx, sz], pos: [lx, ly, lz], material, sourceFile = SRC }) {
  const mesh = new THREE.Mesh(GEO.BOX_1, material);
  mesh.scale.set(sx, 0.1, sz);
  mesh.position.set(lx, ly, lz);
  mesh.receiveShadow = true;
  mesh.userData.sourceFile = sourceFile;
  parent.add(mesh);
  return mesh;
}

/**
 * Place a prefab Group at a specific position with optional Y rotation.
 */
export function placePrefab(parent, prefabGroup, { pos: [lx, ly, lz], rotY = 0 }) {
  const instance = prefabGroup.clone();
  instance.position.set(lx, ly, lz);
  instance.rotation.y = rotY;
  parent.add(instance);
  return instance;
}

/**
 * Run a fence/railing along one axis with physics segments.
 */
export function placeFenceRun(parent, axis, fixedCoord, start, end, segmentFn) {
  const step = 2.0;
  for (let p = start; p <= end; p += step) {
    if (axis === 'x') {
      segmentFn(parent, p, fixedCoord);
    } else {
      segmentFn(parent, fixedCoord, p);
    }
  }
}
```

### Dikkat edilecek:
- `getPhysicsWorld()` çağrısının çalışması için `initPhysicsWorld()` önce çağrılmış olmalı. Boot sırası: `initPhysicsWorld()` → `generateCity()` zaten bu sırayı sağlıyor.
- `GEO.BOX_1` paylaşımlı geometri. `mesh.scale.set()` ile boyutlandırılıyor — GC dostu.
- Tüm mesh'lere otomatik `sourceFile` atanıyor. Zone'lar override edebilir.

---

## Adım 4.2 — Zone Helper'larını `zoneHelpers.js`'e Geçir (20 dk)

Bu adımda hem hastane hem polis karakolu, kendi helper'ları yerine `zoneHelpers.js` kullanacak şekilde güncellenecek.

### Hastane (`complexes/hospital/`):

1. Alt modüllerdeki `b()`, `wb()`, `cyl()`, `slab()` çağrılarını tespit et
2. Her birini `placeBox()`, `placeCylinder()`, `placeSlab()` ile değiştir

```javascript
// ESKİ (hastane helper pattern):
function b(g, sx, sy, sz, lx, ly, lz, mat, ry = 0) {
  const m = new THREE.Mesh(GEO.BOX_1, mat);
  m.scale.set(sx, sy, sz);
  m.position.set(lx, ly + sy / 2, lz);
  m.rotation.y = ry;
  m.userData.sourceFile = SRC;
  g.add(m);
}

// Kullanımı:
b(group, 14, 4, 10, 0, 0, -5, M.wall);

// YENİ (zoneHelpers ile):
import { placeBox } from '../../../shared/zoneHelpers.js';
placeBox(group, {
  dims: [14, 4, 10],
  pos: [0, 0, -5],
  material: MAT.WALL,
  sourceFile: 'assets/prefabs/complexes/hospital/shell.js',
});
```

### Dikkat edilecek:
1. **Parametre sıralaması değişiyor.** Eski `b(g, sx, sy, sz, lx, ly, lz, mat, ry)` → yeni `placeBox(g, { dims, pos, rotY, material, sourceFile })`. Her çağrıyı TEK TEK dönüştür.
2. **ly değerleri:** Eski sistemde `ly` direkt mesh'in alt Y koordinatı. Yeni `placeBox` `ly`'yi dünya Y pozisyonu olarak alıp `ly + sy/2` yapıyor. Mevcut çağrılardaki `ly` değerlerini bu mantıkla kontrol et.
3. **Fizik body'leri:** `placeBox({ physics: true })` ile otomatik eklenir. Eski manuel `getPhysicsWorld().addBody()` çağrılarını kaldır.
4. **Materyaller:** Hastanenin kendi `const M = { wall: lm(...), ... }` materyalleri yerine `MAT.WALL` vb. kullan.

### Polis (`complexes/police/`):

Aynı dönüşüm:
- `box(scene, addPhys, sx, sy, sz, lx, ly, lz, mat, mass)` → `placeBox(parent, { dims, pos, material, physics })`
- `addCyl(scene, rt, rb, h, segs, mat, lx, ly, lz)` → `placeCylinder(parent, { radiusTop, radiusBottom, height, segs, pos, material })`
- `wallX/wallZ` → `placeFenceRun` veya manuel döngülerle

---

# BÖLÜM 5 — DATA KLASÖR YAPISI OPTİMİZASYONU (15 dk)

Şu an `data/` altında 8 alt klasör var, bazıları sadece 1 dosya içeriyor.

---

## Adım 5.1 — Yeni `data/config/` Klasörünü Oluştur (2 dk)

```bash
mkdir -p data/config
```

---

## Adım 5.2 — Config Dosyalarını Birleştir (10 dk)

### Taşıma/birleştirme:

```bash
# Environment config → data/config/
mv data/environment/skyConfig.js data/config/environment.js
mv data/environment/beachWaterConfig.js data/config/beachWater.js

# Road config
mv data/roads/roadNetworkConfig.js data/config/roads.js

# Furniture + props config'larını birleştir
cat data/furniture/furnitureConfig.js data/props/sokakLambasiConfig.js > data/config/furniture.js
# Not: trafik isigi config'i ayrıca varsa onu da ekle

# World data → data/config/
mv data/zones/worldData.js data/config/world.js
```

### Boş kalan klasörleri sil:
```bash
rmdir data/furniture
rmdir data/props
rmdir data/roads
rmdir data/zones
rmdir data/environment
```

### Tüm import'ları güncelle:

Bu çok kritik — her `data/environment/skyConfig.js` import'unu `data/config/environment.js` olarak güncelle.

```bash
# Hangi dosyalar etkileniyor?
grep -r "data/environment/skyConfig" --include="*.js" .
grep -r "data/environment/beachWaterConfig" --include="*.js" .
grep -r "data/roads/roadNetworkConfig" --include="*.js" .
grep -r "data/furniture/furnitureConfig" --include="*.js" .
grep -r "data/props/" --include="*.js" .
grep -r "data/zones/worldData" --include="*.js" .
```

Her eşleşen dosyadaki import path'ini güncelle:

```javascript
// Örnek güncellemeler:
// renderManager.js:9
// ESKİ: import { SKY, LIGHT, DAY_CYCLE, GROUND, CLOUD } from '../../data/environment/skyConfig.js';
// YENİ: import { SKY, LIGHT, DAY_CYCLE, GROUND, CLOUD } from '../../data/config/environment.js';

// world.js:12
// ESKİ: import { getZone, CUSTOM_BUILDINGS } from '../../data/zones/worldData.js';
// YENİ: import { getZone, CUSTOM_BUILDINGS } from '../../data/config/world.js';
```

### Sonuç data/ yapısı:
```
data/
├── config/
│   ├── environment.js    ← SKY, LIGHT, DAY_CYCLE, SUN, CLOUD, GROUND
│   ├── beachWater.js     ← WATER_ANIM, BEACH
│   ├── roads.js           ← ROAD, SIDEWALK, BLOCK_FILL, MARKING, CROSSWALK
│   ├── furniture.js       ← LAMP, TRAFFIC_LIGHT, STREET_TREE, PARKED_CAR, POLE, ARM
│   └── world.js           ← getZone(), CAR_WEIGHTS, CAR_COLORS, CUSTOM_BUILDINGS
├── buildings/             ← DEĞİŞMEDİ
│   ├── registry.js
│   ├── gokdelen.js
│   ├── ...vb
└── editor/                ← DEĞİŞMEDİ
    ├── deletions.json
    └── actions.json
```

**Doğrulama:** Projeyi başlat. Hiçbir "module not found" hatası almamalısın. Şehrin tamamı normal render edilmeli.

---

# BÖLÜM 6 — DAİRESEL BAĞIMLILIĞI KIR (15 dk)

**Sorun:**
```javascript
// world.js → import from polisKarakolu.js
import { buildPoliceStationComplex, ... } from '../../assets/prefabs/complexes/police/index.js';

// polisKarakolu.js → import from world.js
import { cityData } from '../../client/zones/world.js';
```

`cityData`'ya yazma işlemi `polisKarakolu.js` içinde yapılıyor. Bu birim test yazılamaz hale getiriyor.

---

## Adım 6.1 — Callback Pattern ile Kır

### `polisKarakolu/index.js` içinde:

```javascript
// ESKİ:
import { cityData } from '../../client/zones/world.js';

// buildPoliceStationComplex içinde bir yerde:
cityData.policeGroups.push(someGroup);

// YENİ:
// cityData import'unu KALDIR
// Fonksiyon imzasına cityDataRef ekle:

export function buildPoliceStationComplex(scene, occ, cityDataRef = null) {
  // ...
  // cityData.policeGroups.push(someGroup) yerine:
  if (cityDataRef) {
    cityDataRef.policeGroups.push(someGroup);
  }
  // ...
}
```

### `world.js` içinde:

```javascript
// ESKİ:
buildPoliceStationComplex(scene, occ);

// YENİ:
buildPoliceStationComplex(scene, occ, cityData);
```

### Aynı pattern'i `hastane/index.js` için de uygula (eğer cityData'ya yazıyorsa).

**Doğrulama:** Polis karakolu ve hastane, callback pattern sonrası da aynı şekilde görünmeli. `cityData.policeGroups` dizisi dolu olmalı.

---

# BÖLÜM 7 — `buildingManager.js` PARÇALA (45 dk)

**Mevcut:** 517 satır, 12+ export
**Hedef:** 5 dosya, her biri tek sorumluluk

---

## Adım 7.1 — Alt Modüllere Ayır (35 dk)

### `buildingOrchestrator.js` (~80 satır)
**Sorumluluk:** Ana akış — `placeZoneBuildings()`, `placeCustomBuilding()`, `placeLandmarks()`

```javascript
// client/builders/buildingOrchestrator.js
import { createBuildingBody } from './buildingPhysics.js';
import { getBuildingRoof } from './buildingRoofBuilder.js';
import { getBuildingEntrance } from './buildingEntranceBuilder.js';
import { getBuildingFacade, initFacadeSystem, updateAllFacades } from './buildingFacadeManager.js';
import { addBuildEntry, buildAllBuildings } from './buildingInstancedManager.js';
import { BUILDING_TYPES, getZoneBuildingTypes } from '../../data/buildings/registry.js';

const SRC = 'client/builders/buildingOrchestrator.js';

// placeZoneBuildings(), placeCustomBuilding(), placeLandmarks() burada
```

### `buildingRoofBuilder.js` (~80 satır)
**Sorumluluk:** `buildRoofFlatDetailed()`, `buildRoofFlatSimple()`, `buildRoofPitched()` — her biri farklı bir çatı geometrisi

### `buildingEntranceBuilder.js` (~90 satır)
**Sorumluluk:** `buildEntranceAwning()`, `buildEntrancePorch()`, `buildEntranceRollup()`, `buildEntranceSimple()`

### `buildingFacadeManager.js` (~100 satır)
**Sorumluluk:** Facade texture cache (`typeTexData`), `getTypeTextureData()`, `updateBuildingTexturesForPhase()`, `updateBuildingLighting()`, `initBuildingLights()`

### `buildingPhysics.js` (~50 satır)
**Sorumluluk:** `createBuildingBody()` — bina için CANNON.Body oluşturma

### Dikkat edilecek:
1. **Deferred InstancedMesh sistemi** (`addBuildEntry`, `buildAllBuildings` mevcut buildingManager.js'te private) — bunu da ayrı bir `buildingInstancedManager.js` yap VEYA `buildingOrchestrator.js` içinde bırak.
2. Her dosya en üstte `const SRC = 'client/builders/buildingXxx.js';` tanımlasın
3. `world.js` import'larını güncelle:

```javascript
// world.js — ESKİ:
import {
  placeZoneBuildings, placeCustomBuilding, placeLandmarks,
  initBuildingLights, updateBuildingLighting,
  updateBuildingTexturesForPhase,
} from '../builders/buildingManager.js';

// world.js — YENİ:
import { placeZoneBuildings, placeCustomBuilding, placeLandmarks } from '../builders/buildingOrchestrator.js';
import { initBuildingLights, updateBuildingLighting, updateBuildingTexturesForPhase } from '../builders/buildingFacadeManager.js';
```

---

## Adım 7.2 — Eski `buildingManager.js`'i Sil (5 dk)

```bash
rm client/builders/buildingManager.js
```

**Doğrulama:** Projeyi başlat. Tüm binalar eksiksiz görünmeli. Hiçbir import hatası olmamalı.

---

# BÖLÜM 8 — SON KONTROLLER VE DOĞRULAMA (15 dk)

---

## Adım 8.1 — Global Import Kontrolü

```bash
# Kırık import'ları yakala — hiç sonuç dönmemeli
grep -r "entityBuilder" --include="*.js" .
grep -r "from './zone_police'" --include="*.js" .
grep -r "from './zone_hospital'" --include="*.js" .
grep -r "structures/" --include="*.js" assets/
grep -r "props/agacManager\|props/sokakLambasiManager\|props/trafikIsigiManager" --include="*.js" .
grep -r "vehicles/parkEdilmisArabaManager" --include="*.js" .
grep -r "data/environment/\|data/furniture/\|data/props/\|data/roads/\|data/zones/" --include="*.js" .
```

Herhangi bir eşleşme bulursan düzelt.

---

## Adım 8.2 — Fonksiyonel Test

1. Projeyi başlat: `npm run dev`
2. Konsolda hata olmamalı
3. Görsel kontroller:
   - [ ] Gökyüzü ve bulutlar hareket ediyor
   - [ ] Yollar ve kaldırımlar tam grid
   - [ ] Binalar tüm zone'larda görünüyor
   - [ ] Ağaçlar (sokak + park) var
   - [ ] Sokak lambaları var
   - [ ] Trafik ışıkları var
   - [ ] Park etmiş arabalar var
   - [ ] Polis karakolu kompleksi tam
   - [ ] Hastane kompleksi tam
   - [ ] Plaj ve su animasyonu çalışıyor
   - [ ] Gündüz/gece döngüsü çalışıyor (K/L tuşları ile test)
4. U tuşuyla Freecam'e geç
   - [ ] Freecam hareketi çalışıyor
   - [ ] Objelere tıklayınca sourceFile gösteriliyor
   - [ ] sourceFile path'leri yeni yapıya uygun

---

## Adım 8.3 — Git Commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: Phase 3 sonu sistem iyileştirmesi

- entityBuilder.js (zombi dosya) silindi
- textureBuilder.js'ten 4 ölü fonksiyon temizlendi
- stubSystems ve chunkManager çağrıları main.js'ten kaldırıldı
- renderManager.js çift import düzeltildi
- Kök dizin çöpleri temizlendi (ClaudeEski.md, scripts/, folderStructer.md)
- assets/prefabs/ yeniden yapılandırıldı:
  - managers/ klasörü (InstancedMesh fabrikaları)
  - props/ → outdoor/ office/ decorative/ alt klasörleri
  - structures/ kaldırıldı, içerik dağıtıldı
  - complexes/ klasörü (polis karakolu + hastane)
- zone_police.js ve zone_hospital.js alt modüllere bölündü
- zoneHelpers.js ortak modülü yazıldı
- data/ klasör yapısı düzleştirildi → data/config/
- buildingManager.js 5 parçaya bölündü
- Dairesel bağımlılık (world ↔ zone_police) callback pattern ile kırıldı

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# SONUÇ

Bu iyileştirme sonunda:

| Metrik | Önce | Sonra |
|---|---|---|
| Dosya sayısı | ~58 | ~90 |
| En büyük dosya | 654 satır (hastane) | ~130 satır |
| Ortalama satır/dosya | ~78 | ~45 |
| Ölü kod | 5 fonksiyon, 2 modül | 0 |
| Dairesel bağımlılık | 1 adet | 0 |
| Aynı objenin duplicate implementasyonu | 3'lü (zombi + tekil + Instanced) | 2'li (tekil + Instanced) |
| Zone helper isimlendirme | 2 farklı sistem (b/wb/cyl vs box/add/addCyl) | Tek sistem (placeBox/placeCylinder/placeSlab) |
| Config dosyaları tek klasörlü | 8 alt klasöre dağılmış | data/config/ altında toplu |

Proje Phase 4'e (Oyuncu Kontrolcüsü) **temiz, modüler ve profesyonel bir kod tabanıyla** hazır.

---

*Hazırlayan: Claude Opus 4.7 (AI Kod Ajanı)*
*Tarih: 02.05.2026*
*Referans: SistemRaporu02.05.2026.md*
