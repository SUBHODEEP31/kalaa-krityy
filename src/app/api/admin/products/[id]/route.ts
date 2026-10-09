import { NextRequest, NextResponse } from "next/server";
import { requireOwner, unauthorized } from "@/lib/auth";
import { deleteProduct, getProducts, upsertProduct } from "@/lib/db";
import type { Product, ProductBadge } from "@/types";
import { categories } from "@/data/catalog";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const { id } = await ctx.params;

  const products = await getProducts();
  const existing = products.find((p) => p.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: Partial<Product>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mrp = body.mrp !== undefined ? Number(body.mrp) : existing.mrp;
  const price = body.price !== undefined ? Number(body.price) : existing.price;
  if (price > mrp) {
    return NextResponse.json(
      { error: "Selling price cannot exceed MRP" },
      { status: 400 }
    );
  }

  let category = existing.category;
  let categorySlug = existing.categorySlug;
  if (body.categorySlug) {
    const cat = categories.find((c) => c.slug === body.categorySlug);
    if (cat) {
      category = cat.name;
      categorySlug = cat.slug;
    }
  }

  let badges = existing.badges;
  if (Array.isArray(body.badges)) {
    badges = body.badges.filter((b) =>
      ["new", "bestseller", "sale", "limited"].includes(b)
    ) as ProductBadge[];
  }
  if (mrp > price && !badges.includes("sale")) {
    badges = [...badges, "sale"];
  }
  if (mrp <= price) {
    badges = badges.filter((b) => b !== "sale");
  }

  const updated: Product = {
    ...existing,
    ...body,
    id: existing.id,
    slug: body.slug || existing.slug,
    name: (body.name ?? existing.name).trim(),
    category,
    categorySlug,
    mrp,
    price,
    stock: Math.max(
      0,
      body.stock !== undefined ? Number(body.stock) : existing.stock
    ),
    images:
      Array.isArray(body.images) && body.images.length
        ? body.images
        : existing.images,
    colors:
      Array.isArray(body.colors) && body.colors.length
        ? body.colors
        : existing.colors,
    sizes:
      Array.isArray(body.sizes) && body.sizes.length
        ? body.sizes
        : existing.sizes,
    badges,
  };

  const saved = await upsertProduct(updated);
  return NextResponse.json({ product: saved });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const { id } = await ctx.params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
