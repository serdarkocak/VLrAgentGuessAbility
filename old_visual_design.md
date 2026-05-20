# Valorant Ability Quiz — Görsel Tasarım ve Kod Rehberi

Bu belge sitenin görsel kimliğini, kullanılan teknolojileri ve stil kodlarının nerede tanımlandığını açıklar.

---

## 1. Genel yaklaşım

Tasarım, **Valorant oyun arayüzünü** referans alır:

- Koyu arka plan (`#0F1923`), kırmızı vurgu (`#FF4655`), açık metin (`#ECE8E1`)
- Keskin köşeler (`rounded-sm`), ince beyaz kenarlıklar (`border-white/10`)
- Büyük başlıklar, geniş harf aralığı (`tracking-widest`, `uppercase`)
- Mobil öncelikli, dar içerik sütunu (`max-w-2xl`)

**Teknoloji:**

| Katman | Dosya / paket |
|--------|----------------|
| CSS framework | [Tailwind CSS 3](https://tailwindcss.com) — `tailwind.config.js`, `src/index.css` |
| Animasyon | [Framer Motion](https://www.framer.com/motion/) — sayfa geçişleri, kartlar, ses çubukları |
| Yönlendirme | React Router — `src/App.jsx` |
| Fontlar | Google Fonts — `index.html` |

---

## 2. Renk paleti

Tüm özel renkler `tailwind.config.js` içinde `theme.extend.colors.valorant` altında tanımlıdır:

```6:13:tailwind.config.js
      colors: {
        valorant: {
          dark: '#0F1923',
          red: '#FF4655',
          gray: '#1C2B3A',
          light: '#ECE8E1',
        },
      },
```

| Token | Hex | Kullanım |
|-------|-----|----------|
| `valorant-dark` | `#0F1923` | Sayfa arka planı, kart içleri, header |
| `valorant-red` | `#FF4655` | CTA, seçili durum, skor vurgusu, hata |
| `valorant-gray` | `#1C2B3A` | Paneller, kart arka planı |
| `valorant-light` | `#ECE8E1` | Gövde metni (body) |

**Ek semantik renkler** (Tailwind varsayılanları, bileşenlerde doğrudan):

| Durum | Sınıflar |
|-------|----------|
| Doğru cevap | `green-400`, `green-500`, `shadow-glow-green` |
| Yanlış cevap | `valorant-red`, `red-900/60` overlay |
| İpucu | `yellow-300`, `yellow-500/30` border |
| Soluk metin | `text-white/40`, `text-white/50`, `text-white/60` |
| Kenarlık | `border-white/10`, `border-white/20` |

**Arka plan gradyanı** (`src/index.css`):

```10:17:src/index.css
  body {
    font-family: 'Rajdhani', 'Segoe UI', sans-serif;
    min-height: 100vh;
    background-color: #0f1923;
    background-image:
      radial-gradient(ellipse at 20% 0%, rgba(255, 70, 85, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(255, 70, 85, 0.05) 0%, transparent 50%);
  }
```

**Glow gölgeleri:**

```18:21:tailwind.config.js
      boxShadow: {
        glow: '0 0 20px rgba(255, 70, 85, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
      },
```

---

## 3. Tipografi

### Yüklenen fontlar (`index.html`)

```14:17:index.html
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
```

| Rol | Font | CSS sınıfı |
|-----|------|------------|
| Başlıklar, marka, skorlar | **Bebas Neue** | `.font-valorant` veya `h1, h2, h3` |
| Gövde, butonlar, formlar | **Rajdhani** | `body` (varsayılan) |

```19:25:src/index.css
  h1,
  h2,
  h3,
  .font-valorant {
    font-family: 'Bebas Neue', Impact, sans-serif;
    letter-spacing: 0.06em;
  }
```

> **Not:** `tailwind.config.js` içinde `fontFamily.valorant` olarak Tungsten tanımlıdır; pratikte sayfada **Bebas Neue** kullanılır. Yeni bileşenlerde `font-valorant` sınıfını kullanın.

### Tipografi ölçekleri (örnekler)

| Öğe | Örnek sınıflar |
|-----|----------------|
| Ana sayfa hero | `text-6xl sm:text-7xl` + `font-valorant` |
| Alt başlık (kırmızı) | `text-3xl sm:text-4xl text-valorant-red` |
| Bölüm etiketi | `text-xs uppercase tracking-widest text-white/40` |
| Skor (oyun) | `font-valorant text-2xl` |
| Oda kodu (battle) | `font-valorant text-5xl tracking-[0.3em]` |

---

## 4. Sayfa iskeleti (Layout)

`src/components/Layout.jsx` tüm rotaları sarar.

```
┌─────────────────────────────────────┐
│ HEADER (sticky, blur, max-w-2xl)    │
│  [V] ABILITY QUIZ    TR|EN  Liderlik│
├─────────────────────────────────────┤
│ MAIN (flex-1, px-4 py-6, max-w-2xl) │
│   {children}                        │
├─────────────────────────────────────┤
│ FOOTER (oyun dışı sayfalarda)       │
└─────────────────────────────────────┘
```

**Header kodu:**

```12:44:src/components/Layout.jsx
      <header className="sticky top-0 z-40 border-b border-white/8 bg-valorant-dark/95 backdrop-blur-md">
        <motion.div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          ...
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
```

- Logo: kırmızı kare içinde **V** (`h-8 w-8 bg-valorant-red`)
- Oyun sayfasında (`/play`) footer gizlenir; nav’da “Çık” linki gösterilir

---

## 5. Yeniden kullanılabilir CSS bileşenleri

`src/index.css` içindeki `@layer components` — projede en çok tekrar eden stiller:

### `.btn-primary`

Kırmızı dolu buton; hover’da şeffaf arka plan + glow.

```29:31:src/index.css
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-sm border-2 border-valorant-red bg-valorant-red px-6 py-3 font-semibold uppercase tracking-widest text-white transition hover:bg-transparent hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-valorant-red focus:ring-offset-2 focus:ring-offset-valorant-dark disabled:cursor-not-allowed disabled:opacity-50;
  }
```

### `.btn-secondary`

Şeffaf kenarlıklı ikincil buton.

### `.card-panel`

Cam efekti panel: yarı saydam gri + blur + ince border.

```37:39:src/index.css
  .card-panel {
    @apply rounded-sm border border-white/10 bg-valorant-gray/60 backdrop-blur-sm;
  }
```

### `.agent-card`

Kare ajan portresi; seçili/hover durumları.

```42:52:src/index.css
  .agent-card {
    @apply relative aspect-square overflow-hidden rounded-sm border-2 border-white/10 transition-all duration-150;
  }
  .agent-card.selected { ... }
  .agent-card:not(.selected):not(:disabled):hover { ... }
```

### `.slot-btn`

C / Q / E / X yetenek düğmeleri (88px min yükseklik).

```55:64:src/index.css
  .slot-btn { ... }
  .slot-btn.selected { ... }
```

---

## 6. Animasyonlar

### Tailwind keyframes (`tailwind.config.js`)

| Animasyon | Amaç |
|-----------|------|
| `animate-waveform` | Ses çubuğu (tanımlı, AudioPlayer Framer kullanıyor) |
| `animate-shake` | Yanlış cevap sarsıntısı (isteğe bağlı) |
| `animate-flash-green` / `animate-flash-red` | Kısa arka plan flaşı |

### Framer Motion kullanımı

| Bileşen | Efekt |
|---------|--------|
| `Home.jsx` | Sayfa `opacity` + `y`; başlık `scale`; buton `whileHover` / `whileTap` |
| `Game.jsx` | Ana layout fade-in; talimat metni `AnimatePresence` |
| `AgentGrid` | Kart `whileTap`, seçim halkası `layoutId="agent-ring"` |
| `AudioPlayer` | Oynatma halkası pulse; çubuk yüksekliği döngüsü |
| `ResultCard` | Tam ekran overlay, spring scale, alt çizgi geri sayım |
| `ScoreBoard` | Skor artışında `scale` + renk flaşı |
| `Leaderboard` | Tablo satırları sıralı fade-in |

---

## 7. Sayfa ve bileşen rehberi

### 7.1 Ana sayfa — `src/pages/Home.jsx`

- Hero: iki satır başlık (beyaz + kırmızı)
- Mod ve zorluk: `grid-cols-3`, seçili kartta `border-valorant-red shadow-glow`
- Ana CTA: `btn-primary w-full py-4 text-xl`
- Kapışma: özel border stili (`border-valorant-red/60`), Supabase yoksa soluk/disabled

### 7.2 Oyun — `src/pages/Game.jsx`

Dikey akış (`flex flex-col gap-4`):

1. **ScoreBoard** — mod etiketi, skor, soru sayacı, canlar (♥)
2. **CountdownBar** — sadece timed modda; son 10 sn kırmızı
3. **card-panel** — AudioPlayer + HintPanel
4. Talimat metni (dinle / seç)
5. **AgentGrid**
6. **AbilitySelector**

Yükleme: kırmızı dönen spinner (`border-valorant-red border-t-transparent`).

### 7.3 Ses oynatıcı — `src/components/AudioPlayer.jsx`

- Yuvarlak play butonu: `h-14 w-14`, kırmızı border, oynarken genişleyen halka animasyonu
- 20 adet `motion.span` çubuk — `bg-valorant-red/80`, `isPlaying` ile sinüs yüksekliği

### 7.4 Ajan ızgarası — `src/components/AgentGrid.jsx`

- Portre: `object-cover object-top`, altta gradient + isim
- Grid sütun sayısı oyuncu sayısına göre dinamik (`grid-cols-4` … `lg:grid-cols-7`)
- ≥10 ajan: arama kutusu (`border-white/20`, focus `border-valorant-red`)
- Doğru: yeşil border + `shadow-glow-green`; yanlış: kırmızı border + opacity

### 7.5 Yetenek seçici — `src/components/AbilitySelector.jsx`

- 4 sütun grid (`grid-cols-4 gap-2`)
- İkon yoksa **GenericSlotIcon** SVG (slot renkleri: C yeşil, Q mavi, E sarı, X kırmızı)
- Seçili slot köşe rozeti: `bg-valorant-red`
- Ajan seçilince `getAgentAbilityIcons` ile API veya `manualAgentAssets` ikonları yüklenir

### 7.6 Sonuç overlay — `src/components/ResultCard.jsx`

- `fixed inset-0 z-50`
- Arka plan: doğru → `bg-green-900/50`, yanlış → `bg-red-900/60`
- Kart üst şerit: `h-1.5` yeşil veya kırmızı
- Otomatik ilerleme çizgisi (alt `width` animasyonu)

### 7.7 Skor tablosu — `src/pages/Leaderboard.jsx`

- `card-panel` içinde HTML tablo
- Başlık satırı: `bg-white/5`, `uppercase tracking-widest`
- Sıra numarası: `font-valorant text-valorant-red`

### 7.8 Oyun sonu — `src/pages/Result.jsx`

- Büyük skor: `font-valorant text-6xl text-valorant-red`
- Nickname formu + `btn-primary` kaydet
- Geçmiş listesi + **ShareCard** (paylaşım görseli)

### 7.9 Kapışma (Battle) — `src/pages/BattleRoom.jsx`

Aynı tasarım dili; fazlara göre alt bileşenler:

| Faz | Bileşen | Görsel not |
|-----|---------|------------|
| Giriş | `BattleRoom` entry | `max-w-md`, nickname input |
| Lobi | `Lobby.jsx` | Büyük oda kodu, oyuncu listesi |
| Oyun | `BattleQuestion.jsx` | Game ile aynı grid + skor şeridi |
| Tur sonu | `RoundResult.jsx` | Modal, kazanan yeşil |
| Final | `FinalScoreboard.jsx` | Sıralı liste, 1. yeşil |

---

## 8. Dil değiştirici

`src/components/LanguageSwitcher.jsx`:

- Segmented control: `border-white/15`, aktif dil `bg-valorant-red`
- TR / EN — metinler `src/i18n/translations.js` üzerinden gelir (stil değil, içerik)

---

## 9. Favicon ve marka

`public/favicon.svg`:

- Arka plan `#0F1923`, üçgen `#FF4655` (Valorant benzeri keskin form)

---

## 10. Görseller (ajan / yetenek)

| Kaynak | Yol |
|--------|-----|
| valorant-api.com | Çoğu ajan portresi ve yetenek ikonu (`src/lib/valorantApi.js`) |
| Manuel (Miks, Veto) | `public/agents/{miks,veto}/` — `src/data/manualAgentAssets.js` |

Ajan kartlarında görseller lazy-load (`loading="lazy"`).

---

## 11. Responsive davranış

| Breakpoint | Davranış |
|------------|----------|
| Varsayılan | Tek sütun, `px-4`, `max-w-2xl` merkez |
| `sm:` | Daha büyük hero, tablo tarih sütunu, grid 6 sütun |
| `md:` / `lg:` | AgentGrid 6–7 sütun (hard mod) |

Oyun ve battle **mobil öncelikli** tasarlanmıştır; geniş ekranda da içerik 672px (`max-w-2xl`) ile sınırlı kalır.

---

## 12. Dosya haritası (tasarım ile ilgili)

```
index.html              → font linkleri, body sınıfları
tailwind.config.js      → renkler, font aileleri, animasyonlar, glow
src/index.css           → global body, btn/card/agent/slot sınıfları
src/components/
  Layout.jsx            → header / main / footer
  LanguageSwitcher.jsx
  AudioPlayer.jsx
  AgentGrid.jsx
  AbilitySelector.jsx
  ScoreBoard.jsx
  CountdownBar.jsx
  HintPanel.jsx
  ResultCard.jsx
  ShareCard.jsx
  battle/               → Lobby, BattleQuestion, RoundResult, FinalScoreboard
src/pages/
  Home.jsx              → mod seçimi, hero
  Game.jsx              → ana oyun düzeni
  Result.jsx            → skor özeti
  Leaderboard.jsx
  BattleRoom.jsx
public/
  favicon.svg
  agents/miks|veto/     → manuel görseller
```

---

## 13. Yeni UI eklerken öneriler

1. Renk için önce `valorant-*` token’larını kullanın; yeni hex eklemeyin.
2. Paneller için `.card-panel`, aksiyonlar için `.btn-primary` / `.btn-secondary`.
3. Başlık ve skorlar için `font-valorant`; açıklama için varsayılan Rajdhani.
4. Köşeler: `rounded-sm` (oyun UI’sı keskin tutar).
5. Seçili / aktif durum: `border-valorant-red` + `shadow-glow`.
6. Hareket için Framer Motion; basit hover için Tailwind `transition`.
7. Metin solukluğu: `text-white/40` (etiket), `text-white/60` (ikincil).

---

## 14. Bağımlılıklar (tasarım)

```json
"framer-motion": "^11.18.2",
"tailwindcss": "^3.4.17"
```

Build: Vite + PostCSS + Autoprefixer. Ses dosyaları tasarıma dahil değildir; `AbilitySounds/` → `/sounds/` olarak kopyalanır.
