/**
 * Seed/migrate local catalog.json + seed data into Supabase Postgres via REST.
 * Prerequisites: tables from prisma/supabase-init.sql must exist.
 *
 *   npx tsx scripts/migrate-catalog.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: resolve(process.cwd(), ".env") });

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type AnyProduct = Record<string, unknown>;

async function main() {
  console.log("Checking Supabase tables…");
  const probe = await sb.from("Product").select("id", { count: "exact", head: true });
  if (probe.error) {
    console.error("\n❌ Tables not found:", probe.error.message);
    console.error(
      "\nApply schema first in Supabase SQL Editor:\n  prisma/supabase-init.sql\n"
    );
    process.exit(1);
  }

  let products: AnyProduct[] = [];
  let coupons: AnyProduct[] = [];
  let settings: AnyProduct | null = null;

  const catalogPath = resolve(process.cwd(), "data/catalog.json");
  if (existsSync(catalogPath)) {
    const raw = JSON.parse(readFileSync(catalogPath, "utf8"));
    products = raw.products || [];
    coupons = raw.coupons || [];
    settings = raw.settings || null;
    console.log(`Loaded catalog.json: ${products.length} products, ${coupons.length} coupons`);
  } else {
    const seed = await import("../src/data/catalog");
    products = seed.products as unknown as AnyProduct[];
    coupons = seed.coupons as unknown as AnyProduct[];
    settings = seed.SITE as unknown as AnyProduct;
    console.log(`Loaded seed module: ${products.length} products`);
  }

  let pOk = 0;
  for (const p of products) {
    const id = String(p.id);
    const row = {
      id,
      slug: String(p.slug),
      name: String(p.name),
      category: String(p.category),
      categorySlug: String(p.categorySlug),
      description: String(p.description || ""),
      care: (p.care as string) || null,
      fabric: (p.fabric as string) || null,
      mrp: Number(p.mrp),
      price: Number(p.price),
      images: (p.images as string[]) || [],
      colors: (p.colors as string[]) || [],
      sizes: (p.sizes as string[]) || [],
      stock: Number(p.stock ?? 0),
      sold: Number(p.sold ?? 0),
      rating: Number(p.rating ?? 5),
      reviewCount: Number(p.reviewCount ?? 0),
      badges: (p.badges as string[]) || [],
      tags: (p.tags as string[]) || [],
      featured: Boolean(p.featured),
      createdAt: p.createdAt
        ? new Date(String(p.createdAt)).toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { error } = await sb.from("Product").upsert(row);
    if (error) {
      console.error("Product fail", row.slug, error.message);
    } else {
      pOk++;
    }
  }
  console.log(`Products upserted: ${pOk}/${products.length}`);

  let cOk = 0;
  for (const c of coupons) {
    const row = {
      code: String(c.code).toUpperCase(),
      type: c.type === "flat" ? "flat" : "percent",
      value: Number(c.value),
      minOrder: Number(c.minOrder ?? 0),
      description: String(c.description || ""),
      active: c.active !== false,
      updatedAt: new Date().toISOString(),
    };
    const { error } = await sb.from("Coupon").upsert(row);
    if (error) console.error("Coupon fail", row.code, error.message);
    else cOk++;
  }
  console.log(`Coupons upserted: ${cOk}/${coupons.length}`);

  if (settings) {
    const s = {
      id: 1,
      name: String((settings as AnyProduct).name || "Kalaa Krityy"),
      tagline: String((settings as AnyProduct).tagline || ""),
      phone: String((settings as AnyProduct).phone || ""),
      phoneRaw: String((settings as AnyProduct).phoneRaw || ""),
      email: String((settings as AnyProduct).email || ""),
      address: String((settings as AnyProduct).address || ""),
      registration: String((settings as AnyProduct).registration || ""),
      announcement: String((settings as AnyProduct).announcement || ""),
      whatsappEnabled: true,
    };
    const { error } = await sb.from("SiteSettings").upsert(s);
    if (error) console.error("Settings fail", error.message);
    else console.log("SiteSettings upserted");
  }

  const { count: pc } = await sb
    .from("Product")
    .select("*", { count: "exact", head: true });
  const { count: cc } = await sb
    .from("Coupon")
    .select("*", { count: "exact", head: true });
  console.log("\n✅ Live counts — products:", pc, "coupons:", cc);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
