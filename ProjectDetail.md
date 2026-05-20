Valorant Yetenek Sesi Tahmin Oyunu — Proje Planı
🎯 Proje Özeti
Kullanıcıya bir Valorant ajan yetenek sesi çalınır, kullanıcı hangi ajan + hangi yetenek olduğunu tahminler. Skor sistemi, zaman baskısı ve leaderboard ile eğlenceli bir web oyunu.

🏗️ Teknik Mimari
Frontend

React + Vite — hızlı geliştirme
Tailwind CSS — Valorant tarzı koyu/kırmızı tema
Howler.js — ses oynatma & kontrol
Framer Motion — animasyonlar

Backend / Veri

Valorant API (community) — ajan görselleri ve metadata için valorant-api.com (ücretsiz, resmi olmayan ama stabil)
Ses dosyaları — AbilitySounds klasörü içinde var.
Supabase — skor tablosu & kullanıcı verisi için


🗂️ Özellik Listesi (Aşamalar)
Faz 1 — MVP
✅ Rastgele ses çal
✅ Ajan listesinden seçim yap (multiple choice)
✅ Yetenek seçimi (Q / E / C / X)
✅ Doğru/yanlış feedback + ajan görseli
✅ Skor sayacı (10 soruluk tur)
Faz 2 — Oyun Deneyimi
⏱️ Geri sayım sayacı (15 saniye)
🔊 Ses ipucu sistemi (3 ipucu hakkı)
💡 Hint: "Bu ajan Duelist sınıfındandır" gibi ipuçları
🎯 Zorluk seviyeleri (Kolay / Orta / Zor)
📊 Tur sonu detaylı sonuç ekranı
Faz 3 — Sosyal & Rekabet
🏆 Global leaderboard (Supabase)
👤 Kullanıcı profili (istatistikler)
🔗 Sonuç paylaşma (Twitter/X kartı)
🎮 Günlük challenge modu
⚔️ Kapışma (Battle Room) — çok oyunculu gerçek zamanlı yarışma modu

---

## ⚔️ Kapışma (Battle Room) Modu

### Ne işe yarar?

Kapışma modu, tek başına oynanan klasik modun aksine **aynı odada 2–10 oyuncunun** aynı anda aynı yetenek sesini dinleyip **ilk doğru cevabı** vermeye çalıştığı gerçek zamanlı yarışma modudur. Ek sunucu gerekmez; tüm senkronizasyon **Supabase Realtime** (Broadcast + Presence) üzerinden yapılır.

| Özellik | Açıklama |
|--------|----------|
| Oda kodu | Host 4 harfli kod üretir (örn. `ABCD`), diğerleri bu kodla katılır |
| Host | Odayı kuran oyuncu; oyunu başlatır, cevapları doğrular, tur sonucunu yayınlar |
| Yarışma | Her turda herkes aynı sesi duyar; ajan + yetenek seçince cevap anında gönderilir |
| Skor | İlk tam doğru cevap +220; yanlış cevap −30; kısmi doğru (sadece ajan) 0 |

### Sistem mimarisi

```
Host tarayıcısı
    │  channel.broadcast(game_started, question, round_result, game_over)
    ▼
Supabase Realtime kanalı: room:{KOD}
    ▲
    │  presence (oyuncu listesi) + answer_submitted (her oyuncu)
Guest 1, Guest 2, ...
```

**Host arbitration:** Host tüm `answer_submitted` event'lerini alır. Doğruluk kontrolü ve zaman damgası host tarafında yapılır; ilk tam doğru cevabı veren turu kazanır. İki oyuncu aynı anda doğru cevaplarsa event geliş sırası (`ts`) kullanılır.

**Veritabanı (`rooms` tablosu):** Oda kodu, host adı, durum (`waiting` / `playing` / `finished`), karıştırılmış soru listesi. Reconnect ve odaya katılma için kullanılır. Canlı oyun akışı Broadcast ile yürür; `rooms` tablosunun Replication listesinde olması gerekmez.

### Broadcast event'leri

| Event | Kim gönderir | İçerik |
|-------|--------------|--------|
| `game_started` | Host | `question_keys`, `total_rounds`, `scores` |
| `question` | Host | `index`, `key`, `agentId`, `slot`, `soundPath`, `choices` |
| `answer_submitted` | Her oyuncu | `playerId`, `playerName`, `agentId`, `slot`, `ts`, `questionIndex` |
| `round_result` | Host | `winner`, `correctAgent`, `correctSlot`, `scores` |
| `game_over` | Host | `final_scores` |

**Presence:** Oyuncu adı, host bayrağı, katılım zamanı — lobi listesi otomatik güncellenir.

### Oyun akışı

```
Ana Sayfa → KAPİŞMA
    │
    ├── Oda Kur (host) ──► Lobi (oda kodu paylaş)
    └── Oda Kodu Gir ──► Lobi
              │
              ▼ (min 2 oyuncu, host: Oyunu Başlat)
         Soru + ses çal
              │
              ▼ (ajan + yetenek seç → otomatik gönder)
         Yarışma (ilk doğru kazanır)
              │
              ▼
         Tur sonucu (3 sn) → sonraki soru veya final (10 tur)
```

### Skor kuralları

- **İlk tam doğru** (ajan + yetenek): **+220 puan**
- **Yanlış cevap:** **−30 puan** (tur başına bir kez)
- **Sadece ajan doğru, yetenek yanlış:** **0** (tam cevap şart)
- **Hiç cevap vermeme:** **0**
- **Kimse doğru cevap vermezse:** Tur `winner: null` ile kapanır, skor tablosu güncellenir

### Lobi ve bağlantı

- Min **2**, max **10** oyuncu
- Sadece host **Oyunu Başlat** görür
- Host ayrılırsa presence sırasındaki ilk oyuncu host olur (`host_changed` broadcast)
- Bağlantı kopan oyuncunun skoru sıfırlanmaz; yeniden katılırsa devam eder

### İlgili dosyalar

| Dosya | Rol |
|-------|-----|
| `src/pages/BattleRoom.jsx` | Giriş / lobi / oyun / final state machine |
| `src/hooks/useBattleRoom.js` | Oda bağlantısı, host arbitration, skor, tur geçişi |
| `src/lib/battleRoom.js` | Supabase kanal, oda CRUD, broadcast helper |
| `src/lib/battleQuestions.js` | Soru listesi, ajan seçenekleri, doğruluk kontrolü |
| `src/lib/roomCode.js` | 4 harfli okunabilir oda kodu |
| `src/components/battle/*` | Lobby, BattleQuestion, RoundResult, FinalScoreboard |
| `supabase/schema.sql` | `scores` + `rooms` tabloları |

### Supabase gereksinimleri

- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veya eski `PUBLISHABLE_KEY`)
- SQL Editor'de `supabase/schema.sql` çalıştırılmış olmalı
- Supabase yoksa ana sayfada KAPİŞMA butonu gri / devre dışı

---

🎮 Oyun Akışı (Tek oyuncu)
Anasayfa
   │
   ▼
Mod Seç ──────────────────────────────────────────┐
(Klasik / Zamanlı / Günlük)                       │
   │                                              │
   ▼                                              │
Ses Çal → [▶ Play butonu]                         │
   │                                              │
   ▼                                              ▼
Ajan Seç (grid)                          Leaderboard
   │
   ▼
Yetenek Seç (Q/E/C/X görselleriyle)
   │
   ├── ✅ Doğru → +puan, animasyon, sonraki soru
   └── ❌ Yanlış → cevap göster, -can veya devam
   
   10 Soru → Sonuç Ekranı → Paylaş / Tekrar

🎨 UI/UX Tasarım Rehberi
ElementDetayRenk paletiSiyah #0F1923, Kırmızı #FF4655, BeyazFontValorant'ın kendi fontu (VALORANT Font)Ajan kartlarıTam boy splash art, hover animasyonuSes dalgasıGörsel waveform animasyonu çalarkenFeedbackDoğruysa yeşil flash, yanlışsa kırmızı + sarsılma

📁 Klasör Yapısı
/valorant-quiz
├── /public
│   └── /sounds          ← yetenek sesleri (.mp3/.ogg)
├── /src
│   ├── /components
│   │   ├── AudioPlayer.jsx
│   │   ├── AgentGrid.jsx
│   │   ├── AbilitySelector.jsx
│   │   ├── ScoreBoard.jsx
│   │   └── ResultCard.jsx
│   ├── /data
│   │   └── abilities.json   ← ses dosyası + metadata eşleşmesi
│   ├── /hooks
│   │   └── useGameLogic.js
│   └── /pages
│       ├── Home.jsx
│       ├── Game.jsx
│       ├── BattleRoom.jsx      ← Kapışma modu
│       └── Leaderboard.jsx
│   ├── /components/battle
│   │   ├── Lobby.jsx
│   │   ├── BattleQuestion.jsx
│   │   ├── RoundResult.jsx
│   │   └── FinalScoreboard.jsx



