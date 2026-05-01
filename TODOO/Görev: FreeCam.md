# GÖREV: Oyun İçi Canlı Editör (Live Editor) ve AI Asistan Entegrasyonu

## 1. Sistemin Amacı
Oyunda "FreeCam" moduna geçildiğinde, oyuncunun ekranın ortasındaki nişangah (crosshair) ile objeleri seçebildiği, seçilen objenin özelliklerini canlı olarak oyun içinde düzenleyebildiği ve bu düzenlemeleri yapay zeka (AI) asistanı yardımıyla otomatize edebildiği bir sistem inşa edilecektir.

## 2. Temel Mekanikler ve Kurallar

### A. Nişangah ile Seçim (Center Raycasting)
- **Tetikleyici:** Oyuncu FreeCam moduna geçtiğinde ekranın tam ortasına CSS ile bir nişangah (`+` veya nokta) eklenecek.
- **Mekanik:** Three.js `Raycaster` sürekli olarak ekranın tam merkezinden (`x: 0, y: 0`) ileriye doğru ışın gönderecek.
- **Kural:** Yalnızca `userData.editable = true` veya belirli bir katmandaki (Layer) objeler Raycaster tarafından algılanacak.

### B. Performans Dostu Vurgulama (Highlight / Hover Effect)
- **Tetikleyici:** Raycaster bir objeyle kesiştiğinde (Hover durumu).
- **Görsel:** Objenin etrafında **sarı renkte** bir dış hat (outline) veya parlama oluşacak.
- **Optimizasyon Kuralı:** Ağır performans tüketen `EffectComposer` veya `OutlinePass` (Post-processing) **KULLANILMAYACAKTIR**. 
- **İstenen Yöntem:** Objenin `EdgesGeometry`'si alınarak basit bir `LineBasicMaterial` (renk: sarı) oluşturulacak ve ana objeye alt obje (child) olarak eklenecek. Nişangah objeden çıkınca bu çizgi silinecek. Bu yöntem sıfıra yakın performans harcar.

### C. Etkileşim ve Düzenleme Penceresi (Live Editor UI)
- **Tetikleyici:** Hover durumundaki (sarı vurgulu) objeye farenin Sol Tık'ı ile basılması.
- **Aksiyon:** FreeCam kilitlenir/duraklatılır ve ekranda HTML/CSS tabanlı bir "Obje Düzenleme Penceresi" (Modal) açılır.
- **Pencere İçeriği:**
  - Seçilen objenin mevcut durumunu yansıtan ham veri / kod (`JSON` veya JS nesnesi) bir `<textarea>` içinde gösterilir.
  - Bu alan klavye ve fare ile tamamen düzenlenebilir olmalıdır.
- **Kontrol Butonları:**
  1. **Kaydet (Save):** Metin alanındaki yeni veriyi objeye (ve ana JSON state'ine) anında uygular. Ekranı yenilemeden objeyi günceller.
  2. **Kapat (Close):** Pencereyi kapatır, değişiklikleri iptal eder ve FreeCam hareketini geri verir.
  3. **AI Yardım (AI Assist):** Tıklandığında ana metin alanının altında yeni bir "Yapay Zeka İstek Paneli" açar.

### D. AI İstek Paneli (AI Workflow)
- **Tasarım:** Sadece kullanıcının doğal dille komut yazabileceği bir input alanı ve "AI'a Gönder" butonu içerir.
- **Örnek Prompt (Kullanıcı girdisi):** *"Bu objenin rengini mavi yap ve z ekseninde boyutunu 2 katına çıkar."*
- **Sistem Akışı:**
  1. Kullanıcı isteği yazar ve butona basar.
  2. Sistem, "Objenin mevcut verisi" ile "Kullanıcının isteğini" birleştirerek bir JSON paketi hazırlar.
  3. Bu paket, yerel Node.js sunucusundaki bir AI endpoint'ine (`/api/ai-edit`) gönderilir veya Claude Code agent'ının okuyabilmesi için bir tmp dosyasına (`.ai_prompt_queue.json`) yazılır.
  4. AI işlemi bitirip yanıt döndüğünde, editördeki `<textarea>` otomatik olarak güncellenir ve oyun motoru yeni değerleri objeye uygular.

## 3. Uygulama Adımları (AI Ajanı İçin Görev Sırası)

Lütfen bu görevi aşağıdaki sıraya sadık kalarak, her adımı test edilebilir şekilde kodla:

1. **Adım 1:** CSS ile nişangahı oluştur ve Three.js `Raycaster` mantığını ekranın merkezinden çalışacak şekilde `freecam.js` (veya ilgili) modülüne entegre et.
2. **Adım 2:** Post-processing kullanmadan, `EdgesGeometry` mantığı ile çalışan, Raycaster'ın gördüğü objeyi sarı renkte çevreleyen optimizasyonlu highlight sistemini yaz.
3. **Adım 3:** HTML/CSS ile oyunun canvas'ı üzerine binecek (overlay) Editör Penceresini (Modal) tasarla. (Kapat, Kaydet, AI Yardım butonları dahil).
4. **Adım 4:** Seçilen objenin `position`, `rotation`, `scale`, `color` vb. verilerini JSON string'i olarak pencereye basan ve `Save` butonuna basıldığında bu veriyi parse edip objeye anında uygulayan mantığı yaz.
5. **Adım 5:** AI Yardım butonunun UI tarafını (yeni prompt alanını açma) ve bu veriyi paketleyip Express sunucusuna post edecek Fetch fonksiyonunu tamamla.

Not: Projenin Source of Truth yapısına (önceden tanımlanan JSON tabanlı veri mimarisine) sadık kalmayı unutma. Anlaşıldıysa Adım 1 ile kodlamaya başla.