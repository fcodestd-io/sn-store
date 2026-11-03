# Deploy SN Store ke Vercel (demo)

Satu project Vercel menjalankan **panel admin**, **webhook Midtrans**, dan **bot Telegram (mode webhook)**.
`pnpm bot:dev` (long polling) hanya untuk pengembangan lokal; Vercel tidak mendukung proses yang berjalan terus-menerus.

## 1. Database (Supabase)
Jalankan berurutan di SQL Editor, lalu `notify pgrst, 'reload schema';`
1. `supabase/migrations/20261027000000_shared_accounts.sql`
2. `supabase/migrations/20261028000000_admin_orders_payments.sql`

## 2. Environment variables di Vercel
Project Settings → Environment Variables (lihat `.env.example`):

| Variabel | Keterangan |
|---|---|
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **rahasia**, hanya server |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` | kunci **sandbox** |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk demo |
| `TELEGRAM_BOT_TOKEN` | dari BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | acak 16-64 karakter (huruf/angka/`_`/`-`) |
| `CRON_SECRET` | acak panjang; melindungi `/api/cron/sync` |

> **Penting:** semua variabel di atas (kecuali `TELEGRAM_WEBHOOK_SECRET` dan `CRON_SECRET`, yang opsional saat build)
> harus sudah diisi **sebelum** deploy. Jika ada yang kosong, build berhenti dengan pesan `env_invalid`
> beserta daftar variabel yang belum ada. Isi lalu klik Redeploy.
> Pastikan variabel dicentang untuk environment **Production** (dan Preview bila dipakai).

## 3. Deploy
Import repo di Vercel (framework SvelteKit terdeteksi otomatis; build: `pnpm build`).
Versi Node ditetapkan di `vite.config.ts` (`runtime: 'nodejs24.x'`), jadi build tidak bergantung pada versi Node
yang dipilih Vercel (mendukung Node 22/24/26 di mesin build). Jangan menambahkan `engines` di `package.json`. Catat domainnya, mis. `https://sn-store.vercel.app`.

## 4. Webhook Telegram (otomatis)
Setiap deploy **Production** menjalankan `vercel-build` (`vite build` lalu `scripts/register-webhook.mjs`) yang
otomatis memanggil `setWebhook` ke `https://<domain-production>/api/telegram/webhook`. Syarat: `TELEGRAM_BOT_TOKEN`
dan `TELEGRAM_WEBHOOK_SECRET` sudah diisi di Vercel untuk environment **Production**. Biarkan *Build Command*
di Project Settings kosong (default) agar `vercel-build` dipakai. Cek di log build: `[webhook] terdaftar: ...`.

Jaring pengaman: cron harian (`/api/cron/sync`) memeriksa webhook dan mendaftarkannya lagi bila terhapus.

Manual (opsional), dari komputer lokal dengan `.env` yang `TELEGRAM_WEBHOOK_SECRET`-nya SAMA dengan Vercel:
```
pnpm bot:webhook https://sn-store.vercel.app
pnpm bot:webhook --info     # cek status
```
> Webhook dan polling tidak bisa aktif bersamaan. Menjalankan `pnpm bot:dev` otomatis menghapus webhook, dan
> selama polling lokal berjalan, cron/deploy yang mendaftarkan webhook lagi akan membuat polling berhenti (409).
> Saran: pakai **bot kedua dari BotFather** (token berbeda) di `.env` lokal untuk pengembangan, supaya bot
> production di Vercel tidak terganggu.

## 5. Webhook Midtrans
Dashboard Midtrans **Sandbox** → Settings → Configuration → **Payment Notification URL**:
```
https://sn-store.vercel.app/api/webhooks/midtrans
```

## 6. Cek cepat
- `/start` dan `/produk` di bot menjawab.
- Beli produk → bayar di Snap sandbox → akun masuk otomatis.
- Jika akun belum masuk, tombol **Cek Status Pembayaran** di bot menanyakan status langsung ke Midtrans.
- Panel: `/admin/orders` (riwayat order) dan `/admin/payments` (pembayaran).

## Catatan
- Cron di `vercel.json` berjalan **sekali sehari** (batas paket Hobby) sebagai jaring pengaman. Alur utama:
  webhook Midtrans, plus tombol Cek Status Pembayaran. Di paket Pro, ubah jadwal menjadi `* * * * *` untuk sinkron tiap menit.
- Jangan commit `.env`. Jika kunci pernah terkirim/terbagikan, ganti (rotate) sebelum demo publik.
