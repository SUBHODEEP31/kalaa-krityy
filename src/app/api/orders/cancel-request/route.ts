import { NextRequest, NextResponse } from "next/server";
import { appendOrderNote, lookupOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { orderNumber?: string; phone?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber = (body.orderNumber || "").trim();
  const phone = (body.phone || "").trim();
  const reason = (body.reason || "Customer requested cancellation").trim();

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Order number and phone are required" },
      { status: 400 }
    );
  }

  try {
    const order = await lookupOrder(orderNumber, phone);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return NextResponse.json(
        {
          error:
            "Order is already in transit or delivered. Please contact support for returns.",
        },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ ok: true, order, message: "Already cancelled" });
    }

    const stamp = new Date().toISOString();
    const note = `[CANCEL_REQUESTED: ${reason}] at ${stamp}`;
    const updated = await appendOrderNote(orderNumber, note);

    return NextResponse.json({
      ok: true,
      order: updated,
      message: "Cancellation request noted for boutique staff",
    });
  } catch (err) {
    console.error("[orders/cancel-request]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}
