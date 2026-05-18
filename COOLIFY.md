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

### 3. Ortam değişkenleri (önemli)

Vite değişkenleri **build sırasında** koda gömülür. Coolify'da:

**Project → Application → Environment Variables**

| Değişken | Örnek | Build time? |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Evet |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Evet |

Coolify sürümüne göre:

- **"Available at Buildtime"** / **Build Variable** kutusunu işaretle, veya
- **Build Arguments** bölümüne aynı değişkenleri ekle

Supabase kullanmıyorsan bu iki değişkeni boş bırakabilirsin; skorlar yalnızca tarayıcıda (localStorage) saklanır.

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
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx \
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
