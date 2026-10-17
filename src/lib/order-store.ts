import { randomBytes } from "crypto";
import type { Order, OrderItem, OrderStatus } from "@/lib/db";
import { products as seedProducts } from "@/data/catalog";

/**
 * When Supabase is unreachable (common if env/tables missing on Vercel),
 * keep orders in-process so checkout + admin still work on a warm instance.
 * Supabase remains the source of truth when healthy.
 */
const g = globalThis as unknown as {
  __kkOrders?: Map<string, Order>;
};

function mem() {
  if (!g.__kkOrders) g.__kkOrders = new Map();
  return g.__kkOrders;
}

export function memorySaveOrder(order: Order) {
  mem().set(order.id, order);
  if (order.razorpayOrderId) mem().set(`rzp:${order.razorpayOrderId}`, order);
}

export function memoryGetByOrderNumber(orderNumber: string) {
  return mem().get(orderNumber) || null;
}

export function memoryGetByRazorpayId(rzpId: string) {
  return mem().get(`rzp:${rzpId}`) || null;
}

export function memoryListOrders(): Order[] {
  const seen = new Set<string>();
  const out: Order[] = [];
  for (const [k, o] of mem().entries()) {
    if (k.startsWith("rzp:")) continue;
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    out.push(o);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function memoryUpdateOrder(
  orderNumber: string,
  patch: Partial<Order>
): Order | null {
  const cur = mem().get(orderNumber);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  memorySaveOrder(next);
  return next;
}

export function newOrderId(prefix = "ord_") {
  return `${prefix}${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}

/** Build a minimal product stub from a cart line (for FK / offline). */
export function stubProductFromItem(item: OrderItem) {
  const seed = seedProducts.find(
    (p) => p.id === item.productId || p.slug === item.slug
  );
  return {
    id: item.productId || seed?.id || `p-${item.slug || Date.now()}`,
    slug: item.slug || seed?.slug || item.productId,
    name: item.name || seed?.name || "Boutique item",
    category: seed?.category || "Shop",
    categorySlug: seed?.categorySlug || "shop",
    description: seed?.description || "Ordered via Kalaa Krityy checkout",
    care: seed?.care ?? null,
    fabric: seed?.fabric ?? null,
    mrp: item.mrp || seed?.mrp || item.price,
    price: item.price || seed?.price || 0,
    images: item.image ? [item.image] : seed?.images || [],
    colors: item.color ? [item.color] : seed?.colors || ["#4A0E2E"],
    sizes: item.size ? [item.size] : seed?.sizes || ["Free Size"],
    stock: seed?.stock ?? 99,
    sold: seed?.sold ?? 0,
    rating: seed?.rating ?? 5,
    reviewCount: seed?.reviewCount ?? 0,
    badges: seed?.badges || [],
    tags: seed?.tags || ["checkout"],
    featured: Boolean(seed?.featured),
    createdAt: seed?.createdAt || new Date().toISOString().slice(0, 10),
  };
}

export function buildMemoryOrder(input: {
  orderNumber: string;
  status?: OrderStatus;
  customer: Order["customer"];
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod?: string;
  razorpayOrderId?: string | null;
  razorpayPayId?: string | null;
  notes?: string;
}): Order {
  const order: Order = {
    id: input.orderNumber,
    createdAt: new Date().toISOString(),
    status: input.status || "PENDING",
    customer: input.customer,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping: input.shipping,
    total: input.total,
    couponCode: input.couponCode ?? null,
    paymentMethod: input.paymentMethod || "RAZORPAY",
    notes: input.notes,
    razorpayOrderId: input.razorpayOrderId ?? null,
    razorpayPayId: input.razorpayPayId ?? null,
  };
  memorySaveOrder(order);
  return order;
}
