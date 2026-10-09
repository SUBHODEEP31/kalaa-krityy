import { NextRequest, NextResponse } from "next/server";
import { requireOwner, unauthorized } from "@/lib/auth";
import { getProducts, upsertProduct } from "@/lib/db";
import type { Product, ProductBadge } from "@/types";
import { categories } from "@/data/catalog";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();

  let body: Partial<Product> & {
    name?: string;
    categorySlug?: string;
    mrp?: number;
    price?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const mrp = Number(body.mrp ?? 0);
  const price = Number(body.price ?? 0);
  if (!mrp || !price || price < 0 || mrp < 0) {
    return NextResponse.json({ error: "Valid MRP and price required" }, { status: 400 });
  }
  if (price > mrp) {
    return NextResponse.json(
      { error: "Selling price cannot exceed MRP" },
      { status: 400 }
    );
  }

  const categorySlug = body.categorySlug || "sarees";
  const cat = categories.find((c) => c.slug === categorySlug) || categories[0];
  const images =
    Array.isArray(body.images) && body.images.length
      ? body.images.filter(Boolean)
      : [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
        ];

  const badges: ProductBadge[] = [];
  if (Array.isArray(body.badges)) {
    for (const b of body.badges) {
      if (["new", "bestseller", "sale", "limited"].includes(b)) {
        badges.push(b as ProductBadge);
      }
    }
  }
  if (mrp > price && !badges.includes("sale")) badges.push("sale");
  if (!badges.includes("new")) badges.unshift("new");

  const product: Product = {
    id: body.id || `p-${Date.now()}`,
    slug:
      body.slug ||
      `${slugify(name)}-${Date.now().toString(36).slice(-5)}`,
    name,
    category: cat.name,
    categorySlug: cat.slug,
    description:
      (body.description || "").trim() ||
      "Boutique exclusive piece from Kalaa Krityy.",
    care: body.care,
    fabric: body.fabric,
    mrp,
    price,
    images,
    colors:
      Array.isArray(body.colors) && body.colors.length
        ? body.colors
        : ["#4A0E2E"],
    sizes:
      Array.isArray(body.sizes) && body.sizes.length
        ? body.sizes
        : cat.slug === "sarees"
          ? ["Free Size"]
          : ["S", "M", "L", "XL"],
    stock: Math.max(0, Number(body.stock ?? 10)),
    sold: Number(body.sold ?? 0),
    rating: Number(body.rating ?? 5),
    reviewCount: Number(body.reviewCount ?? 0),
    badges,
    tags: Array.isArray(body.tags) ? body.tags : ["owner"],
    featured: Boolean(body.featured ?? true),
    createdAt: body.createdAt || new Date().toISOString().slice(0, 10),
  };

  const saved = await upsertProduct(product);
  return NextResponse.json({ product: saved }, { status: 201 });
}
