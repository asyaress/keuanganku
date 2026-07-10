# Deploy Dompetku di aaPanel (Node Project)

Panduan ini untuk domain: `keuanganku.store`.

## 1) Arahkan domain ke VPS
- Buat DNS record:
  - `A` untuk `@` -> IP VPS
  - `A` untuk `www` -> IP VPS
- Tunggu propagasi DNS (biasanya 5-30 menit, bisa lebih lama).

## 2) Siapkan server di aaPanel
- Install:
  - `Node.js` (versi 20 atau lebih baru)
  - `PM2 Manager` (jika tersedia)
  - `Nginx`
  - `MySQL`
- Pastikan port 80 dan 443 terbuka di firewall/security group.

## 3) Upload project
- Upload ZIP ke folder:
  - `/www/wwwroot/keuanganku.store`
- Extract ZIP.

## 4) Set environment
- Copy `.env.example` menjadi `.env`:
  - `cp .env.example .env`
- Isi `.env`:
  - `DATABASE_URL`
  - `APP_PASSWORD`
  - `SESSION_SECRET`

Contoh:
```env
DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3306/dompetku_app"
APP_PASSWORD="password-kamu"
SESSION_SECRET="random-secret-panjang"
```

## 5) Siapkan database via phpMyAdmin
- Buat database `dompetku_app` dari phpMyAdmin.
- Import struktur/data sesuai kebutuhan dari phpMyAdmin (tanpa command terminal DB).
- Untuk fitur growth bulanan investasi, jalankan SQL ini di phpMyAdmin:
  - `sql/add_investment_snapshots.sql`

## 6) Install dependency dan build (tanpa command DB)
Jalankan di terminal folder project:

```bash
cd /www/wwwroot/keuanganku.store
npm ci
npx prisma generate
npm run build
```

## 7) Jalankan app Node
Pakai PM2:

```bash
cd /www/wwwroot/keuanganku.store
PORT=3000 pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Cek status:
```bash
pm2 status
pm2 logs dompetku --lines 100
```

## 8) Hubungkan domain ke app (reverse proxy Nginx)
- aaPanel > Website > Add Site:
  - Domain: `keuanganku.store` (tambahkan juga `www.keuanganku.store` bila perlu)
  - Root: `/www/wwwroot/keuanganku.store` (boleh default)
- Masuk ke site config > Reverse Proxy:
  - Target: `http://127.0.0.1:3000`
  - Enable proxy.

## 9) Aktifkan SSL
- aaPanel > SSL:
  - Pilih Let's Encrypt untuk `keuanganku.store`.
  - Aktifkan Force HTTPS.

## 10) Verifikasi
- Buka:
  - `https://keuanganku.store`
- Jika error, cek:
  - `pm2 logs dompetku --lines 100`
  - log error Nginx di aaPanel.

## Catatan
- Project ini adalah **Node.js project** (Next.js), jadi jalankan sebagai service Node (bukan PHP).
- Jangan upload `node_modules` dari lokal; install di VPS dengan `npm ci`.
- File `.env` tidak ikut ZIP untuk keamanan.
- Karena database dikelola via phpMyAdmin, command DB seperti `npx prisma db push` dan `npm run db:seed` tidak wajib dijalankan di VPS.
