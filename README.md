# 🛒 Mini POS — Point of Sale System

Aplikasi Point of Sale (POS) modern, cepat, dan ringan berbasis TypeScript monorepo. Dibangun untuk **Xolvon Project Incubator Program Technical Test**.

---

## 🌐 Link Deployment Live (Production)

| Layanan | Platform | URL Live |
| :--- | :--- | :--- |
| **Frontend Web** | Cloudflare Pages | [https://mini-pos-web-53v.pages.dev](https://mini-pos-web-53v.pages.dev) |
| **Backend API** | Cloudflare Workers | [https://mini-pos-api.mas-arifbagus2407.workers.dev](https://mini-pos-api.mas-arifbagus2407.workers.dev) |

> [!NOTE]
> Seluruh infrastruktur dideploy di atas **Cloudflare Free Tier** (Workers, D1, dan Pages) tanpa memerlukan kartu kredit.

---

## 🚀 Fitur Utama

- **Manajemen Produk (CRUD)**: Lihat daftar produk, tambah produk baru, edit detail produk, dan ubah status aktif/nonaktif.
- **Keranjang Belanja Interactive**: Tambah/kurang item, hitung total harga otomatis, dan kelola keranjang belanja secara real-time.
- **Atomic Checkout & Inventoris**: Transaksi diproses secara atomik di server side dengan validasi stok, pengecekan status aktif, kalkulasi harga independen dari client, serta pencatatan snapshot produk (nama & harga historis).
- **Riwayat Transaksi & Detail**: Lihat daftar semua transaksi beserta detail item snapshot dan waktu pembelian.
- **Modern Dark Glassmorphism UI**: Antarmuka responsif dan estetik dengan dukungan micro-animations untuk desktop, tablet, dan mobile.

---

## 🛠️ Tech Stack & Arsitektur

```
xolvonProjectTechTest/
├── apps/
│   ├── api/    # Hono API Server + Drizzle ORM + Cloudflare D1 (Workers)
│   └── web/    # Next.js 16 (App Router) + Tailwind CSS v4 (Pages)
```

- **Frontend (`apps/web`)**: Next.js 16 (App Router, Static Export), React 19, Tailwind CSS v4.
- **Backend (`apps/api`)**: Hono.js framework, Drizzle ORM, Vitest.
- **Database & Hosting**: Cloudflare D1 (Serverless SQLite), Cloudflare Workers, Cloudflare Pages.

---

## ⚙️ Panduan Setup & Instalasi Lokal

### 1. Prasyarat
- **Node.js**: v18.0.0 atau lebih baru
- **npm**: v10.0.0 atau lebih baru

### 2. Instalasi Dependency Monorepo
Jalankan di root repositori:
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` ke `.env` pada folder `apps/web`:
```bash
cp apps/web/.env.example apps/web/.env
```
Isi `apps/web/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 4. Setup Database D1 Lokal & Migrasi Schema
Masuk ke direktori `apps/api` dan jalankan migrasi lokal:
```bash
cd apps/api
npx wrangler d1 migrations apply mini-pos-db --local
```

---

## 🧪 Menjalankan Pengujian (Testing)

Pengujian otomatis dibangun menggunakan **Vitest** di backend (`apps/api`) untuk memverifikasi kalkulasi harga server-side, validasi stok, serta immutability snapshot transaksi.

Jalankan pengujian dari folder `apps/api`:
```bash
cd apps/api
npm test
```

---

## 💻 Menjalankan Aplikasi Secara Lokal

### Jalankan Backend API (Local Worker)
```bash
cd apps/api
npm run dev
```
API akan berjalan di `http://localhost:8787` (Health check: `http://localhost:8787/health`).

### Jalankan Frontend Web (Next.js Dev Server)
Di terminal terpisah:
```bash
cd apps/web
npm run dev
```
Aplikasi web akan dapat diakses di `http://localhost:3000`.

---

## 📦 Instruksi Deployment ke Cloudflare

### Deploy Backend (`apps/api`)
1. Buat database D1 production:
   ```bash
   npx wrangler d1 create mini-pos-db
   ```
2. Salin `database_id` yang dihasilkan ke `apps/api/wrangler.toml`.
3. Jalankan migrasi ke D1 remote:
   ```bash
   npx wrangler d1 migrations apply mini-pos-db --remote
   ```
4. Deploy Worker API:
   ```bash
   npx wrangler deploy
   ```

### Deploy Frontend (`apps/web`)
1. Set `NEXT_PUBLIC_API_URL` pada `apps/web/.env` ke URL Worker production.
2. Buat project Cloudflare Pages (bila belum):
   ```bash
   npx wrangler pages project create mini-pos-web --production-branch main
   ```
3. Build static export:
   ```bash
   npm run build
   ```
4. Deploy direktori `out` ke Cloudflare Pages:
   ```bash
   npx wrangler pages deploy out --project-name=mini-pos-web
   ```

---

## 📄 Lisensi

Proyek ini dibangun sebagai bagian dari Technical Test **Xolvon Project Incubator Program**.
