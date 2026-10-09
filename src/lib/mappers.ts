import type { Coupon, Product } from "@/types";
import type {
  Coupon as DbCoupon,
  Order as DbOrder,
  OrderItem as DbOrderItem,
  Product as DbProduct,
  SiteSettings as DbSettings,
} from "@/generated/prisma/client";

export function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description,
    care: p.care ?? undefined,
    fabric: p.fabric ?? undefined,
    mrp: p.mrp,
    price: p.price,
    images: p.images ?? [],
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    stock: p.stock,
    sold: p.sold,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badges: (p.badges ?? []).filter((b) =>
      ["new", "bestseller", "sale", "limited"].includes(b)
    ) as Product["badges"],
    tags: p.tags ?? [],
    featured: p.featured,
    createdAt: p.createdAt.toISOString().slice(0, 10),
  };
}

export function mapCoupon(c: DbCoupon): Coupon {
  return {
    code: c.code,
    type: c.type === "flat" ? "flat" : "percent",
    value: c.value,
    minOrder: c.minOrder,
    description: c.description,
    active: c.active,
  };
}

export function mapSettings(s: DbSettings | null) {
  if (!s) {
    return {
      name: "Kalaa Krityy",
      tagline: "Boutique & Training Center",
      phone: "79798 20645",
      phoneRaw: "917979820645",
      email: "kalaakrityy@gmail.com",
      address: "Vinay Tower, Patna, Bihar",
      registration: "BR-26-0018641",
      announcement: "",
      whatsappEnabled: true,
    };
  }
  return {
    name: s.name,
    tagline: s.tagline,
    phone: s.phone,
    phoneRaw: s.phoneRaw,
    email: s.email,
    address: s.address,
    registration: s.registration,
    announcement: s.announcement,
    whatsappEnabled: s.whatsappEnabled,
  };
}

/** Admin/storefront order shape used by existing UI */
export function mapOrder(
  o: DbOrder & { items?: DbOrderItem[] }
) {
  const addr =
    typeof o.shippingAddress === "object" && o.shippingAddress
      ? (o.shippingAddress as Record<string, string>)
      : {};

  return {
    id: o.orderNumber,
    dbId: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    customer: {
      name: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail ?? undefined,
      address: addr.address || "",
      city: addr.city || "Patna",
      pincode: addr.pincode || "",
    },
    items: (o.items || []).map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      price: i.price,
      mrp: i.mrp,
      image: i.image,
      size: i.size,
      color: i.color,
      qty: i.quantity,
    })),
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.totalAmount,
    couponCode: o.couponCode,
    paymentMethod: o.paymentMethod,
    notes: o.notes ?? undefined,
  };
}
