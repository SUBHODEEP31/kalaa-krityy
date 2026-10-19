"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  MessageCircle,
  PackageSearch,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/catalog";
import {
  formatINR,
  ownerOrderWhatsAppLink,
  whatsappLink,
} from "@/lib/utils";

type LastOrder = {
  orderNumber: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  paymentMethod?: string;
  customer?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items?: Array<{ name: string; qty: number; size?: string; price: number }>;
};

function SuccessBody() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || params.get("order") || "";
  const payQ = params.get("pay") || "";
  const [last, setLast] = useState<LastOrder | null>(null);
  const [ownerOpened, setOwnerOpened] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kk-last-order");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastOrder;
      if (!orderId || parsed.orderNumber === orderId) setLast(parsed);
    } catch {
      /* ignore */
    }
  }, [orderId]);

  const paymentMethod =
    last?.paymentMethod || payQ || "ONLINE";

  const itemsSummary = useMemo(() => {
    if (!last?.items?.length) return "See order on website";
    return last.items
      .map((i) => `${i.name} x${i.qty}${i.size ? ` (${i.size})` : ""}`)
      .join(", ");
  }, [last]);

  const ownerHref = ownerOrderWhatsAppLink({
    orderNumber: orderId || last?.orderNumber || "N/A",
    total: last?.total ?? 0,
    paymentMethod,
    customer: last?.customer,
    items: last?.items,
  });

  // Auto-open owner WhatsApp once so boutique always gets the order ping
  useEffect(() => {
    if (!orderId || ownerOpened) return;
    const key = `kk-owner-wa-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) {
        setOwnerOpened(true);
        return;
      }
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      try {
        window.open(ownerHref, "_blank", "noopener,noreferrer");
      } catch {
        /* blocked popup — button remains */
      }
      setOwnerOpened(true);
    }, 600);
    return () => clearTimeout(t);
  }, [orderId, ownerHref, ownerOpened]);

  const isCod = /COD/i.test(paymentMethod);

  return (
    <div className="container-pro py-12 md:py-20 max-w-2xl pb-28">
      <div className="rounded-[28px] border border-line bg-white p-6 md:p-10 shadow-soft text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={32} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
          {isCod ? "COD order placed" : "Payment confirmed"}
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl text-wine">
          Thank you for shopping with us
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Your order is with {SITE.name} — {SITE.tagline}. Ready pieces usually
          dispatch in{" "}
          <strong className="text-wine">2–4 business days</strong>
          {isCod ? ". Please keep payment ready for delivery." : "."}
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl bg-cream/70 border border-line px-4 py-3 text-left space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted uppercase tracking-[0.16em]">
                  Order number
                </p>
                <p className="mt-1 font-semibold text-wine text-lg">{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted uppercase tracking-[0.16em]">
                  {isCod ? "Pay on delivery" : "Total paid"}
                </p>
                <p className="mt-1 font-semibold text-wine text-lg">
                  {formatINR(last?.total || 0)}
                </p>
                <p className="text-[11px] text-muted mt-0.5">{paymentMethod}</p>
              </div>
            </div>
            {last?.customer && (
              <p className="text-sm text-muted border-t border-line pt-2">
                Ship to: {last.customer.name} · {last.customer.phone}
                <br />
                {last.customer.address}, {last.customer.city}{" "}
                {last.customer.pincode}
              </p>
            )}
            {last?.items && last.items.length > 0 && (
              <ul className="text-sm text-muted border-t border-line pt-2 space-y-1">
                {last.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {it.name} × {it.qty}
                      {it.size ? ` · ${it.size}` : ""}
                    </span>
                    <span>{formatINR(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-3">
          <a href={ownerHref} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="whatsapp" className="w-full min-h-12" size="lg">
              <MessageCircle size={16} /> Send order to boutique WhatsApp
            </Button>
          </a>
          <p className="text-[11px] text-muted -mt-1">
            Opens chat with {SITE.phone} so the owner gets your order details
            {ownerOpened ? " (auto-opened once)" : ""}.
          </p>
          <a
            href={whatsappLink(
              orderId
                ? `Hello! My Kalaa Krityy order ${orderId} is placed (${paymentMethod}). Items: ${itemsSummary}. Total ${formatINR(last?.total || 0)}.`
                : `Hello Kalaa Krityy! I just placed an order.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full min-h-12" size="lg">
              <Share2 size={16} /> Keep a copy on my WhatsApp
            </Button>
          </a>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={
                orderId
                  ? `/track-order?orderId=${encodeURIComponent(orderId)}`
                  : "/track-order"
              }
              className="flex-1"
            >
              <Button variant="soft" className="w-full">
                <PackageSearch size={16} /> Track order
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button variant="ghost" className="w-full">
                Continue shopping
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted">
          Support: {SITE.phone} · {SITE.email} ·{" "}
          <a
            href="https://www.instagram.com/kalaa_krityy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-wine font-medium"
          >
            Instagram @{SITE.instagramHandle || "kalaa_krityy"}
          </a>
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-pro py-24 text-center text-muted">
          Loading…
        </div>
      }
    >
      <SuccessBody />
    </Suspense>
  );
}
