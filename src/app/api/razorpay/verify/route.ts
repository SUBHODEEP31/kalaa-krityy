import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqualHex(a: string, b: string) {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return a === b;
  }
}

export async function POST(req: NextRequest) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    orderNumber?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.razorpay_order_id || "";
  const paymentId = body.razorpay_payment_id || "";
  const signature = body.razorpay_signature || "";
  const orderNumber = body.orderNumber || "";

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { ok: false, error: "Missing payment verification fields" },
      { status: 400 }
    );
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Payment secret not configured" },
      { status: 500 }
    );
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (!safeEqualHex(expected, signature)) {
    return NextResponse.json(
      { ok: false, error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  try {
    const order = await markOrderPaid({
      orderNumber: orderNumber || undefined,
      razorpayOrderId: orderId,
      razorpayPayId: paymentId,
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found after payment" },
        { status: 404 }
      );
    }

    try {
      const { ownerOrderAlertMessage, OWNER_WHATSAPP } = await import("@/lib/utils");
      const alertMsg = ownerOrderAlertMessage({
        orderNumber: order.id,
        total: order.total,
        paymentMethod: "Razorpay (PAID)",
        customer: order.customer,
        items: order.items,
      });
      console.log(`[WHATSAPP_ORDER_ALERT] Sent to ${OWNER_WHATSAPP}:\n${alertMsg}`);
    } catch (e) {
      console.error("[WHATSAPP_ORDER_ALERT] error", e);
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.id,
      order,
    });
  } catch (err) {
    console.error("[razorpay/verify]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Verify failed" },
      { status: 500 }
    );
  }
}
