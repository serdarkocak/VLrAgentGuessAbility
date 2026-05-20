# Ability Quiz — Görsel Tasarım Rehberi (Valorant × Glassmorphism)

Bu belge sitenin görsel kimliğini, kullanılan teknolojileri ve stil kodlarının nerede tanımlandığını açıklar.

> **Tema:** **Valorant kimliği × Glassmorphism**. Koyu navy zemin (`#0F1923`) üzerinde Valorant kırmızısı (`#FF4655`) ana vurgu, mavi→mor gradient (`V` logosu) destek vurgusu. Buzlu cam paneller, yüzen geometrik şekiller, neon glow.

---

## 1. Genel yaklaşım

- Valorant navy arka plan (`#0a1420` → `#0F1923`)
- Radial gradient ışıkları: kırmızı + mor + mavi (Valorant `red` + V logo gradient renkleri)
- Yarı saydam paneller: `bg-white/[0.04]` + `backdrop-blur-xl` + ince beyaz iç parıltı
- Başlıklar beyaz; vurgu **Valorant kırmızısı** `#FF4655` (text-shadow ile glow)
- Logo: stilize **V** işareti — mavi→mor gradient (Valorant V logosundan esinli)
- Butonlar: kırmızı gradient + glow (`btn-primary`, slanted clip-path) veya tam cam (`btn-secondary`)
- Sayfa arkasında animasyonlu floating shapes (kare, halka, üçgen, kırmızı/mor noktalar) + ince grid + vignette

**Teknoloji:**

| Katman | Dosya / paket |
|--------|----------------|
| CSS framework | [Tailwind CSS 3](https://tailwindcss.com) — `tailwind.config.js`, `src/index.css` |
| Animasyon | [Framer Motion](https://www.framer.com/motion/) — kartlar, geçişler |
| Yüzen şekiller | CSS keyframes (`animate-float-*`, `animate-pulse-glow`) |
| Fontlar | Google Fonts — Bebas Neue + Rajdhani |
| Yönlendirme | React Router |

---

## 2. Renk paleti

`tailwind.config.js`:

```6:20:tailwind.config.js
      colors: {
        valorant: {
          dark: '#0a0a1f',
          red: '#ff3d8b',
          gray: '#1a1840',
          light: '#f0f0fb',
        },
        neon: {
          pink: '#ff3d8b',
          magenta: '#f72585',
          purple: '#a855f7',
          violet: '#7c3aed',
          cyan: '#22d3ee',
        },
      },
```

> Mevcut `valorant-*` token isimleri **korunmuş** ama renkleri yeni temaya göre yeniden tanımlanmıştır. Böylece tüm eski bileşenler düzenlemeye gerek kalmadan yeni görünüme döner.

| Token | Hex | Kullanım |
|-------|-----|----------|
| `valorant-dark` | `#0F1923` | Valorant resmi koyu zemin, header arkası |
| `valorant-navy` | `#0a1420` | Sayfa zemini taban tonu |
| `valorant-red` | `#FF4655` | **Valorant kırmızısı** — primary buton, seçili durum, vurgu |
| `valorant-gray` | `#1F2731` | Koyu derinlik tonu |
| `valorant-light` | `#ECE8E1` | Açık metin (Valorant ivory) |
| `neon-blue` | `#6da4ff` | V logo üst gradient, ikincil vurgu |
| `neon-purple` | `#a855f7` | V logo orta gradient, Battle butonu |
| `neon-violet` | `#7c3aed` | V logo gölgesi |
| `neon-pink` | `#ff3d8b` | Opsiyonel ek vurgu (kullanılırsa) |

**Arka plan gradyanı** (`src/index.css`):

```10:22:src/index.css
  body {
    font-family: 'Rajdhani', 'Segoe UI', sans-serif;
    min-height: 100vh;
    color: #ECE8E1;
    background-color: #0a1420;
    background-image:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255, 70, 85, 0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 30%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 0% 100%, rgba(109, 164, 255, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255, 70, 85, 0.14) 0%, transparent 55%),
      linear-gradient(180deg, #0a1420 0%, #0F1923 50%, #0c1422 100%);
    background-attachment: fixed;
  }
```

**Gölgeler ve glowlar** (`tailwind.config.js`):

| Token | Etki |
|-------|------|
| `shadow-glow` | Valorant kırmızısı parıltı (CTA, seçili kart) |
| `shadow-glow-soft` | Daha hafif kırmızı glow |
| `shadow-glow-strong` | Buton hover için güçlü kırmızı glow |
| `shadow-glow-purple` | Mor glow (Battle butonu) |
| `shadow-glow-blue` | Mavi glow (logo hover) |
| `shadow-glow-green` | Yeşil (doğru cevap) |
| `shadow-glass` | Panel altı + iç parıltı |

---

## 3. Tipografi

| Rol | Font | CSS |
|-----|------|------|
| Başlıklar, marka, skor | **Bebas Neue** | `.font-valorant`, `h1/h2/h3` |
| Gövde, butonlar | **Rajdhani** | `body` |

Google Fonts `index.html` üzerinden yüklenir.

**Yardımcı text utility’leri:**

```css
.text-glow-red    /* Valorant kırmızısı + glow — başlık vurguları */
.text-glow-white  /* beyaz başlığa hafif glow */
.text-neon-pink   /* opsiyonel pembe vurgu */
```

---

## 4. Cam (glass) primitifleri

`src/index.css` içinde `@layer components`:

### `.glass` / `.glass-strong`

Genel amaçlı buzlu cam yüzey.

```37:50:src/index.css
  .glass {
    @apply border border-white/10 bg-white/[0.04] backdrop-blur-xl;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
```

### `.card-panel` / `.card-panel-glow`

Sayfalardaki kartlar için. `card-panel-glow`, neon pembe halo ekler — hero kartında kullanılır.

### `.btn-primary`

Valorant kırmızısı gradient + glow + `clip-path` ile köşeli (slanted) form.

```55:66:src/index.css
  .btn-primary {
    @apply relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm
           border border-valorant-red/40 bg-gradient-to-b from-valorant-red to-[#c92e3c]
           px-6 py-3 font-semibold uppercase tracking-widest text-white
           shadow-glow transition
           hover:scale-[1.02] hover:shadow-glow-strong
           ...;
    clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  }
```

> `clip-path` ile butonun sol-üst ve sağ-alt köşeleri kesilir — Valorant arayüzündeki paralelkenar buton hissi.

### `.btn-secondary`

Tamamen şeffaf cam.

### `.agent-card` / `.slot-btn`

Aynı cam yaklaşımı; seçili durum neon pembe border + glow.

---

## 5. V Logo — `VLogo.jsx`

`src/components/VLogo.jsx` — Valorant V işaretinden esinli, mavi→mor gradient ve glow filtreli yeniden kullanılabilir SVG bileşeni.

```jsx
<VLogo size={26} />            // header için
<VLogo size={64} glow={false} />  // büyük, glow olmadan
```

- Sol blade: uzun parallelogram, sağa eğimli
- Sağ blade: kısa parallelogram, sol eğimli
- Gradient: `#9ec3ff → #a855f7 → #c45cff`
- `drop-shadow` filtre ile mor + mavi glow (opsiyonel)

Aynı tasarım `public/favicon.svg`'de de kullanılır.

---

## 6. Arka plan — `BackgroundShapes.jsx`

`src/components/BackgroundShapes.jsx` — sabit konumda, `-z-10`, `pointer-events-none`. İçerik:

- **4 büyük soft renk blobu** — kırmızı, mor, mavi, kırmızı (Valorant + V logo paleti) — `blur-3xl`
- **Sol/sağ yüzen şekiller** — kareler, halkalar, üçgenler (CSS `clip-path`)
- **Animasyonlar** — `animate-float-slow|medium|fast`, `animate-pulse-glow`
- **Küçük neon noktalar** — kırmızı/mor/mavi ışık benekleri
- **İnce grid overlay** — `opacity-[0.045]`, teknoloji hissi
- **Vignette** — radyal koyulaşma kenarlarda

Şekillerin tümü pure CSS — performans dostu, JS yok.

---

## 7. Sayfa iskeleti

`src/components/Layout.jsx`:

```
<BackgroundShapes />           ← fixed, -z-10
<div min-h-screen>
  <header sticky pt-3>
    <div glass max-w-2xl>      ← floating glass pill
      [VLogo] ABILITY QUIZ       nav (dil + leaderboard / exit)
    </div>
  </header>

  <main max-w-2xl px-4 py-8>{children}</main>

  <footer>
    <div card-panel>             ← Riot disclaimer + privacy linki
      ...
    </div>
  </footer>
</div>
```

- Header artık “bar değil” — sticky **floating glass pill**
- Logo: koyu Valorant kutu (`bg-valorant-dark/80`) içinde `<VLogo>` + “ABILITY **QUIZ**” (QUIZ kelimesi kırmızı)

---

## 8. Ana sayfa (`Home.jsx`) bileşenleri

| Bölüm | Stil notu |
|-------|-----------|
| **Hero** | `card-panel-glow`, üstte kırmızı + mor blur halolar, başlık beyaz + text-glow-white, alt başlık `.text-glow-red` |
| **Mode kartları** | `grid-cols-3`, glass border; aktif: kırmızı border + glow + üst kırmızı çizgi |
| **Difficulty kartları** | Aynı stil; ikon aktifken kırmızı |
| **OYNA** | `.btn-primary` — kırmızı gradient + glow + slanted clip-path |
| **KAPIŞMA** | Glass + mor border, hover’da mor glow |
| **Sıralama linki** | Alt çizgili, hover’da kırmızı |

Modlar ve zorluklar için unicode glyph’ler kullanıldı (▶ yerine `◆ ◷ ◉ ✓ ◧ ◈`) — daha geometrik bir his veriyor.

---

## 8. Oyun ekranı (`Game.jsx`)

Bileşenler doğrudan ortak cam primitifleri (`card-panel`, `agent-card`, `slot-btn`) kullandığı için ana CSS değişiklikleriyle birlikte otomatik olarak yeni temaya döner:

- **ScoreBoard** — saydam, skor animasyonu neon pembe
- **AudioPlayer** — pembe glow halkası, çubuklar
- **AgentGrid** — kare cam kartlar, seçili: pembe border + glow
- **AbilitySelector** — slot butonları, seçili: pembe glow
- **ResultCard** — koyu cam overlay, doğru/yanlış renkleri (yeşil/pembe)

---

## 9. Battle (Kapışma) sayfaları

`src/pages/BattleRoom.jsx` + `src/components/battle/*` — aynı primitifleri kullanır:

- **Lobby** — büyük oda kodu pembe glow ile; oyuncu kartları glass
- **BattleQuestion** — Game ekranıyla aynı layout
- **RoundResult** — koyu glass modal
- **FinalScoreboard** — sıralama, 1. yeşil

---

## 10. Animasyonlar

### Tailwind keyframes

| Animasyon | Süre | Amaç |
|-----------|------|------|
| `animate-float-slow` | 18s | Büyük yüzen şekiller |
| `animate-float-medium` | 12s | Orta yüzen şekiller |
| `animate-float-fast` | 8s | Küçük üçgenler |
| `animate-pulse-glow` | 3s | Neon halka nabız |
| `animate-waveform` | 1s | Ses çubukları |
| `animate-shake` | 0.4s | Yanlış cevap |

### Framer Motion (örnek)

- **Home hero** — `scale: 0.96 → 1` + başlık `y: 12 → 0`
- **Mod/zorluk kartları** — `whileHover={{ y: -2 }}`, `whileTap={{ scale: 0.97 }}`
- **CTA** — `whileHover={{ scale: 1.02 }}`

---

## 12. Dosya haritası

```
index.html
tailwind.config.js          → renkler, gölgeler, animasyonlar
src/index.css               → global body, glass primitives, btn, card, agent, slot
src/components/
  Layout.jsx                → glass header + footer + BackgroundShapes mount
  BackgroundShapes.jsx      → yüzen şekiller (yeni)
  VLogo.jsx                 → V işareti (yeni)
  LanguageSwitcher.jsx      → cam segmented control
  RiotDisclaimer.jsx
  AudioPlayer.jsx
  AgentGrid.jsx
  AbilitySelector.jsx
  ScoreBoard.jsx
  CountdownBar.jsx
  HintPanel.jsx
  ResultCard.jsx
  battle/                   → Lobby, BattleQuestion, RoundResult, FinalScoreboard
src/pages/
  Home.jsx                  → hero glass + mod/zorluk cam kartlar
  Game.jsx
  Result.jsx
  Leaderboard.jsx
  BattleRoom.jsx
  Privacy.jsx
public/
  favicon.svg               → V logo (mavi → mor gradient, koyu Valorant zemin)
```

---

## 13. Yeni UI eklerken kurallar

1. **Renkleri token üzerinden kullanın** (`valorant-red` = `#FF4655`, `neon-purple`, `neon-blue`).
2. **Yüzey:** her panel `card-panel` veya `glass` + `rounded-2xl`.
3. **Border:** ince beyaz — `border-white/10` (varsayılan), aktif: `border-valorant-red` / `border-neon-purple`.
4. **Glow:** seçili / önemli öğelere `shadow-glow` (kırmızı) veya `shadow-glow-purple`.
5. **Yuvarlatma:** `rounded-2xl` (panel), `rounded-xl` (küçük), `rounded-sm` (primary buton köşeli), `rounded-full` (yuvarlak).
6. **Backdrop:** `backdrop-blur-xl` her cam yüzeyde.
7. **Tipografi:** başlık `font-valorant`, vurgu `.text-glow-red`.
8. **Logo:** marka göstermek için `<VLogo />` (ek bir simge eklemeyin).
9. **Hover:** transparan yüzeyleri `hover:bg-white/[0.08]` ile aydınlatın; CTA’lar `whileHover={{ scale: 1.02 }}`.
10. **Köşeli buton hissi:** Primary CTA `clip-path` ile slant alıyor — taklit etmek için aynı clip-path’i kullanın.

---

## 14. İleride sidebar reklam alanı

Mevcut layout (`max-w-2xl` orta sütun) korunarak, ekran ≥ `xl` olduğunda iki yan sütun ayrılacak şekilde genişletilebilir. Önerilen yapı:

```jsx
<div className="grid xl:grid-cols-[300px_minmax(0,672px)_300px]">
  <aside className="hidden xl:block">{/* reklam glass kartı */}</aside>
  <main>{children}</main>
  <aside className="hidden xl:block">{/* reklam glass kartı */}</aside>
</div>
```

Reklam kartları `glass` veya `card-panel` ile sarılarak tema bozulmadan eklenebilir. (Reklam yerleşimini istediğinizde uygulayabiliriz.)

---

## 15. Bağımlılıklar

```json
"framer-motion": "^11.18.2",
"tailwindcss": "^3.4.17"
```

Build: Vite + PostCSS + Autoprefixer.
