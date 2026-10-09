# Supabase Production Setup — Kalaa Krityy

## What was migrated

| Before | After |
|--------|--------|
| `data/catalog.json` file DB | Supabase **PostgreSQL** (PostgREST HTTPS) |
| `public/uploads/products/*` | Supabase Storage bucket **`kalarity-products`** |
| No admin edge guard | Root **`middleware.ts`** JWT guard on `/admin/*` |
| Prisma SQLite stub | Prisma schema targeting **PostgreSQL** |

## One-time schema apply (required)

This machine **cannot open Postgres ports 5432/6543** (firewall).  
HTTPS to Supabase works, so after tables exist the app runs fully.

### Step A — Run SQL in Supabase Dashboard (60 seconds)

1. Open: https://supabase.com/dashboard/project/djtofqzmafwpkhzxabhn/sql/new  
2. Paste **entire** contents of `prisma/supabase-init.sql`  
3. Click **Run**

### Step B — Seed products/coupons

```powershell
cd D:\ifqm-case-generator\kalaa-krityy
npx tsx scripts/migrate-catalog.ts
```

### Step C — Start app

```powershell
npm run dev
```

- Store: http://localhost:3000  
- Owner: http://localhost:3000/admin/login  
  - `owner@kalaakrityy.com` / `Kalaa@Owner2026`

## Environment (already in `.env`)

- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres  
- `SUPABASE_URL` — `https://djtofqzmafwpkhzxabhn.supabase.co`  
- `SUPABASE_SERVICE_ROLE_KEY` — service role (server only, never `NEXT_PUBLIC_`)  
- `SUPABASE_STORAGE_BUCKET` — `kalarity-products`  
- `OWNER_*` — admin login  

## Architecture (production-grade)

```
Browser  →  Next.js (Vercel-ready)
              ├─ /api/catalog, /api/orders     (service role → PostgREST HTTPS)
              ├─ /api/admin/*                  (JWT cookie + service role)
              ├─ /api/admin/upload             → Storage CDN URLs
              └─ middleware.ts                 → protects /admin/*
```

When you deploy to **Vercel**, set the same env vars.  
`prisma db push` will also work from Vercel/build machines that can reach port 5432.

## Verify after SQL + seed

```powershell
npx tsx scripts/migrate-catalog.ts
# expect: Live counts — products: N coupons: M
```

Upload a product image in Admin — URL should look like:

`https://djtofqzmafwpkhzxabhn.supabase.co/storage/v1/object/public/kalarity-products/products/...`
