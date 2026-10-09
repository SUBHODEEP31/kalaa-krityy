import { NextRequest, NextResponse } from "next/server";
import { requireOwner, unauthorized } from "@/lib/auth";
import { getCoupons, upsertCoupon } from "@/lib/db";
import type { Coupon } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const coupons = await getCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();

  let body: Partial<Coupon>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!code || code.length < 3) {
    return NextResponse.json(
      { error: "Coupon code must be at least 3 characters" },
      { status: 400 }
    );
  }

  const type = body.type === "flat" ? "flat" : "percent";
  const value = Number(body.value ?? 0);
  if (!value || value <= 0) {
    return NextResponse.json({ error: "Value must be > 0" }, { status: 400 });
  }
  if (type === "percent" && value > 90) {
    return NextResponse.json(
      { error: "Percent discount cannot exceed 90%" },
      { status: 400 }
    );
  }

  const coupon: Coupon = {
    code,
    type,
    value,
    minOrder: Math.max(0, Number(body.minOrder ?? 0)),
    description:
      (body.description || "").trim() ||
      (type === "percent"
        ? `${value}% off boutique order`
        : `Flat ₹${value} off`),
    active: body.active !== false,
  };

  const saved = await upsertCoupon(coupon);
  return NextResponse.json({ coupon: saved }, { status: 201 });
}
