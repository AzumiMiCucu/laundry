# LaundryKu — Website Fullstack Laundry

Aplikasi laundry fullstack: landing page, pemesanan multi-step dengan upload foto,
tracking status real-time, loyalty points, dan dashboard admin.

## Stack

- **Runtime:** Bun
- **Framework:** Next.js 15 (App Router) — semua file ESM `.js` (tanpa TypeScript)
- **Database:** Turso (libSQL) + Drizzle ORM
- **Auth:** NextAuth.js v5 (Credentials + JWT)
- **Upload:** IMGBB (proxy aman via server route)
- **Styling:** Tailwind CSS v4 (`@theme` di CSS) + shadcn/ui
- **Form:** React Hook Form + Zod
- **State:** Zustand · **Notifikasi:** Sonner · **Icons:** Lucide · **Chart:** Recharts

## Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Konfigurasi environment** — salin `.env.local.example` ke `.env.local` lalu isi:
   ```
   TURSO_DATABASE_URL=libsql://<db>.turso.io
   TURSO_AUTH_TOKEN=<token>
   AUTH_SECRET=<hasil: openssl rand -base64 32>
   NEXTAUTH_URL=http://localhost:3000
   IMGBB_API_KEY=<api key imgbb>
   ```

3. **Buat skema tabel di Turso**
   ```bash
   bun run db:push
   ```

4. **Seed data awal** (admin, demo customer, 5 layanan)
   ```bash
   bun run seed
   ```

5. **Jalankan dev server**
   ```bash
   bun run dev
   ```

## Akun Demo

| Peran    | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@laundry.com    | admin123    |
| Customer | customer@laundry.com | customer123 |

## Struktur Rute

- `/` landing + kalkulator harga
- `/login`, `/register`
- `/order/new` pemesanan 4 langkah (customer)
- `/order/[id]` tracking + pembayaran (customer)
- `/orders` riwayat + loyalty (customer)
- `/profile`
- `/admin/dashboard` statistik + chart 7 hari
- `/admin/orders`, `/admin/orders/[id]` kelola & update status
- `/admin/customers`, `/admin/services` (CRUD)

## Catatan

- Proteksi rute via `middleware.js` (admin butuh role `admin`).
- IMGBB API key hanya dipakai di server (`/api/upload`), tidak pernah ke client.
- Semua mutasi lewat route handler `/api/*` (bukan server actions).
