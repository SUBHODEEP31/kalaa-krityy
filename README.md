# Kalaa Krityy — Premium Boutique Storefront

Luxury ethnic boutique + training center website for **Kalaa Krityy** (Patna).

## Run
```bash
cd D:\ifqm-case-generator\kalaa-krityy
npm install
npm run dev
```
Open http://localhost:3000

## Owner / Seller console (secure)
1. Open http://localhost:3000/admin/login
2. Default credentials (change in `.env` before go-live):
   - Email: `owner@kalaakrityy.com`
   - Password: `Kalaa@Owner2026`
3. From the Seller Hub you can:
   - Upload product photos or short videos
   - Set MRP, selling price (auto % discount), stock +/-
   - Edit / delete products
   - Create, activate, deactivate, delete coupon codes
4. Changes write to `data/catalog.json` and show on the public shop via `/api/catalog`

### Security notes
- Owner session is a signed JWT in an **httpOnly** cookie (12h)
- Login is rate-limited (8 attempts / 15 min per IP)
- Upload API allows only image/video MIME types, max 12MB, rejects HTML disguise
- Admin product/coupon APIs require a valid owner session
- Set strong `OWNER_PASSWORD` + `OWNER_SESSION_SECRET` in production

## Scale / data capacity
Current design uses a file-backed catalog (`data/catalog.json`) which comfortably handles **hundreds to a few thousand** SKUs for a single boutique.

When she grows past that (or needs multi-device concurrent writes, analytics, multi-staff):
1. Migrate the same Product/Coupon models to **SQLite/Postgres via Prisma** (schema already scaffolded)
2. Keep the same API routes — only swap `src/lib/db.ts` internals
3. Move uploads to S3/R2/Cloudinary
4. Add CDN caching on `/api/catalog` with short TTL + revalidate on write

This is the standard boutique → scale path without rewriting the frontend.

## Customer routes
- `/` Home
- `/shop` Live catalog
- `/product/[slug]` PDP
- `/sale` Offers + coupons
- `/services` Boutique / tailor
- `/training` Courses
- `/cart` `/checkout`
- `/admin/login` Owner only
