import { NextRequest, NextResponse } from "next/server";
import { requireOwner, unauthorized } from "@/lib/auth";
import { deleteCoupon, getCoupons, upsertCoupon } from "@/lib/db";
import type { Coupon } from "@/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ code: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const { code: raw } = await ctx.params;
  const code = decodeURIComponent(raw).toUpperCase();

  const coupons = await getCoupons();
  const existing = coupons.find((c) => c.code.toUpperCase() === code);
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  let body: Partial<Coupon>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type === "flat" || body.type === "percent" ? body.type : existing.type;
  const value = body.value !== undefined ? Number(body.value) : existing.value;

  const updated: Coupon = {
    ...existing,
    ...body,
    code: existing.code,
    type,
    value,
    minOrder:
      body.minOrder !== undefined ? Math.max(0, Number(body.minOrder)) : existing.minOrder,
    active: body.active !== undefined ? Boolean(body.active) : existing.active,
    description: body.description?.trim() || existing.description,
  };

  const saved = await upsertCoupon(updated);
  return NextResponse.json({ coupon: saved });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const { code: raw } = await ctx.params;
  const code = decodeURIComponent(raw);
  const ok = await deleteCoupon(code);
  if (!ok) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
