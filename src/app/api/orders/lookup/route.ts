import { NextRequest, NextResponse } from "next/server";
import { lookupOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { orderNumber?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber = (body.orderNumber || "").trim();
  const phone = (body.phone || "").trim();
  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Order number and phone are required" },
      { status: 400 }
    );
  }

  try {
    const order = await lookupOrder(orderNumber, phone);
    if (!order) {
      return NextResponse.json(
        { error: "No order found for this number and phone" },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (err) {
    console.error("[orders/lookup]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
