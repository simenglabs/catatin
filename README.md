# Catatin

Aplikasi SaaS **Sales & Invoicing multi-tenant** — kelola produk, catat penjualan
(DP / Belum Lunas / Lunas), lacak pembayaran, dan cetak invoice. Setiap pengguna
memiliki satu workspace; seluruh data terisolasi per `workspace_id`.

## Tech Stack

- **Next.js 16** (App Router) + React 19
- **Tailwind CSS v4** + Radix UI / shadcn
- **Supabase** — Postgres, Auth, Storage
- TypeScript

## Arsitektur akses data

Akses data tenant memakai **service-role** (bypass RLS) yang dibungkus helper
ber-scope, dengan RLS tetap menyala sebagai jaring pengaman lapis kedua.

| Lapisan | Dipakai untuk | Klien |
|---------|---------------|-------|
| Identitas & bootstrap | auth, onboarding, chrome layout | anon + sesi + RLS ([lib/supabase/server.ts](lib/supabase/server.ts)) |
| Data tenant (CRUD, metrik) | produk, sales, pembayaran | service-role ber-scope ([lib/db/scoped.ts](lib/db/scoped.ts)) |
| Pembuatan sale | RPC `create_sale` (atomic: invoice + stok + status) | sesi user (RPC self-authorize via `auth.uid()`) |

Inti keamanannya ada di [lib/db/scoped.ts](lib/db/scoped.ts): `getScopedDb()`
memverifikasi kepemilikan workspace lalu mengembalikan klien yang **memaksa**
filter `workspace_id` di setiap query — pengganti RLS saat memakai service-role.
Klien service-role ([lib/supabase/admin.ts](lib/supabase/admin.ts)) **server-only**;
jangan pernah meng-import-nya dari komponen `"use client"`.

## Setup

### 1. Environment

Salin `.env.example` ke `.env.local` dan isi dari Supabase Dashboard → Settings → API:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # SERVER ONLY — tanpa prefix NEXT_PUBLIC_
```

### 2. Database

Migrasi ada di [supabase/migrations/](supabase/migrations/) dan sudah diterapkan
ke project. Untuk lingkungan baru, jalankan berurutan (via Supabase CLI atau
SQL Editor):

| File | Isi |
|------|-----|
| `0001_init.sql` | Skema, RPC, trigger, RLS, bucket `logos` |
| `0002_grant_api_roles.sql` | Grant DML ke role API (anon/authenticated/service_role) |
| `0003_tighten_function_grants.sql` | Cabut EXECUTE fungsi internal dari anon/authenticated |
| `0004_revoke_public_execute.sql` | Cabut EXECUTE `PUBLIC` dari fungsi `SECURITY DEFINER` |
| `0005_fix_logos_bucket_listing.sql` | Hapus policy listing bucket yang terlalu luas |

### 3. Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

## Akun demo

Buat/segarkan akun demo (idempotent — aman dijalankan ulang):

```bash
node --env-file=.env.local scripts/seed-demo.mjs
```

Kredensial:

```
Email    : demo@catatin.app
Password : demodemo123
```

Berisi workspace **Toko Demo Catatin** + 5 produk contoh, tanpa data sales/payment.

## Catatan keamanan

- **RLS tetap aktif** di semua tabel sebagai jaring pengaman; jangan dimatikan.
- **Leaked Password Protection** (cek HaveIBeenPwned) butuh **plan Pro** — tidak
  tersedia di free tier. Opsional; bukan syarat MVP. Aktifkan nanti bila upgrade
  di Dashboard → Authentication → Sign In / Providers → Email.
- Jalankan `get_advisors` (MCP) atau database linter setiap habis perubahan DDL.

## Skrip

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `node --env-file=.env.local scripts/seed-demo.mjs` | Seed akun demo |