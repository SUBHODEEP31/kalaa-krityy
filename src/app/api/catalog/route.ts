import { NextResponse } from "next/server";
import {
  categories,
  coupons as seedCoupons,
  products as seedProducts,
  SITE,
} from "@/data/catalog";
import { getCoupons, getProducts, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, coupons, settings] = await Promise.all([
      getProducts(),
      getCoupons(),
      getSettings(),
    ]);

    return NextResponse.json(
      {
        products,
        coupons: coupons.filter((c) => c.active),
        allCoupons: coupons,
        categories,
        settings,
        source: "supabase",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    // Tables not migrated yet — keep storefront alive with seed data
    console.error("[catalog] Supabase unavailable, using seed:", err);
    return NextResponse.json(
      {
        products: seedProducts,
        coupons: seedCoupons.filter((c) => c.active),
        allCoupons: seedCoupons,
        categories,
        settings: {
          name: SITE.name,
          tagline: SITE.tagline,
          phone: SITE.phone,
          phoneRaw: SITE.phoneRaw,
          email: SITE.email,
          address: SITE.address,
          registration: SITE.registration,
          announcement: SITE.announcement,
          whatsappEnabled: true,
        },
        source: "seed-fallback",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
