# Valorant Yetenek Sesi Tahmin Oyunu

Valorant ajan yetenek seslerini dinleyip hangi ajan ve hangi yetenek (Q/E/C/X) olduğunu tahmin ettiğiniz web oyunu.

## Özellikler

- **Klasik mod**: 10 soruluk tur
- **Zamanlı mod**: 60 saniye içinde mümkün olduğunca çok doğru
- **Günlük challenge**: Her gün aynı 10 soru (seed tabanlı)
- **Zorluk**: Kolay (4 ajan), Orta (8 ajan), Zor (tüm ajanlar)
- **İpuçları**: Rol, ajan baş harfi, yavaşlatılmış ses
- **Leaderboard**: Supabase veya localStorage fallback

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda: http://localhost:5173

## Supabase (opsiyonel)

1. Supabase instance hazırlayın (ör. `https://supabase-vlragent.fjorterminal.com`)
2. **SQL Editor** → [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını çalıştırın (`scores` + `rooms` tabloları)
3. `.env.example` → `.env` kopyalayın ve anahtarları doldurun:

```
NEXT_PUBLIC_SUPABASE_URL=https://supabase-vlragent.fjorterminal.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> `NEXT_PUBLIC_` öneki Vite'ta tanımlıdır. Eski `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ve `VITE_SUPABASE_*` isimleri de desteklenir.

Supabase yapılandırılmazsa skorlar otomatik olarak `localStorage`'a kaydedilir.

Kapışma modu Realtime **Broadcast** kullanır; `rooms` tablosunun Replication listesinde olması gerekmez.

Mevcut veritabanına yeniden bağlanma desteği eklemek için bir kez [`supabase/migration_room_sync.sql`](supabase/migration_room_sync.sql) çalıştırın.

## Ses Dosyaları

Sesler `AbilitySounds/` klasöründedir. Vite build/dev sırasında `/sounds/` altında servis edilir.

Dosya adı formatı: `{ajan}_{yetenek}.mp3` (örn. `jett_q.mp3`)

## Build

```bash
npm run build
npm run preview
```

## Coolify / VDS deploy

Docker ile yayınlamak için: **[COOLIFY.md](COOLIFY.md)** dosyasına bak.

Kısa özet: repoyu Git'e push et → Coolify'da **Dockerfile** build pack → port **80** → Supabase env'lerini **build time** olarak ekle → Deploy.

## Teknolojiler

- React + Vite
- Tailwind CSS
- Howler.js
- Framer Motion
- Supabase (opsiyonel)
- valorant-api.com (ajan görselleri)
