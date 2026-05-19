# Coolify ile Yayınlama (VDS)

Bu proje **Dockerfile** ile statik build alır ve **nginx** üzerinden servis eder (port **80**).

## Ön koşullar

1. Proje bir **Git** deposunda olmalı (GitHub / GitLab / Gitea).
2. `AbilitySounds/` klasörü repoda olmalı (sesler build'e dahil edilir).
3. Coolify, VDS üzerinde kurulu ve erişilebilir olmalı.
4. (Opsiyonel) Supabase tablosu ve RLS policy'leri hazır olmalı — bkz. [README.md](README.md).

## Adım adım — Coolify

### 1. Kodu Git'e push et

```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/KULLANICI/repo.git
git push -u origin main
```

> `.env` dosyasını **asla** commit etme (`.gitignore`'da zaten var).

### 2. Coolify'da yeni uygulama

1. Coolify panel → **+ New Resource** → **Application**
2. **Git Repository** seç, repoyu bağla
3. Branch: `main` (veya kullandığın branch)
4. **Build Pack**: **Dockerfile** (Nixpacks değil)
5. **Dockerfile location**: `/Dockerfile` (kök dizin)
6. **Port**: `80` (Expose / Ports bölümünde container port **80**)

### 3. Ortam değişkenleri (önemli — Supabase için zorunlu)

Vite değişkenleri **build sırasında** Docker image içine gömülür. Coolify'da sadece "Runtime" env verirsen **çalışmaz**; "Supabase yapılandırılmadı" görürsün.

**Application → Environment Variables** — her ikisi için **✓ Available at Buildtime** (veya "Is Build Variable") işaretle:

| Değişken | Değer |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://supabase-vlragent.fjorterminal.com` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT anon key (Supabase → Settings → API) |

Env ekledikten veya değiştirdikten sonra mutlaka **Redeploy** (yeniden build) yap.

**Not:** Site `http://` ile açılıyorsa skorlar yine localStorage'a düşer (Supabase yoksa); `crypto.randomUUID` hatası kodda düzeltildi. Global leaderboard için HTTPS + build-time env gerekir.

**HTTPS önerisi:** Coolify'da domain'e SSL aç (`https://quiz.fjorterminal.com`). Hem Supabase hem mobil tarayıcılar için daha sağlıklı.

### 4. Domain (opsiyonel)

1. **Domains** → domain ekle (örn. `quiz.senin-domain.com`)
2. DNS'te A kaydı → VDS IP
3. Coolify otomatik **Let's Encrypt** SSL verebilir

### 5. Deploy

**Deploy** butonuna bas. İlk build 2–5 dakika sürebilir (113 ses dosyası + npm install).

Loglarda şunu görmelisin:

```
✓ built in ...
[vite-plugin-static-copy] Copied 113 items.
```

### 6. Kontrol

- Ana sayfa açılıyor mu?
- Oyun başlıyor mu, ses çalıyor mu? (`/sounds/*.mp3`)
- Skor kaydı / leaderboard (Supabase ayarlıysa)

---

## Sık karşılaşılan sorunlar

### Sesler çalmıyor

- Build log'da `Copied 113 items` var mı kontrol et.
- `AbilitySounds/` repoda mı?

### Supabase çalışmıyor

- Env değişkenleri **build time** olarak ayarlı mı?
- Deploy sonrası env değiştirdiysen **yeniden deploy** et (Vite embed eder).
- Supabase → Authentication → URL allow list'e domain'i ekle (gerekirse).

### 404 — sayfa yenileyince

`nginx.conf` SPA fallback içerir; Dockerfile kullanıldığından emin ol.

### Build çok yavaş / disk dolu

- `.dockerignore` `node_modules` hariç tutar.
- Coolify'da eski image'ları temizle.

---

## Manuel Docker test (VDS'te)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://supabase-vlragent.fjorterminal.com \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  -t valorant-quiz .

docker run -p 8080:80 valorant-quiz
# http://VDS-IP:8080
```

---

## Özet

| Ayar | Değer |
|------|--------|
| Build Pack | Dockerfile |
| Port | 80 |
| Build env | `NEXT_PUBLIC_SUPABASE_*` |
| Sesler | `AbilitySounds/` → build → `/sounds/` |
