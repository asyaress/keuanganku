# Dompetku — Next.js + MySQL

Aplikasi keuangan pribadi mobile-first dengan nuansa modern ala iPhone:
- dompet utama
- input transaksi dengan keypad kalkulator
- statistik bulanan interaktif
- investasi sederhana: reksadana dan emas

## Stack
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- MySQL
- Recharts

## Fitur utama
- Login sederhana dengan password aplikasi
- Dashboard dengan card gradient, slider, dan statistik 6 bulan
- Catat pemasukan, pengeluaran, dan investasi
- Input nominal menggunakan keypad kalkulator
- Statistik bulanan untuk masuk, keluar, dan investasi
- Halaman investasi terpisah untuk reksadana dan emas

## 1. Persiapan
Pastikan tersedia:
- Node.js 20+
- MySQL aktif
- database bernama `dompetku_app`

## 2. Environment
Salin `.env.example` menjadi `.env`, lalu isi:

```env
DATABASE_URL="mysql://root@127.0.0.1:3306/dompetku_app"
APP_PASSWORD="password"
SESSION_SECRET="ganti-dengan-random-secret-yang-panjang"
```

Kalau MySQL kamu memakai password kosong tetapi format `root@` tidak jalan, gunakan:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/dompetku_app"
```

## 3. Install
```bash
npm install
```

## 4. Generate Prisma
```bash
npx prisma generate
```

## 5. Siapkan database
Karena seed akan menghapus dan mengisi ulang data demo, jalankan:

```bash
npx prisma db push --force-reset
npm run db:seed
```

## 6. Jalankan lokal
```bash
npm run dev
```

Buka:
- `http://localhost:3000`

Login memakai password dari `.env`.

## Struktur halaman
- `/dashboard` → beranda
- `/catat` → input transaksi
- `/statistik` → statistik bulanan
- `/investasi` → halaman investasi

## Seed demo
Data awal mencakup:
- dompet utama
- dompet investasi
- kategori pemasukan/pengeluaran/investasi
- transaksi 6 bulan
- investasi reksadana dan emas

## Deploy VPS singkat
1. Upload project ke VPS
2. Buat `.env`
3. Jalankan:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   npm run build
   npm run start
   ```

### Dengan PM2
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Catatan
- Komponen chart membutuhkan dependency `recharts`
- Jika kamu mengubah enum atau schema Prisma, jalankan ulang:
  ```bash
  npx prisma generate
  npx prisma db push --force-reset
  npm run db:seed
  ```
- Halaman `/riwayat` diarahkan ke `/statistik`
