import { NextRequest, NextResponse } from "next/server";
import { createOrder, type Order, type OrderItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    customer?: Order["customer"];
    items?: OrderItem[];
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
    couponCode?: string | null;
    paymentMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const c = body.customer;
  if (!c?.name || !c.phone || !c.address || !c.pincode) {
    return NextResponse.json(
      { error: "Name, phone, address and pincode are required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const isCod = /COD/i.test(body.paymentMethod || "");
  const status = isCod ? "PENDING" : "PAID";
  const paymentMethod = isCod ? "COD" : (body.paymentMethod || "DEMO_RAZORPAY");

  const order: Order = {
    id: `KK${Date.now().toString().slice(-10)}`,
    createdAt: new Date().toISOString(),
    status,
    customer: {
      name: c.name.trim(),
      phone: c.phone.trim(),
      email: c.email?.trim(),
      address: c.address.trim(),
      city: c.city?.trim() || "Patna",
      pincode: c.pincode.trim(),
    },
    items: body.items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      price: Number(i.price),
      mrp: Number(i.mrp),
      image: i.image,
      size: i.size || "Free Size",
      color: i.color || "",
      qty: Math.max(1, Number(i.qty) || 1),
    })),
    subtotal: Number(body.subtotal || 0),
    discount: Number(body.discount || 0),
    shipping: Number(body.shipping || 0),
    total: Number(body.total || 0),
    couponCode: body.couponCode || null,
    paymentMethod,
    notes: isCod ? "[COD] Pay cash/UPI to delivery partner" : undefined,
  };

  const saved = await createOrder(order);
  try {
    const { ownerOrderAlertMessage, OWNER_WHATSAPP } = await import("@/lib/utils");
    const alertMsg = ownerOrderAlertMessage({
      orderNumber: saved.id,
      total: saved.total,
      paymentMethod,
      customer: saved.customer,
      items: saved.items,
    });
    console.log(`[WHATSAPP_ORDER_ALERT] Sent to ${OWNER_WHATSAPP}:\n${alertMsg}`);
  } catch (e) {
    console.error("[WHATSAPP_ORDER_ALERT] error", e);
  }

  return NextResponse.json({ order: saved }, { status: 201 });
}
