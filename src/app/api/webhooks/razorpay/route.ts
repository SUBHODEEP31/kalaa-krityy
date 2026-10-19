import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!secret) {
    console.error("[webhook/razorpay] missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!safeEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            status?: string;
          };
        };
      };
    };

    const event = payload.event || "";
    const payment = payload.payload?.payment?.entity;

    if (
      (event === "payment.captured" || event === "payment.authorized") &&
      payment?.order_id &&
      payment?.id
    ) {
      const paid = await markOrderPaid({
        razorpayOrderId: payment.order_id,
        razorpayPayId: payment.id,
      });
      if (paid) {
        try {
          const { ownerOrderAlertMessage, OWNER_WHATSAPP } = await import("@/lib/utils");
          const alertMsg = ownerOrderAlertMessage({
            orderNumber: paid.id,
            total: paid.total,
            paymentMethod: "Razorpay (PAID)",
            customer: paid.customer,
            items: paid.items,
          });
          console.log(`[WHATSAPP_ORDER_ALERT] Sent to ${OWNER_WHATSAPP}:\n${alertMsg}`);
        } catch (e) {
          console.error("[WHATSAPP_ORDER_ALERT] error", e);
        }
      }
    }
  } catch (err) {
    console.error("[webhook/razorpay] handler error", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
