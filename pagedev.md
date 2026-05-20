# Cloudflare Pages — `pages.dev` ve Vite hatası

## Coolify gerekli mi?

**Hayır.** `pages.dev` adresi için siteyi **Cloudflare Dashboard → Pages → Git ile bağlamanız** yeterli. Bu yolda **Coolify’da hiçbir işlem yapmanız gerekmez**; Coolify bu yayınla ilgili değildir.

Önceki metinde “Coolify” geçmesinin sebebi: Bazı kullanıcılar aynı hatayı **Coolify üzerinden Wrangler** tetikleyen bir formda da görebiliyor. Siz sadece Cloudflare kullanıyorsanız Coolify’ı tamamen yok sayabilirsiniz.

---

## Aldığınız hata

```text
✘ [ERROR] The version of Vite used in the project ("5.4.21") cannot be automatically configured.
Please update the Vite version to at least "6.0.0" and try again.
```

**Neden:** `npx wrangler deploy` komutu projeyi **Cloudflare Worker** (Vite Workers entegrasyonu) olarak yayınlamaya çalışır; Wrangler 4 burada **Vite 6+** ister. Bu repo **Vite 5** + statik `dist` (SPA).

**Çözüm:** Statik site için **`wrangler pages deploy dist`** kullanın (veya aşağıdaki “sadece Dashboard” yolu — orada Wrangler komutu hiç girmezsiniz).

---

## En basit yol (Coolify yok)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Pages** → **Create a project** → **Connect to Git**.
2. Repo + branch seçin.
3. **Build command:** `npm run build`  
   **Build output directory:** `dist`
4. **Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (gerekirse `VITE_CONTACT_EMAIL`).
5. **Save and Deploy** → size **`https://<proje>.pages.dev`** verilir.

Bu akışta **Deploy command / Wrangler / Coolify** yoktur.

---

## Wrangler kullanıyorsanız (CI veya başka panel)

Bir yerde “Deploy command” olarak **`npx wrangler deploy`** yazdıysanız aynı hatayı alırsınız. Şunu kullanın (`--project-name` = Cloudflare’deki Pages proje adınız):

```bash
npx wrangler pages deploy dist --project-name=vlragentguessability
```

**Kullanmayın (bu repo için):**

```bash
npx wrangler deploy
npx wrangler versions upload
```

**API token:** Cloudflare **Account → API Tokens**; Pages upload için uygun izinler (ör. **Cloudflare Pages — Edit**).

---

## Özet

| Soru | Cevap |
|------|--------|
| Coolify’da işlem şart mı? | **Hayır** — sadece Cloudflare Pages + Git kullanıyorsanız. |
| Hata neden oldu? | `wrangler deploy` Worker yolu; Vite 6 istiyor. |
| Ne yapmalıyım? | Dashboard’dan Git ile deploy **veya** `wrangler pages deploy dist`. |

Build log’unuzda `npm run build` başarılıydı; sorun yalnızca **yanlış deploy komutuydu**.
