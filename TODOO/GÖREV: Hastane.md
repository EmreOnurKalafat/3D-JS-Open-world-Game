
# GÖREV: Hastane Binası — GTA-style Open World (Three.js + Cannon-es)

### Mimari Bağlam
- Renderer: Three.js r160, Physics: cannon-es 0.20
- Tüm yapılar procedural geometry ile (BoxGeometry, CylinderGeometry, PlaneGeometry vb.) — harici 3D model/asset dosyası YOK
- Mevcut dünya sistemi: `world.js` içinde `addBuilding(mesh, body)` API'si ile sahneye obje ekleniyor
- Oyuncu giriş/çıkış: `player.js` içinde kapı trigger zone'ları `PlayerInteraction` sınıfı üzerinden yönetiliyor
- Koordinat sistemi: Y-up, harita merkezi (0,0,0), Doğu = pozitif X ekseni

### Konum & Ölçek
- Pozisyon: `HOSPITAL_ORIGIN = { x: 200, y: 0, z: -10 }` (haritanın doğu bölgesi)
- Arsa boyutu: ~80×65 metre (X×Z)
- Ölçek referansı: oyuncu capsule height = 1.8 birim = 1.8 metre

---

### İnşa Edilecek Yapılar & Detaylar

#### 1. Ana Bina (Hospital Main Structure)
- 3 katlı, ~35×25m taban, toplam yükseklik ~12m
- Dış cephe: `MeshLambertMaterial`, ana duvar `#e8e0d0` (kırık beyaz), çatı `#3a3a3a`
- Bina üzerine kırmızı haç sembolü: ince kırmızı `PlaneGeometry` (decal olarak duvar yüzeyine +0.05 offset ile)
- Pencere boşlukları: birden fazla mesh ile oluşturulan grid düzeninde koyu `#1a1a2e` dikdörtgen detaylar
- **İki ayrı giriş kapısı — her ikisi de oyuncu tarafından girilabilir:**
  - **Acil Girişi (Emergency):** binanın güney-batı köşesi, geniş ~4m, kırmızı/sarı uyarı şerit detayı, üzerinde "ACİL" yazısını simgeleyen kırmızı ışıklı box prop, araç yaklaşabilecek rampalı yol geometrisi
  - **Poliklinik Girişi (Outpatient):** binanın güney-doğu köşesi, ~3m, bekleme tentesi (ince yatay PlaneGeometry saçak), normal yaya girişi

#### 2. İç Mekan — Acil Bölümü (Emergency Department)
> Obje sayısını minimumda tut; sadece alanı tanımlayan en kritik ekipmanlar

- Giriş koridoru: geniş koridor (~4m), zemin `#e0e0e0`, tavan `#f5f5f5`
- **Triaj masası**: tek büyük counter (BoxGeometry, `#ffffff`)
- **2 adet acil müdahale yatağı**: ince uzun box (yatak) + ince yüksek box (başucu ekipman standı) kombinasyonu, `#dcdcdc` gri-beyaz; yatakların etrafı yeşil zemin bant ile işaretli (`PlaneGeometry` overlay)
- **Defibrilatör standı**: küçük box + silindir kombinasyonu, `#ffcc00` sarı detay
- **İlaç dolabı**: duvara bitişik tall box, `#b0c4de` açık mavi
- Acil bölümü ile diğer alanlar arasında **yarı şeffaf beyaz bölücü panel** (PlaneGeometry, opacity: 0.4)
- Interaction zone: triaj masası önünde `{ type: 'emergency_checkin', label: '[E] Tedavi', radius: 2 }`

#### 3. İç Mekan — Poliklinik Bölümü (Outpatient / Ward)
- Merkezi koridor boyunca iki sıra **4 adet hasta odası** (her biri ~5×4m):
  - Her odada: 1–2 yatak (box), küçük komodin (box), pencere geometrisi
  - Odalar arasında ince duvar bölücüler, her odanın kapısı `door_ward_N` tag'i ile işaretli
- **Bekleme alanı**: 4–6 sandalye (küçük box kombinasyonları L-shape), orta sehpa
- **Hemşire istasyonu**: merkezi counter, etrafında dolaşılabilir açık alan
- Zemin: `#f0f0e8` açık krem, koridor şeridi `#88aacc` açık mavi bant

#### 4. İç Mekan — Ameliyathane (Operating Room)
- Konum: binanın kuzey-iç bölümü, ayrı kapalı blok (~10×8m)
- **Ameliyat masası**: merkeze yerleştirilmiş dar-uzun box, `#c0c0c0` metal gri
- **Ameliyat lambası**: tavan ortasından sallanan silindir + disk geometrisi, üzerinde `PointLight` (intensity: 1.2, distance: 8, color: `#fffaf0` sıcak beyaz)
- **Alet tepsisi**: masanın yanında küçük yatay platform
- **İzleme monitörleri**: 2 adet ince box (monitör), duvara monte, `#001a00` koyu yeşil ekran rengi
- Duvarlar: `#d0e8d0` hafif yeşilimsi steril renk
- Giriş: çift kanatlı `swinging_door` (iki adet ince box) — `door_OR` tag'i ile işaretli
- Ameliyathane kapısı dışında küçük **hazırlık odası**: el yıkama tezgahı (L-shape box), askı

#### 5. Dış Alan — Otopark
- Arsanın doğu ve kuzey kenarlarında ~25×20m asfalt alan (`#2a2a2a` koyu gri PlaneGeometry)
- **12 araç park yeri**: beyaz şerit çizgileri (ince PlaneGeometry, `MeshBasicMaterial #ffffff`, Y+0.01 offset)
- Giriş/çıkış yolu: arsanın ana yoluna bağlanan ~6m genişliğinde açık geçit
- Otopark aydınlatması: 3 adet yüksek sokak lambası (silindir direk + `PointLight`, intensity: 0.6)

#### 6. Dış Alan — Ambulans & Acil Yolu
- Acil girişine dik olarak uzanan ~20×7m **ambulans yolu** (açık gri PlaneGeometry, sarı merkez çizgisi)
- **1 adet park halinde ambulans prop'u**: 
  - Gövde: büyük beyaz box (~5×2×2.2m)
  - Tepe: küçük beyaz box + kırmızı/mavi uyarı ışığı bar
  - Tekerlekler: 4 adet siyah silindir
  - Ön cephe: `#ffcc00` sarı-turuncu şerit detayı, arka kapı çerçevesi
- Ambulansın arkasında açık `InteractionZone`: `{ type: 'ambulance', label: '[E] Ambulans', radius: 3 }`

#### 7. Dış Alan — Bahçe & Park Alanı
- Binanın güney-doğusunda ~20×15m yeşil alan (`#4a7c3f` yeşil PlaneGeometry)
- **3 adet bank (oturma bankı)**: L-shape box kombinasyonu, `#8B6914` ahşap kahve rengi
- **2 adet ağaç prop'u**: silindir gövde (`#5c3d1e`) + koyu yeşil küre yaprak (`SphereGeometry`, `#2d5a1b`)
- **Yürüyüş yolu**: bahçeyi kat eden ince `#c8b89a` bej PlaneGeometry şerit yollar
- Küçük **çiçek tarhı**: alçak box çerçeve içinde `#7ec850` açık yeşil zemin

#### 8. Çevre & Sınır Detayları
- Arsayı çevreleyen **düşük beton duvar**: yükseklik 0.8m, kalınlık 0.25m, `#b0a090` beton gri; hem `THREE.Mesh` hem `CANNON.Body (mass=0)`
- Ana giriş geçidi: güneyde ~8m açık (duvar yok), iki yanında beton direk
- **Tabelalar**: binanın önünde beyaz arka planlı box + kırmızı haç prop'u (`#cc0000`)
- Bina köşelerinde 4 adet **güvenlik kamerası** prop'u: küçük silindir + ufak box (dekoratif)

---

### Kod Yapısı & Entegrasyon

```javascript
// Beklenen export yapısı:
export function createHospital(scene, physicsWorld, interactionManager) {
  const group = new THREE.Group();

  buildMainStructure(group, physicsWorld);   // dış kabuk, duvarlar, çatı
  buildEmergencyWing(group, interactionManager);  // acil iç mekan
  buildOutpatientWard(group, interactionManager); // poliklinik iç mekan
  buildOperatingRoom(group);                 // ameliyathane
  buildParkingLot(group, physicsWorld);      // otopark + ambulans
  buildGarden(group);                        // bahçe
  buildPerimeterWall(group, physicsWorld);   // çevre duvarı

  scene.add(group);
  return { group, interactionZones };
}
```

- Tüm pozisyonlar `HOSPITAL_ORIGIN = { x: 200, y: 0, z: -10 }` sabitiyle offset'li hesapla
- Her oda/alan için collision body: `CANNON.Box`, static (`mass: 0`), `collisionFilterGroup` + `collisionFilterMask` ekle
- Interaction zone listesi `{ type, label, position, radius }` formatında return et
- İç mekanda oyuncu geçişi için kapı trigger zone'ları: `{ type: 'door', id: 'door_id', position, width }`
- Ameliyathane PointLight'ı `lightPool`'a ekle (sahne ışık limiti için)

### Performans Kısıtlamaları
- Toplam mesh sayısı < 200 (tüm hastane için)
- Geometry'leri mümkün olduğunca `merge` et veya `InstancedMesh` kullan (pencere tekrarları, park çizgileri, sandalyeler)
- Sadece kritik interior ışıklar için `PointLight` kullan (max 4 adet), geri kalanlar emissive material ile simüle et

### Çıktı Beklentisi
Tek bir `hospital.js` dosyası. Hiçbir harici asset import etmeden, sadece Three.js ve cannon-es kullanarak yukarıdaki tüm yapıyı oluştur. Dosyanın sonuna tüm interaction zone'ların ve kapı ID'lerinin listesini JSDoc comment olarak ekle.