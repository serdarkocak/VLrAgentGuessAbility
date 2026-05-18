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
Ses dosyaları — oyun içi ses dosyaları extract edilerek kendi storage'ına yüklenmeli (Cloudflare R2 veya Supabase Storage)
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

🎮 Oyun Akışı
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
│       └── Leaderboard.jsx

⚠️ Kritik Notlar

Ses dosyaları: Valorant ses dosyaları Riot Games'e aittir. Projeyi ticari olmayan / fan projesi olarak geliştirip, gerekirse Riot'un fan content policy'sine uygun şekilde yayımlamalısın.


valorant-api.com ajan görselleri ve ability metadata için mükemmel — ses dosyaları orada yok, onları ayrıca temin etmen gerekecek.


🚀 Başlangıç Önerisi
En hızlı MVP için şu sırayı öneririm:

valorant-api.com'dan ajan + yetenek verilerini çek
10-15 yetenek sesi temin et, /public/sounds'a koy
abilities.json ile ses ↔ ajan/yetenek eşleştir
Temel oyun döngüsünü kur (ses çal → seç → puanla)
Tasarımı Valorant temasıyla güzelleştir