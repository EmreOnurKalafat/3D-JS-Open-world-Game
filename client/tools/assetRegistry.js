// client/tools/assetRegistry.js — Centralized catalog of all game assets
// Each entry points to the factory export and defines how to invoke it.

/**
 * @typedef {Object} AssetEntry
 * @property {string}  id
 * @property {string}  category
 * @property {string}  [subcategory]
 * @property {string}  label
 * @property {string}  turkishLabel
 * @property {string}  filePath
 * @property {string}  exportName
 * @property {'standalone'|'withScene'|'withSceneAndOcc'} callStrategy
 * @property {number}  [defaultScale]
 * @property {Object}  [defaultArgs]
 */

/** @type {AssetEntry[]} */
export const ASSET_CATALOG = [

  // ═══════════════════════════════════════════════ COMPLEXES (6)
  {
    id: 'hastane', category: 'complexes',
    label: 'Hospital Complex', turkishLabel: 'Hastane Kompleksi',
    filePath: '/assets/complexes/hospital/index.js',
    exportName: 'createHospital', callStrategy: 'withScene',
  },
  {
    id: 'polis', category: 'complexes',
    label: 'Police Station Complex', turkishLabel: 'Polis Karakolu Kompleksi',
    filePath: '/assets/complexes/police/index.js',
    exportName: 'buildPoliceStationComplex', callStrategy: 'withSceneAndOcc',
  },
  {
    id: 'kiyafet_magazasi', category: 'complexes',
    label: 'Clothing Store Complex', turkishLabel: 'Kıyafet Mağazası Kompleksi',
    filePath: '/assets/complexes/kiyafet/index.js',
    exportName: 'createKiyafetMagazasi', callStrategy: 'withScene',
  },
  {
    id: 'supermarket', category: 'complexes',
    label: 'Supermarket Complex', turkishLabel: 'Süpermarket Kompleksi',
    filePath: '/assets/complexes/supermarket/index.js',
    exportName: 'createSupermarket', callStrategy: 'withScene',
  },
  {
    id: 'otopark', category: 'complexes',
    label: 'Parking Lot Complex', turkishLabel: 'Otopark Kompleksi',
    filePath: '/assets/complexes/parkinglot/index.js',
    exportName: 'createParkingLot', callStrategy: 'withScene',
  },
  {
    id: 'helipad', category: 'complexes',
    label: 'Helipad', turkishLabel: 'Helipad',
    filePath: '/assets/complexes/helipad.js',
    exportName: 'createHelipad', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ VEHICLES (9)
  {
    id: 'sedan', category: 'vehicles',
    label: 'Sedan Car', turkishLabel: 'Sedan Araba',
    filePath: '/assets/vehicles/sedan.js',
    exportName: 'createSedan', callStrategy: 'standalone',
  },
  {
    id: 'sports', category: 'vehicles',
    label: 'Sports Car', turkishLabel: 'Spor Araba',
    filePath: '/assets/vehicles/sports.js',
    exportName: 'createSports', callStrategy: 'standalone',
  },
  {
    id: 'suv', category: 'vehicles',
    label: 'SUV', turkishLabel: 'SUV Araba',
    filePath: '/assets/vehicles/suv.js',
    exportName: 'createSuv', callStrategy: 'standalone',
  },
  {
    id: 'truck', category: 'vehicles',
    label: 'Box Truck', turkishLabel: 'Kamyon',
    filePath: '/assets/vehicles/truck.js',
    exportName: 'createTruck', callStrategy: 'standalone',
  },
  {
    id: 'motorcycle', category: 'vehicles',
    label: 'Motorcycle', turkishLabel: 'Motosiklet',
    filePath: '/assets/vehicles/motorcycle.js',
    exportName: 'createMotorcycle', callStrategy: 'standalone',
  },
  {
    id: 'boat', category: 'vehicles',
    label: 'Boat', turkishLabel: 'Bot / Tekne',
    filePath: '/assets/vehicles/boat.js',
    exportName: 'createBoat', callStrategy: 'standalone',
  },
  {
    id: 'ambulans', category: 'vehicles',
    label: 'Ambulance', turkishLabel: 'Ambulans',
    filePath: '/assets/vehicles/ambulans.js',
    exportName: 'createAmbulans', callStrategy: 'standalone',
  },
  {
    id: 'helikopter', category: 'vehicles',
    label: 'Helicopter', turkishLabel: 'Helikopter',
    filePath: '/assets/vehicles/helikopter.js',
    exportName: 'createHelikopter', callStrategy: 'standalone',
  },
  {
    id: 'polis_arabasi', category: 'vehicles',
    label: 'Police Car', turkishLabel: 'Polis Arabası',
    filePath: '/assets/vehicles/polisArabasi.js',
    exportName: 'createPolisArabasi', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ ENVIRONMENT (2)
  {
    id: 'bulut', category: 'environment',
    label: 'Cloud Group', turkishLabel: 'Bulut Grubu',
    filePath: '/assets/environment/bulut.js',
    exportName: 'createCloud', callStrategy: 'standalone',
  },
  {
    id: 'gunes', category: 'environment',
    label: 'Sun Mesh', turkishLabel: 'Güneş',
    filePath: '/assets/environment/gunes.js',
    exportName: 'createSun', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ PROPS — kiyafet (18)
  {
    id: 'askiDuvar', category: 'props', subcategory: 'kiyafet',
    label: 'Hanger Wall', turkishLabel: 'Askı Duvar',
    filePath: '/assets/props/kiyafet/askiDuvar.js',
    exportName: 'createAskiDuvar', callStrategy: 'standalone',
  },
  {
    id: 'askilikStand', category: 'props', subcategory: 'kiyafet',
    label: 'Hanger Stand', turkishLabel: 'Askılık Stand',
    filePath: '/assets/props/kiyafet/askilikStand.js',
    exportName: 'createAskilikStand', callStrategy: 'standalone',
  },
  {
    id: 'ayakkabiKutusu', category: 'props', subcategory: 'kiyafet',
    label: 'Shoe Box', turkishLabel: 'Ayakkabı Kutusu',
    filePath: '/assets/props/kiyafet/ayakkabiKutusu.js',
    exportName: 'createAyakkabiKutusu', callStrategy: 'standalone',
  },
  {
    id: 'bedenEtiketi', category: 'props', subcategory: 'kiyafet',
    label: 'Size Tag', turkishLabel: 'Beden Etiketi',
    filePath: '/assets/props/kiyafet/bedenEtiketi.js',
    exportName: 'createBedenEtiketi', callStrategy: 'standalone',
  },
  {
    id: 'buyukAyna', category: 'props', subcategory: 'kiyafet',
    label: 'Large Mirror', turkishLabel: 'Büyük Ayna',
    filePath: '/assets/props/kiyafet/buyukAyna.js',
    exportName: 'createBuyukAyna', callStrategy: 'standalone',
  },
  {
    id: 'giysiAskisi', category: 'props', subcategory: 'kiyafet',
    label: 'Clothes Hanger', turkishLabel: 'Giysi Askısı',
    filePath: '/assets/props/kiyafet/giysiAskisi.js',
    exportName: 'createGiysiAskisi', callStrategy: 'standalone',
  },
  {
    id: 'hediyeKutusu', category: 'props', subcategory: 'kiyafet',
    label: 'Gift Box', turkishLabel: 'Hediye Kutusu',
    filePath: '/assets/props/kiyafet/hediyeKutusu.js',
    exportName: 'createHediyeKutusu', callStrategy: 'standalone',
  },
  {
    id: 'indirimTabelasi', category: 'props', subcategory: 'kiyafet',
    label: 'Sale Sign', turkishLabel: 'İndirim Tabelası',
    filePath: '/assets/props/kiyafet/indirimTabelasi.js',
    exportName: 'createIndirimTabelasi', callStrategy: 'standalone',
  },
  {
    id: 'kapiCam', category: 'props', subcategory: 'kiyafet',
    label: 'Glass Door', turkishLabel: 'Kapı Cam',
    filePath: '/assets/props/kiyafet/kapiCam.js',
    exportName: 'createKapiCam', callStrategy: 'standalone',
  },
  {
    id: 'kasaBankosu', category: 'props', subcategory: 'kiyafet',
    label: 'Cashier Counter', turkishLabel: 'Kasa Bankosu',
    filePath: '/assets/props/kiyafet/kasaBankosu.js',
    exportName: 'createKasaBankosu', callStrategy: 'standalone',
  },
  {
    id: 'kumasTopu', category: 'props', subcategory: 'kiyafet',
    label: 'Fabric Roll', turkishLabel: 'Kumaş Topu',
    filePath: '/assets/props/kiyafet/kumasTopu.js',
    exportName: 'createKumasTopu', callStrategy: 'standalone',
  },
  {
    id: 'lootAyakkabi', category: 'props', subcategory: 'kiyafet',
    label: 'Loot Shoes', turkishLabel: 'Loot Ayakkabı',
    filePath: '/assets/props/kiyafet/lootAyakkabi.js',
    exportName: 'createLootAyakkabi', callStrategy: 'standalone',
  },
  {
    id: 'lootKiyafet', category: 'props', subcategory: 'kiyafet',
    label: 'Loot Clothing', turkishLabel: 'Loot Kıyafet',
    filePath: '/assets/props/kiyafet/lootKiyafet.js',
    exportName: 'createLootKiyafet', callStrategy: 'standalone',
  },
  {
    id: 'lootSapka', category: 'props', subcategory: 'kiyafet',
    label: 'Loot Hat', turkishLabel: 'Loot Şapka',
    filePath: '/assets/props/kiyafet/lootSapka.js',
    exportName: 'createLootSapka', callStrategy: 'standalone',
  },
  {
    id: 'manken', category: 'props', subcategory: 'kiyafet',
    label: 'Mannequin', turkishLabel: 'Manken',
    filePath: '/assets/props/kiyafet/manken.js',
    exportName: 'createManken', callStrategy: 'standalone',
    defaultArgs: 'straight',
  },
  {
    id: 'musteriSepeti', category: 'props', subcategory: 'kiyafet',
    label: 'Shopping Basket', turkishLabel: 'Müşteri Sepeti',
    filePath: '/assets/props/kiyafet/musteriSepeti.js',
    exportName: 'createMusteriSepeti', callStrategy: 'standalone',
  },
  {
    id: 'rafUnitesi', category: 'props', subcategory: 'kiyafet',
    label: 'Shelf Unit', turkishLabel: 'Raf Ünitesi',
    filePath: '/assets/props/kiyafet/rafUnitesi.js',
    exportName: 'createRafUnitesi', callStrategy: 'standalone',
  },
  {
    id: 'soyunmaKabini', category: 'props', subcategory: 'kiyafet',
    label: 'Fitting Room', turkishLabel: 'Soyunma Kabini',
    filePath: '/assets/props/kiyafet/soyunmaKabini.js',
    exportName: 'createSoyunmaKabini', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ PROPS — market (30)
  {
    id: 'market-alisverisArabasi', category: 'props', subcategory: 'market',
    label: 'Shopping Cart', turkishLabel: 'Alışveriş Arabası',
    filePath: '/assets/props/market/alisverisArabasi.js',
    exportName: 'createAlisverisArabasi', callStrategy: 'standalone',
  },
  {
    id: 'market-dondurucuCamli', category: 'props', subcategory: 'market',
    label: 'Glass Freezer', turkishLabel: 'Dondurucu (Camlı)',
    filePath: '/assets/props/market/dondurucuCamli.js',
    exportName: 'createDondurucuCamli', callStrategy: 'standalone',
  },
  {
    id: 'market-islakZeminTabelasi', category: 'props', subcategory: 'market',
    label: 'Wet Floor Sign', turkishLabel: 'Islak Zemin Tabelası',
    filePath: '/assets/props/market/islakZeminTabelasi.js',
    exportName: 'createIslakZeminTabelasi', callStrategy: 'standalone',
  },
  {
    id: 'market-kapiOtomatik', category: 'props', subcategory: 'market',
    label: 'Automatic Door', turkishLabel: 'Kapı (Otomatik)',
    filePath: '/assets/props/market/kapiOtomatik.js',
    exportName: 'createKapiOtomatik', callStrategy: 'standalone',
  },
  {
    id: 'market-kasaBankosu', category: 'props', subcategory: 'market',
    label: 'Cashier Counter', turkishLabel: 'Kasa Bankosu',
    filePath: '/assets/props/market/kasaBankosu.js',
    exportName: 'createKasaBankosu', callStrategy: 'standalone',
  },
  {
    id: 'market-koliKutu', category: 'props', subcategory: 'market',
    label: 'Cardboard Box', turkishLabel: 'Koli Kutu',
    filePath: '/assets/props/market/koliKutu.js',
    exportName: 'createKoliKutu', callStrategy: 'standalone',
  },
  {
    id: 'market-lootAgriKesici', category: 'props', subcategory: 'market',
    label: 'Loot Painkiller', turkishLabel: 'Loot Ağrı Kesici',
    filePath: '/assets/props/market/lootAgriKesici.js',
    exportName: 'createLootAgriKesici', callStrategy: 'standalone',
  },
  {
    id: 'market-lootCakmak', category: 'props', subcategory: 'market',
    label: 'Loot Lighter', turkishLabel: 'Loot Çakmak',
    filePath: '/assets/props/market/lootCakmak.js',
    exportName: 'createLootCakmak', callStrategy: 'standalone',
  },
  {
    id: 'market-lootCips', category: 'props', subcategory: 'market',
    label: 'Loot Chips', turkishLabel: 'Loot Cips',
    filePath: '/assets/props/market/lootCips.js',
    exportName: 'createLootCips', callStrategy: 'standalone',
  },
  {
    id: 'market-lootDamacana', category: 'props', subcategory: 'market',
    label: 'Loot Water Jug', turkishLabel: 'Loot Damacana',
    filePath: '/assets/props/market/lootDamacana.js',
    exportName: 'createLootDamacana', callStrategy: 'standalone',
  },
  {
    id: 'market-lootElma', category: 'props', subcategory: 'market',
    label: 'Loot Apple', turkishLabel: 'Loot Elma',
    filePath: '/assets/props/market/lootElma.js',
    exportName: 'createLootElma', callStrategy: 'standalone',
  },
  {
    id: 'market-lootEnerji', category: 'props', subcategory: 'market',
    label: 'Loot Energy Drink', turkishLabel: 'Loot Enerji İçeceği',
    filePath: '/assets/props/market/lootEnerji.js',
    exportName: 'createLootEnerji', callStrategy: 'standalone',
  },
  {
    id: 'market-lootKarpuz', category: 'props', subcategory: 'market',
    label: 'Loot Watermelon', turkishLabel: 'Loot Karpuz',
    filePath: '/assets/props/market/lootKarpuz.js',
    exportName: 'createLootKarpuz', callStrategy: 'standalone',
  },
  {
    id: 'market-lootKonserve', category: 'props', subcategory: 'market',
    label: 'Loot Canned Food', turkishLabel: 'Loot Konserve',
    filePath: '/assets/props/market/lootKonserve.js',
    exportName: 'createLootKonserve', callStrategy: 'standalone',
  },
  {
    id: 'market-lootMedkit', category: 'props', subcategory: 'market',
    label: 'Loot Medkit', turkishLabel: 'Loot Medkit',
    filePath: '/assets/props/market/lootMedkit.js',
    exportName: 'createLootMedkit', callStrategy: 'standalone',
  },
  {
    id: 'market-lootMuz', category: 'props', subcategory: 'market',
    label: 'Loot Banana', turkishLabel: 'Loot Muz',
    filePath: '/assets/props/market/lootMuz.js',
    exportName: 'createLootMuz', callStrategy: 'standalone',
  },
  {
    id: 'market-lootPil', category: 'props', subcategory: 'market',
    label: 'Loot Battery', turkishLabel: 'Loot Pil',
    filePath: '/assets/props/market/lootPil.js',
    exportName: 'createLootPil', callStrategy: 'standalone',
  },
  {
    id: 'market-lootSut', category: 'props', subcategory: 'market',
    label: 'Loot Milk', turkishLabel: 'Loot Süt',
    filePath: '/assets/props/market/lootSut.js',
    exportName: 'createLootSut', callStrategy: 'standalone',
  },
  {
    id: 'market-manavTezgahi', category: 'props', subcategory: 'market',
    label: 'Produce Stand', turkishLabel: 'Manav Tezgahı',
    filePath: '/assets/props/market/manavTezgahi.js',
    exportName: 'createManavTezgahi', callStrategy: 'standalone',
  },
  {
    id: 'market-paletAhsap', category: 'props', subcategory: 'market',
    label: 'Wooden Pallet', turkishLabel: 'Palet (Ahşap)',
    filePath: '/assets/props/market/paletAhsap.js',
    exportName: 'createPaletAhsap', callStrategy: 'standalone',
  },
  {
    id: 'market-posCihazi', category: 'props', subcategory: 'market',
    label: 'POS Terminal', turkishLabel: 'POS Cihazı',
    filePath: '/assets/props/market/posCihazi.js',
    exportName: 'createPosCihazi', callStrategy: 'standalone',
  },
  {
    id: 'market-reyonBos', category: 'props', subcategory: 'market',
    label: 'Empty Shelf', turkishLabel: 'Reyon (Boş)',
    filePath: '/assets/props/market/reyonBos.js',
    exportName: 'createReyonBos', callStrategy: 'standalone',
  },
  {
    id: 'market-reyonDolu', category: 'props', subcategory: 'market',
    label: 'Stocked Shelf', turkishLabel: 'Reyon (Dolu)',
    filePath: '/assets/props/market/reyonDolu.js',
    exportName: 'createReyonDolu', callStrategy: 'standalone',
  },
  {
    id: 'market-sogutucuAcik', category: 'props', subcategory: 'market',
    label: 'Open Cooler', turkishLabel: 'Soğutucu (Açık)',
    filePath: '/assets/props/market/sogutucuAcik.js',
    exportName: 'createSogutucuAcik', callStrategy: 'standalone',
  },
  {
    id: 'market-tavanTabelasi', category: 'props', subcategory: 'market',
    label: 'Ceiling Sign', turkishLabel: 'Tavan Tabelası',
    filePath: '/assets/props/market/tavanTabelasi.js',
    exportName: 'createTavanTabelasi', callStrategy: 'standalone',
  },
  {
    id: 'market-transpalet', category: 'props', subcategory: 'market',
    label: 'Pallet Jack', turkishLabel: 'Transpalet',
    filePath: '/assets/props/market/transpalet.js',
    exportName: 'createTranspalet', callStrategy: 'standalone',
  },
  {
    id: 'market-turnike', category: 'props', subcategory: 'market',
    label: 'Turnstile', turkishLabel: 'Turnike',
    filePath: '/assets/props/market/turnike.js',
    exportName: 'createTurnike', callStrategy: 'standalone',
  },
  {
    id: 'market-yagVarili', category: 'props', subcategory: 'market',
    label: 'Oil Barrel', turkishLabel: 'Yağ Varili',
    filePath: '/assets/props/market/yagVarili.js',
    exportName: 'createYagVarili', callStrategy: 'standalone',
  },
  {
    id: 'market-yanginSondurucu', category: 'props', subcategory: 'market',
    label: 'Fire Extinguisher', turkishLabel: 'Yangın Söndürücü',
    filePath: '/assets/props/market/yanginSondurucu.js',
    exportName: 'createYanginSondurucu', callStrategy: 'standalone',
  },
  {
    id: 'market-yazarkasa', category: 'props', subcategory: 'market',
    label: 'Cash Register', turkishLabel: 'Yazarkasa',
    filePath: '/assets/props/market/yazarkasa.js',
    exportName: 'createYazarkasa', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ PROPS — office (12)
  {
    id: 'office-bank', category: 'props', subcategory: 'office',
    label: 'Bench', turkishLabel: 'Bank',
    filePath: '/assets/props/office/bank.js',
    exportName: 'createBank', callStrategy: 'standalone',
  },
  {
    id: 'office-banko', category: 'props', subcategory: 'office',
    label: 'Reception Desk', turkishLabel: 'Banko',
    filePath: '/assets/props/office/banko.js',
    exportName: 'createBanko', callStrategy: 'standalone',
  },
  {
    id: 'office-beklemeSandalyasi', category: 'props', subcategory: 'office',
    label: 'Waiting Chair', turkishLabel: 'Bekleme Sandalyesi',
    filePath: '/assets/props/office/beklemeSandalyasi.js',
    exportName: 'createBeklemeSandalyasi', callStrategy: 'standalone',
  },
  {
    id: 'office-dolap', category: 'props', subcategory: 'office',
    label: 'Cabinet', turkishLabel: 'Dolap',
    filePath: '/assets/props/office/dolap.js',
    exportName: 'createDolap', callStrategy: 'standalone',
  },
  {
    id: 'office-guvenlikKamerasi', category: 'props', subcategory: 'office',
    label: 'Security Camera', turkishLabel: 'Güvenlik Kamerası',
    filePath: '/assets/props/office/guvenlikKamerasi.js',
    exportName: 'createGuvenlikKamerasi', callStrategy: 'standalone',
  },
  {
    id: 'office-hastaneYatagi', category: 'props', subcategory: 'office',
    label: 'Hospital Bed', turkishLabel: 'Hastane Yatağı',
    filePath: '/assets/props/office/hastaneYatagi.js',
    exportName: 'createHastaneYatagi', callStrategy: 'standalone',
  },
  {
    id: 'office-hucreYatagi', category: 'props', subcategory: 'office',
    label: 'Cell Bed', turkishLabel: 'Hücre Yatağı',
    filePath: '/assets/props/office/hucreYatagi.js',
    exportName: 'createHucreYatagi', callStrategy: 'standalone',
  },
  {
    id: 'office-masa', category: 'props', subcategory: 'office',
    label: 'Desk', turkishLabel: 'Masa',
    filePath: '/assets/props/office/masa.js',
    exportName: 'createMasa', callStrategy: 'standalone',
  },
  {
    id: 'office-sandalye', category: 'props', subcategory: 'office',
    label: 'Chair', turkishLabel: 'Sandalye',
    filePath: '/assets/props/office/sandalye.js',
    exportName: 'createSandalye', callStrategy: 'standalone',
  },
  {
    id: 'office-sehpa', category: 'props', subcategory: 'office',
    label: 'Coffee Table', turkishLabel: 'Sehpa',
    filePath: '/assets/props/office/sehpa.js',
    exportName: 'createSehpa', callStrategy: 'standalone',
  },
  {
    id: 'office-suSebili', category: 'props', subcategory: 'office',
    label: 'Water Dispenser', turkishLabel: 'Su Sebili',
    filePath: '/assets/props/office/suSebili.js',
    exportName: 'createSuSebili', callStrategy: 'standalone',
  },
  {
    id: 'office-toplantiMasasi', category: 'props', subcategory: 'office',
    label: 'Meeting Table', turkishLabel: 'Toplantı Masası',
    filePath: '/assets/props/office/toplantiMasasi.js',
    exportName: 'createToplantiMasasi', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ PROPS — outdoor (6)
  {
    id: 'outdoor-agac', category: 'props', subcategory: 'outdoor',
    label: 'Tree', turkishLabel: 'Ağaç',
    filePath: '/assets/props/outdoor/agac.js',
    exportName: 'createAgac', callStrategy: 'standalone',
    defaultArgs: 1.0,
  },
  {
    id: 'outdoor-cit', category: 'props', subcategory: 'outdoor',
    label: 'Fence', turkishLabel: 'Çit',
    filePath: '/assets/props/outdoor/cit.js',
    exportName: 'createCitFenceRun', callStrategy: 'standalone',
    defaultArgs: { axis: 'x', start: -5, end: 5, fixedCoord: 0 },
  },
  {
    id: 'outdoor-copKonteyneri', category: 'props', subcategory: 'outdoor',
    label: 'Dumpster', turkishLabel: 'Çöp Konteyneri',
    filePath: '/assets/props/outdoor/copKonteyneri.js',
    exportName: 'createCopKonteyneri', callStrategy: 'standalone',
  },
  {
    id: 'outdoor-jenerator', category: 'props', subcategory: 'outdoor',
    label: 'Generator', turkishLabel: 'Jeneratör',
    filePath: '/assets/props/outdoor/jenerator.js',
    exportName: 'createJenerator', callStrategy: 'standalone',
  },
  {
    id: 'outdoor-merdiven', category: 'props', subcategory: 'outdoor',
    label: 'Stairs', turkishLabel: 'Merdiven',
    filePath: '/assets/props/outdoor/merdiven.js',
    exportName: 'createMerdiven', callStrategy: 'standalone',
  },
  {
    id: 'outdoor-sokakLambasi', category: 'props', subcategory: 'outdoor',
    label: 'Street Lamp', turkishLabel: 'Sokak Lambası',
    filePath: '/assets/props/outdoor/sokakLambasi.js',
    exportName: 'createSokakLambasi', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ PROPS — decorative (1)
  {
    id: 'decorative-bayrak', category: 'props', subcategory: 'decorative',
    label: 'Flag', turkishLabel: 'Bayrak',
    filePath: '/assets/props/decorative/bayrak.js',
    exportName: 'createBayrak', callStrategy: 'standalone',
  },

  // ═══════════════════════════════════════════════ WORLD ELEMENTS (10)
  {
    id: 'world-yol', category: 'world',
    label: 'Road Segment', turkishLabel: 'Yol Parçası',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createRoadSegment', callStrategy: 'standalone',
  },
  {
    id: 'world-kaldirim', category: 'world',
    label: 'Sidewalk Segment', turkishLabel: 'Kaldırım',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createSidewalkSegment', callStrategy: 'standalone',
  },
  {
    id: 'world-zemin', category: 'world',
    label: 'Block Fill (Grass)', turkishLabel: 'Zemin Dolgu (Çimen)',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createBlockFill', callStrategy: 'standalone',
  },
  {
    id: 'world-cimen', category: 'world',
    label: 'Grass Plane (Park)', turkishLabel: 'Çimen / Park Zemini',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createGrassPlane', callStrategy: 'standalone',
  },
  {
    id: 'world-bina', category: 'world',
    label: 'Building (Procedural)', turkishLabel: 'Bina (Prosedürel)',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createBuilding', callStrategy: 'standalone',
  },
  {
    id: 'world-araba', category: 'world',
    label: 'Parked Car', turkishLabel: 'Park Edilmiş Araba',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createParkedCar', callStrategy: 'standalone',
  },
  {
    id: 'world-trafik', category: 'world',
    label: 'Traffic Light', turkishLabel: 'Trafik Lambası',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createTrafficLight', callStrategy: 'standalone',
  },
  {
    id: 'world-plaj', category: 'world',
    label: 'Beach / Sand', turkishLabel: 'Plaj / Kum',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createBeachSegment', callStrategy: 'standalone',
  },
  {
    id: 'world-su', category: 'world',
    label: 'Water Plane', turkishLabel: 'Su Yüzeyi',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createWaterPlane', callStrategy: 'standalone',
  },
  {
    id: 'world-yayaGecidi', category: 'world',
    label: 'Crosswalk', turkishLabel: 'Yaya Geçidi',
    filePath: '/client/tools/worldElements.js',
    exportName: 'createCrosswalk', callStrategy: 'standalone',
  },
];
