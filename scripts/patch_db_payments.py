from pathlib import Path
p = Path("src/lib/db.ts")
t = p.read_text(encoding="utf-8")

# Extend Order interface
if "razorpayOrderId" not in t:
    t = t.replace(
        """  couponCode?: string | null;
  paymentMethod: string;
  notes?: string;
  dbId?: string;
}""",
        """  couponCode?: string | null;
  paymentMethod: string;
  notes?: string;
  dbId?: string;
  razorpayOrderId?: string | null;
  razorpayPayId?: string | null;
}""",
    )

# Extend DbOrderRow
if "razorpayOrderId: string | null;" not in t.split("type DbOrderRow")[1][:800]:
    t = t.replace(
        """  couponCode: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  OrderItem?: DbOrderItemRow[];
};""",
        """  couponCode: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  razorpayOrderId: string | null;
  razorpayPayId: string | null;
  OrderItem?: DbOrderItemRow[];
};""",
    )

# mapOrder include razorpay fields
if "razorpayOrderId: o.razorpayOrderId" not in t:
    t = t.replace(
        """    couponCode: o.couponCode,
    paymentMethod: o.paymentMethod || "DEMO_RAZORPAY",
    notes: o.notes ?? undefined,
  };
}""",
        """    couponCode: o.couponCode,
    paymentMethod: o.paymentMethod || "DEMO_RAZORPAY",
    notes: o.notes ?? undefined,
    razorpayOrderId: o.razorpayOrderId,
    razorpayPayId: o.razorpayPayId,
  };
}""",
    )

# createOrder: default PENDING, include razorpay fields, skip stock if not PAID
old_insert = """  const { error: orderErr } = await sb()
    .from("Order")
    .insert({
      id: orderId,
      orderNumber,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email ?? null,
      shippingAddress: {
        address: order.customer.address,
        city: order.customer.city,
        pincode: order.customer.pincode,
      },
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      totalAmount: order.total,
      status: order.status || "PAID",
      couponCode: order.couponCode ?? null,
      paymentMethod: order.paymentMethod || "DEMO_RAZORPAY",
      notes: order.notes ?? null,
    });"""

new_insert = """  const status = order.status || "PENDING";
  const { error: orderErr } = await sb()
    .from("Order")
    .insert({
      id: orderId,
      orderNumber,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email ?? null,
      shippingAddress: {
        address: order.customer.address,
        city: order.customer.city,
        pincode: order.customer.pincode,
      },
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      totalAmount: order.total,
      status,
      couponCode: order.couponCode ?? null,
      paymentMethod: order.paymentMethod || "RAZORPAY",
      notes: order.notes ?? null,
      razorpayOrderId: order.razorpayOrderId ?? null,
      razorpayPayId: order.razorpayPayId ?? null,
    });"""

if old_insert in t:
    t = t.replace(old_insert, new_insert)
    print("insert patched")
else:
    print("insert block not found exact")

# stock decrement only when PAID
old_stock = """  for (const item of order.items) {
    const { data: product } = await sb()
      .from("Product")
      .select("stock, sold")
      .eq("id", item.productId)
      .single();
    if (product) {
      await sb()
        .from("Product")
        .update({
          stock: Math.max(0, Number(product.stock) - item.qty),
          sold: Number(product.sold || 0) + item.qty,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", item.productId);
    }
  }"""

new_stock = """  // Inventory is adjusted only when payment is confirmed (PAID)
  if (status === "PAID") {
    await applyInventoryForOrder(order.items);
  }"""

if old_stock in t:
    t = t.replace(old_stock, new_stock)
    print("stock gated")
else:
    print("stock block missing")

# Append helper functions at end before last ensureSeeded or after updateOrderStatus
helpers = r'''

async function applyInventoryForOrder(items: OrderItem[]) {
  for (const item of items) {
    const { data: product } = await sb()
      .from("Product")
      .select("stock, sold")
      .eq("id", item.productId)
      .single();
    if (product) {
      await sb()
        .from("Product")
        .update({
          stock: Math.max(0, Number(product.stock) - item.qty),
          sold: Number(product.sold || 0) + item.qty,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", item.productId);
    }
  }
}

export async function markOrderPaid(opts: {
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayPayId: string;
}): Promise<Order | null> {
  let existing: DbOrderRow | null = null;

  if (opts.orderNumber) {
    const { data } = await sb()
      .from("Order")
      .select("*")
      .eq("orderNumber", opts.orderNumber)
      .maybeSingle();
    existing = data as DbOrderRow | null;
  }
  if (!existing && opts.razorpayOrderId) {
    const { data } = await sb()
      .from("Order")
      .select("*")
      .eq("razorpayOrderId", opts.razorpayOrderId)
      .maybeSingle();
    existing = data as DbOrderRow | null;
  }
  if (!existing) return null;

  // Already paid — idempotent
  if (existing.status === "PAID" || existing.status === "PROCESSING" || existing.status === "SHIPPED" || existing.status === "DELIVERED") {
    const { data: items } = await sb()
      .from("OrderItem")
      .select("*")
      .eq("orderId", existing.id);
    return mapOrder({
      ...existing,
      razorpayPayId: opts.razorpayPayId || existing.razorpayPayId,
      OrderItem: (items || []) as DbOrderItemRow[],
    });
  }

  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", existing.id);
  const orderItems = ((items || []) as DbOrderItemRow[]).map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    price: Number(i.price),
    mrp: Number(i.mrp),
    image: i.image,
    size: i.size,
    color: i.color,
    qty: i.quantity,
  }));

  await applyInventoryForOrder(orderItems);

  const { data: updated, error } = await sb()
    .from("Order")
    .update({
      status: "PAID",
      razorpayPayId: opts.razorpayPayId,
      paymentMethod: "RAZORPAY",
      updatedAt: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) throw new Error(`markOrderPaid: ${error.message}`);

  return mapOrder({
    ...(updated as DbOrderRow),
    OrderItem: (items || []) as DbOrderItemRow[],
  });
}

export async function lookupOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const { data, error } = await sb()
    .from("Order")
    .select("*")
    .eq("orderNumber", orderNumber.trim())
    .maybeSingle();
  if (error) throw new Error(`lookupOrder: ${error.message}`);
  if (!data) return null;
  const row = data as DbOrderRow;
  const rowPhone = String(row.customerPhone || "").replace(/\D/g, "").slice(-10);
  if (rowPhone !== cleanPhone) return null;
  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", row.id);
  return mapOrder({ ...row, OrderItem: (items || []) as DbOrderItemRow[] });
}

export async function appendOrderNote(
  orderNumber: string,
  note: string
): Promise<Order | null> {
  const { data: existing, error } = await sb()
    .from("Order")
    .select("*")
    .eq("orderNumber", orderNumber)
    .maybeSingle();
  if (error) throw new Error(`appendOrderNote: ${error.message}`);
  if (!existing) return null;
  const prev = existing.notes || "";
  const nextNotes = prev ? `${prev}\n${note}` : note;
  const { data: updated, error: upErr } = await sb()
    .from("Order")
    .update({ notes: nextNotes, updatedAt: new Date().toISOString() })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (upErr) throw new Error(`appendOrderNote update: ${upErr.message}`);
  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", existing.id);
  return mapOrder({
    ...(updated as DbOrderRow),
    OrderItem: (items || []) as DbOrderItemRow[],
  });
}

export async function getOrderByRazorpayId(razorpayOrderId: string) {
  const { data, error } = await sb()
    .from("Order")
    .select("*")
    .eq("razorpayOrderId", razorpayOrderId)
    .maybeSingle();
  if (error) throw new Error(`getOrderByRazorpayId: ${error.message}`);
  if (!data) return null;
  const row = data as DbOrderRow;
  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", row.id);
  return mapOrder({ ...row, OrderItem: (items || []) as DbOrderItemRow[] });
}
'''

if "export async function markOrderPaid" not in t:
    # append before ensureSeeded
    marker = "export async function ensureSeededFromLocalCatalog"
    if marker in t:
        t = t.replace(marker, helpers + "\n" + marker)
        print("helpers added")
    else:
        t = t + helpers
        print("helpers appended end")
else:
    print("helpers exist")

p.write_text(t, encoding="utf-8")
print("db done", "markOrderPaid" in t, "razorpayOrderId" in t)
