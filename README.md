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

1. [Supabase](https://supabase.com) projesi oluşturun
2. SQL Editor'de şu tabloyu çalıştırın:

```sql
create table scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  mode text not null,
  difficulty text not null,
  score int not null,
  correct int not null,
  total int not null,
  created_at timestamptz default now()
);

alter table scores enable row level security;

create policy "Allow public read" on scores for select using (true);
create policy "Allow public insert" on scores for insert with check (true);
```

3. `.env.example` dosyasını `.env` olarak kopyalayın (veya proje kökündeki `.env` dosyasını düzenleyin):

```
NEXT_PUBLIC_SUPABASE_URL=https://bzrdvlbplvwyiuiakynx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> Bu proje Vite kullanır; `NEXT_PUBLIC_` öneki `vite.config.js` içinde tanımlıdır. Eski `VITE_SUPABASE_*` isimleri de desteklenir.

Supabase yapılandırılmazsa skorlar otomatik olarak `localStorage`'a kaydedilir.

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
