import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(mrp: number, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function whatsappLink(message: string, phone = "917979820645") {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Owner boutique WhatsApp number (receives all order alerts). */
export const OWNER_WHATSAPP = "917979820645";

export type OwnerNotifyOrder = {
  orderNumber: string;
  total: number;
  paymentMethod?: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  items?: Array<{
    name: string;
    qty: number;
    size?: string;
    color?: string;
    price?: number;
  }>;
};

function formatPaymentMethod(method?: string): string {
  if (!method) return "COD";
  if (/cod/i.test(method)) return "COD";
  if (
    /razorpay/i.test(method) ||
    /online/i.test(method) ||
    /paid/i.test(method)
  ) {
    return "Razorpay (PAID)";
  }
  return method;
}

function formatCustomerAddress(c?: {
  address?: string;
  city?: string;
  pincode?: string;
}): string {
  if (!c) return "—";
  const parts: string[] = [];
  if (c.address) parts.push(c.address.trim());
  if (c.city && !c.address?.toLowerCase().includes(c.city.toLowerCase())) {
    parts.push(c.city.trim());
  }
  let addrStr = parts.filter(Boolean).join(", ");
  if (c.pincode) {
    if (!addrStr.includes(c.pincode)) {
      addrStr = addrStr ? `${addrStr} - ${c.pincode.trim()}` : c.pincode.trim();
    }
  }
  return addrStr || "—";
}

/** Build the WhatsApp message the boutique owner receives for every order. */
export function ownerOrderAlertMessage(o: OwnerNotifyOrder): string {
  const itemsText =
    o.items && o.items.length > 0
      ? o.items
          .map((i) => {
            const variantParts = [i.size, i.color].filter(Boolean);
            const variant = variantParts.length
              ? ` (${variantParts.join(", ")})`
              : "";
            const itemTotal =
              typeof i.price === "number"
                ? ` - ₹${Number(i.price * i.qty).toLocaleString("en-IN")}`
                : "";
            return `• ${i.name}${variant} × ${i.qty}${itemTotal}`;
          })
          .join("\n")
      : "• No items specified";

  const paymentStr = formatPaymentMethod(o.paymentMethod);
  const c = o.customer;
  const addressStr = formatCustomerAddress(c);
  const amountStr = `₹${Number(o.total || 0).toLocaleString("en-IN")}`;

  return (
    `🛍️ *NEW ORDER RECEIVED - KALAA KRITYY*\n` +
    `-----------------------------------\n` +
    `*Order ID:* ${o.orderNumber}\n` +
    `*Payment:* ${paymentStr}\n` +
    `*Amount:* ${amountStr}\n\n` +
    `👤 *Customer Details:*\n` +
    `*Name:* ${c?.name?.trim() || "—"}\n` +
    `*Phone:* ${c?.phone?.trim() || "—"}\n` +
    `*Address:* ${addressStr}\n\n` +
    `📦 *Items:*\n` +
    `${itemsText}\n\n` +
    `-----------------------------------\n` +
    `Please review and prepare for dispatch.`
  );
}

export function ownerOrderWhatsAppLink(o: OwnerNotifyOrder) {
  return whatsappLink(ownerOrderAlertMessage(o), OWNER_WHATSAPP);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
