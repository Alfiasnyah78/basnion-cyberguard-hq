# ▲ Basnion — Deploy ke Vercel

Panduan deploy Basnion (TanStack Start) ke **Vercel**.

---

## 1. Persiapan

- Akun Vercel: https://vercel.com/signup
- Vercel CLI (opsional): `npm i -g vercel`
- Repository Git (GitHub / GitLab / Bitbucket)
- Kredensial Supabase (Lovable Cloud) — lihat `.env`

---

## 2. Push project ke Git

```bash
git init
git add .
git commit -m "init: basnion website"
git branch -M main
git remote add origin https://github.com/USERNAME/basnion-web.git
git push -u origin main
```

> Pastikan `.env` **tidak ikut commit** (sudah ada di `.gitignore`).

---

## 3. Import ke Vercel (Dashboard)

1. Buka https://vercel.com/new
2. **Import Git Repository** → pilih repo Basnion.
3. **Framework Preset** → biarkan otomatis (Vercel mendeteksi TanStack Start / Vite).
4. **Build & Output Settings**:
   - Build Command  : `bun run build` (atau `npm run build`)
   - Output Directory: `.output/public` (auto-detect)
   - Install Command: `bun install` (atau `npm install`)
5. **Environment Variables** → tambahkan:

   | Key                                | Value                                       |
   | ---------------------------------- | ------------------------------------------- |
   | `VITE_SUPABASE_URL`                | (dari `.env`)                               |
   | `VITE_SUPABASE_PUBLISHABLE_KEY`    | (dari `.env`)                               |
   | `VITE_SUPABASE_PROJECT_ID`         | (dari `.env`)                               |
   | `SUPABASE_URL`                     | sama dengan `VITE_SUPABASE_URL`             |
   | `SUPABASE_PUBLISHABLE_KEY`         | sama dengan `VITE_SUPABASE_PUBLISHABLE_KEY` |
   | `SUPABASE_SERVICE_ROLE_KEY`        | service role key (server-side only)         |

6. Klik **Deploy**. Tunggu 1–3 menit.
7. Selesai → buka URL `https://<project>.vercel.app`.

---

## 4. Deploy via CLI

```bash
vercel login
vercel link          # ikat folder ke project Vercel
vercel env add VITE_SUPABASE_URL
# ulangi untuk semua env vars di atas
vercel --prod        # deploy production
```

Preview deploy (otomatis tiap branch):
```bash
vercel
```

---

## 5. Custom domain

1. Vercel → Project → **Settings → Domains**.
2. Tambah domain (mis. `basnion.my.id`).
3. Set DNS sesuai instruksi Vercel:
   - `A` record → `76.76.21.21`
   - atau `CNAME` ke `cname.vercel-dns.com`
4. SSL otomatis dari Let's Encrypt.

---

## 6. Catatan TanStack Start di Vercel

- Vercel mendukung TanStack Start v1 out-of-the-box (ada preset `vercel`).
- Server functions (`createServerFn`) berjalan sebagai Vercel Functions (Edge / Node).
- Route file di `src/routes/api/*` otomatis jadi serverless endpoint.
- Jangan set `ssr.external` di `vite.config.ts` — tidak didukung.

---

## 7. Update / redeploy

Tiap push ke `main` → auto deploy production.
Tiap push ke branch lain → auto preview deploy.

Manual redeploy:
```bash
vercel --prod
```

---

## 8. Rollback

Vercel → Project → **Deployments** → pilih deployment lama → **Promote to Production**.

---

## 9. Troubleshooting

| Error                                       | Solusi                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `Missing env VITE_SUPABASE_URL`             | Tambahkan env di Vercel project settings, lalu redeploy.                   |
| Build gagal di TanStack Start prerender     | Pastikan route protected pakai layout `_authenticated/` atau pindah ke component.   |
| 404 saat refresh deep link                  | Hapus konfigurasi rewrite custom — TanStack Start sudah handle otomatis.   |
| Function timeout                            | Naikkan limit di **Settings → Functions** (max 60s di plan Pro).           |
