import { NextRequest, NextResponse } from "next/server";
import { createOrder, type OrderItem } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: {
    customer?: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      pincode?: string;
    };
    items?: OrderItem[];
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
    couponCode?: string | null;
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

  const total = Number(body.total || 0);
  if (!total || total <= 0) {
    return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
  }

  const amountPaise = Math.round(total * 100);
  const orderNumber = `KK${Date.now().toString().slice(-10)}`;
  const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

  try {
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        orderNumber,
        customerPhone: c.phone.trim(),
      },
    });

    const saved = await createOrder({
      id: orderNumber,
      createdAt: new Date().toISOString(),
      status: "PENDING",
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
      total,
      couponCode: body.couponCode || null,
      paymentMethod: "RAZORPAY",
      razorpayOrderId: rzpOrder.id,
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: "INR",
      orderNumber: saved.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: saved.customer,
    });
} catch (err) {
    console.error("[razorpay/order]", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "error" in err
          ? String((err as { error?: { description?: string } }).error?.description || err)
          : "Payment order failed";
    // Friendlier production messages
    const friendly =
      /fetch failed|ENOTFOUND|ECONNREFUSED/i.test(message)
        ? "Could not reach order database. Payment keys may still work — retry once. If this continues, check SUPABASE_URL on Vercel."
        : /Razorpay|key/i.test(message)
          ? "Razorpay rejected the order. Verify live KEY_ID and KEY_SECRET on Vercel."
          : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
