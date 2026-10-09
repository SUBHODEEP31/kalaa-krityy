/**
 * Production data layer — Supabase PostgREST (HTTPS) + service role.
 * Works even when direct Postgres ports are firewalled.
 * Schema: prisma/schema.prisma + prisma/supabase-init.sql
 */
import { randomBytes } from "crypto";
import type { Coupon, Product } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  coupons as seedCoupons,
  products as seedProducts,
  SITE,
} from "@/data/catalog";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color: string;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  notes?: string;
  dbId?: string;
  razorpayOrderId?: string | null;
  razorpayPayId?: string | null;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  registration: string;
  announcement: string;
  whatsappEnabled: boolean;
}

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  care: string | null;
  fabric: string | null;
  mrp: number;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  tags: string[];
  featured: boolean;
  createdAt: string;
};

type DbCoupon = {
  code: string;
  type: string;
  value: number;
  minOrder: number;
  description: string;
  active: boolean;
};

type DbOrderItemRow = {
  id: string;
  orderId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type DbOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: Record<string, string>;
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  status: OrderStatus;
  couponCode: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  razorpayOrderId: string | null;
  razorpayPayId: string | null;
  OrderItem?: DbOrderItemRow[];
};

function sb() {
  return getSupabaseAdmin();
}

function newId(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}

function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description || "",
    care: p.care ?? undefined,
    fabric: p.fabric ?? undefined,
    mrp: Number(p.mrp),
    price: Number(p.price),
    images: p.images || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    stock: Number(p.stock) || 0,
    sold: Number(p.sold) || 0,
    rating: Number(p.rating) || 5,
    reviewCount: Number(p.reviewCount) || 0,
    badges: (p.badges || []).filter((b) =>
      ["new", "bestseller", "sale", "limited"].includes(b)
    ) as Product["badges"],
    tags: p.tags || [],
    featured: Boolean(p.featured),
    createdAt: (p.createdAt || new Date().toISOString()).slice(0, 10),
  };
}

function mapCoupon(c: DbCoupon): Coupon {
  return {
    code: c.code,
    type: c.type === "flat" ? "flat" : "percent",
    value: Number(c.value),
    minOrder: Number(c.minOrder) || 0,
    description: c.description || "",
    active: Boolean(c.active),
  };
}

function mapOrder(o: DbOrderRow): Order {
  const addr = o.shippingAddress || {};
  return {
    id: o.orderNumber,
    dbId: o.id,
    createdAt: o.createdAt,
    status: o.status,
    customer: {
      name: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail ?? undefined,
      address: addr.address || "",
      city: addr.city || "Patna",
      pincode: addr.pincode || "",
    },
    items: (o.OrderItem || []).map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      price: Number(i.price),
      mrp: Number(i.mrp),
      image: i.image,
      size: i.size,
      color: i.color,
      qty: i.quantity,
    })),
    subtotal: Number(o.subtotal) || 0,
    discount: Number(o.discount) || 0,
    shipping: Number(o.shipping) || 0,
    total: Number(o.totalAmount) || 0,
    couponCode: o.couponCode,
    paymentMethod: o.paymentMethod || "DEMO_RAZORPAY",
    notes: o.notes ?? undefined,
    razorpayOrderId: o.razorpayOrderId,
    razorpayPayId: o.razorpayPayId,
  };
}

function productToRow(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description || "",
    care: p.care ?? null,
    fabric: p.fabric ?? null,
    mrp: p.mrp,
    price: p.price,
    images: p.images || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    stock: p.stock,
    sold: p.sold || 0,
    rating: p.rating ?? 5,
    reviewCount: p.reviewCount ?? 0,
    badges: p.badges || [],
    tags: p.tags || [],
    featured: Boolean(p.featured),
    updatedAt: new Date().toISOString(),
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await sb()
    .from("Product")
    .select("*")
    .order("createdAt", { ascending: false });
  if (error) throw new Error(`getProducts: ${error.message}`);
  return ((data || []) as DbProduct[]).map(mapProduct);
}

export async function getProductBySlugServer(slug: string) {
  const { data, error } = await sb()
    .from("Product")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? mapProduct(data as DbProduct) : null;
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await sb().from("Coupon").select("*");
  if (error) throw new Error(`getCoupons: ${error.message}`);
  return ((data || []) as DbCoupon[]).map(mapCoupon);
}

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await sb()
    .from("SiteSettings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`getSettings: ${error.message}`);
  if (!data) {
return {
      name: SITE.name || "Kalaa Krityy",
      tagline: SITE.tagline || "A Unit of Krity Creations",
      phone: SITE.phone,
      phoneRaw: SITE.phoneRaw,
      email: SITE.email,
      address: SITE.address,
      registration: SITE.registration,
      announcement: SITE.announcement,
      whatsappEnabled: true,
    };
  }
  return {
    name: data.name,
    tagline: data.tagline,
    phone: data.phone,
    phoneRaw: data.phoneRaw,
    email: data.email,
    address: data.address,
    registration: data.registration,
    announcement: data.announcement,
    whatsappEnabled: data.whatsappEnabled,
  };
}

export async function upsertProduct(product: Product): Promise<Product> {
  const row = productToRow(product);
  const { data: existing } = await sb()
    .from("Product")
    .select("id")
    .eq("id", product.id)
    .maybeSingle();

  if (!existing) {
    const { data, error } = await sb()
      .from("Product")
      .insert({
        ...row,
        createdAt: product.createdAt
          ? new Date(product.createdAt).toISOString()
          : new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw new Error(`createProduct: ${error.message}`);
    return mapProduct(data as DbProduct);
  }

  const { data, error } = await sb()
    .from("Product")
    .update(row)
    .eq("id", product.id)
    .select("*")
    .single();
  if (error) throw new Error(`updateProduct: ${error.message}`);
  return mapProduct(data as DbProduct);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error, count } = await sb()
    .from("Product")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(`deleteProduct: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function upsertCoupon(coupon: Coupon): Promise<Coupon> {
  const row = {
    code: coupon.code.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    minOrder: coupon.minOrder,
    description: coupon.description,
    active: coupon.active,
    updatedAt: new Date().toISOString(),
  };
  const { data, error } = await sb()
    .from("Coupon")
    .upsert(row)
    .select("*")
    .single();
  if (error) throw new Error(`upsertCoupon: ${error.message}`);
  return mapCoupon(data as DbCoupon);
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const { error, count } = await sb()
    .from("Coupon")
    .delete({ count: "exact" })
    .eq("code", code.toUpperCase());
  if (error) throw new Error(`deleteCoupon: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function updateSettings(
  patch: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSettings();
  const next = { id: 1, ...current, ...patch };
  const { data, error } = await sb()
    .from("SiteSettings")
    .upsert(next)
    .select("*")
    .single();
  if (error) throw new Error(`updateSettings: ${error.message}`);
  return {
    name: data.name,
    tagline: data.tagline,
    phone: data.phone,
    phoneRaw: data.phoneRaw,
    email: data.email,
    address: data.address,
    registration: data.registration,
    announcement: data.announcement,
    whatsappEnabled: data.whatsappEnabled,
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await sb()
    .from("Order")
    .select("*")
    .order("createdAt", { ascending: false });
  if (error) throw new Error(`getOrders: ${error.message}`);

  const orders = (data || []) as DbOrderRow[];
  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const { data: items, error: itemsErr } = await sb()
    .from("OrderItem")
    .select("*")
    .in("orderId", ids);
  if (itemsErr) throw new Error(`getOrders items: ${itemsErr.message}`);

  const byOrder = new Map<string, DbOrderItemRow[]>();
  for (const it of (items || []) as DbOrderItemRow[]) {
    const list = byOrder.get(it.orderId) || [];
    list.push(it);
    byOrder.set(it.orderId, list);
  }

  return orders.map((o) =>
    mapOrder({ ...o, OrderItem: byOrder.get(o.id) || [] })
  );
}

export async function createOrder(order: Order): Promise<Order> {
  const orderId = newId("ord_");
  const orderNumber = order.id || `KK${Date.now().toString().slice(-10)}`;

  for (const item of order.items) {
    const { data: product, error } = await sb()
      .from("Product")
      .select("id, stock, sold")
      .eq("id", item.productId)
      .maybeSingle();
    if (error) throw new Error(`createOrder lookup: ${error.message}`);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
  }

  const status = order.status || "PENDING";
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
    });

  if (orderErr) throw new Error(`createOrder: ${orderErr.message}`);

  const itemRows = order.items.map((i) => ({
    id: newId("oi_"),
    orderId,
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    price: i.price,
    mrp: i.mrp,
    image: i.image,
    size: i.size || "Free Size",
    color: i.color || "",
    quantity: i.qty,
  }));

  const { error: itemsErr } = await sb().from("OrderItem").insert(itemRows);
  if (itemsErr) {
    await sb().from("Order").delete().eq("id", orderId);
    throw new Error(`createOrder items: ${itemsErr.message}`);
  }

  // Inventory is adjusted only when payment is confirmed (PAID)
  if (status === "PAID") {
    await applyInventoryForOrder(order.items);
  }

  const { data: full, error: fetchErr } = await sb()
    .from("Order")
    .select("*")
    .eq("id", orderId)
    .single();
  if (fetchErr) throw new Error(`createOrder fetch: ${fetchErr.message}`);
  const { data: createdItems } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", orderId);
  return mapOrder({
    ...(full as DbOrderRow),
    OrderItem: (createdItems || []) as DbOrderItemRow[],
  });
}

export async function updateOrderStatus(
  idOrNumber: string,
  status: OrderStatus
): Promise<Order | null> {
  // Try orderNumber first (what admin UI uses), then id
  let { data, error } = await sb()
    .from("Order")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("orderNumber", idOrNumber)
    .select("*")
    .maybeSingle();

  if (!data && !error) {
    const res = await sb()
      .from("Order")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", idOrNumber)
      .select("*")
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  if (!data) return null;
  const row = data as DbOrderRow;
  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", row.id);
  return mapOrder({ ...row, OrderItem: (items || []) as DbOrderItemRow[] });
}



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

export async function ensureSeededFromLocalCatalog() {
  const products = await getProducts().catch(() => [] as Product[]);
  if (products.length > 0) return { seeded: false, products: products.length };

  for (const p of seedProducts) {
    await upsertProduct({
      ...p,
      id: p.id.startsWith("p") ? `prod_${p.id}` : p.id,
    });
  }
  for (const c of seedCoupons) {
    await upsertCoupon(c);
  }
  await updateSettings({
    name: SITE.name,
    tagline: SITE.tagline,
    phone: SITE.phone,
    phoneRaw: SITE.phoneRaw,
    email: SITE.email,
    address: SITE.address,
    registration: SITE.registration,
    announcement: SITE.announcement,
    whatsappEnabled: true,
  });
  return { seeded: true, products: seedProducts.length };
}
