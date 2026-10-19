"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard } from "lucide-react";
import type { Coupon } from "@/types";
import { useCart } from "@/store/cart";
import { cn, formatINR, ownerOrderWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/badge";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type PayMethod = "ONLINE" | "COD";

function applyCouponLocal(code: string, subtotal: number, coupons: Coupon[]) {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
  );
  if (!coupon) return { ok: false as const, error: "Invalid coupon code" };
  if (subtotal < coupon.minOrder)
    return {
      ok: false as const,
      error: `Minimum order ₹${coupon.minOrder.toLocaleString("en-IN")} required`,
    };
  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return {
    ok: true as const,
    coupon,
    discount: Math.min(discount, subtotal),
  };
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function stashLastOrder(payload: {
  orderNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  paymentMethod: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: Array<{ name: string; qty: number; size?: string; color?: string; price: number }>;
}) {
  try {
    sessionStorage.setItem("kk-last-order", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Open owner WhatsApp with full order alert (client receives every order). */
function notifyOwnerWhatsApp(payload: {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customer: { name: string; phone: string; address: string; city: string; pincode: string };
  items: Array<{ name: string; qty: number; size?: string; color?: string; price: number }>;
}) {
  const href = ownerOrderWhatsAppLink(payload);
  try {
    window.open(href, "_blank", "noopener,noreferrer");
  } catch {
    window.location.href = href;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, couponCode, setCoupon, clear } = useCart();
  const [code, setCode] = useState(couponCode || "");
  const [discount, setDiscount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("ONLINE");
  const [liveCoupons, setLiveCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Patna",
    pincode: "",
  });

  useEffect(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLiveCoupons(d.allCoupons || d.coupons || []))
      .catch(() => {});
    loadRazorpayScript();
  }, []);

  const base = subtotal();
  const shipping = base >= 2999 || base === 0 ? 0 : 99;
  const total = Math.max(0, base - discount + shipping);

  const appliedLabel = useMemo(() => {
    if (!couponCode || !discount) return null;
    return `${couponCode} (−${formatINR(discount)})`;
  }, [couponCode, discount]);

  if (items.length === 0) {
    return (
      <div className="container-pro py-24 text-center">
        <h1 className="font-display text-3xl text-wine">Nothing to checkout</h1>
        <Link href="/shop" className="mt-4 inline-block underline text-sm">
          Browse collection
        </Link>
      </div>
    );
  }

  const onApply = () => {
    const res = applyCouponLocal(code, base, liveCoupons);
    if (!res.ok) {
      toast.error(res.error);
      setDiscount(0);
      setCoupon(null);
      return;
    }
    setDiscount(res.discount);
    setCoupon(res.coupon.code);
    const detail =
      res.coupon.type === "percent"
        ? `${res.coupon.value}% OFF on orders above ₹${res.coupon.minOrder.toLocaleString("en-IN")}`
        : `Flat ₹${res.coupon.value} OFF on orders above ₹${res.coupon.minOrder.toLocaleString("en-IN")}`;
    toast.success(`${res.coupon.code} applied · ${detail}`);
  };

  const lineItems = () =>
    items.map((i) => ({
      name: i.name,
      qty: i.qty,
      size: i.size,
      color: i.color,
      price: i.price,
    }));

  const finishSuccess = (orderNumber: string, method: string) => {
    const payload = {
      orderNumber,
      total,
      subtotal: base,
      discount,
      shipping,
      paymentMethod: method,
      customer: form,
      items: lineItems(),
    };
    stashLastOrder(payload);
    notifyOwnerWhatsApp({
      orderNumber,
      total,
      paymentMethod: method,
      customer: form,
      items: lineItems(),
    });
    clear();
    toast.success(
      method === "COD" ? "COD order placed — boutique notified" : "Payment successful"
    );
    router.push(
      `/order-success?orderId=${encodeURIComponent(orderNumber)}&pay=${encodeURIComponent(method)}`
    );
  };

  const onCod = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error("Please fill required address fields");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          subtotal: base,
          discount,
          shipping,
          total,
          couponCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not place COD order");
        return;
      }
      finishSuccess(data.orderNumber, "COD");
    } catch {
      toast.error("Network error placing COD order");
    } finally {
      setPaying(false);
    }
  };

  const onPayOnline = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error("Please fill required address fields");
      return;
    }
    setPaying(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        toast.error("Could not load Razorpay checkout");
        return;
      }

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          subtotal: base,
          discount,
          shipping,
          total,
          couponCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not start payment");
        return;
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Kalaa Krityy",
        description: "A Unit of Krity Creations",
        image: "/logo.png",
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email || "kalaakrityy@gmail.com",
          contact: form.phone,
        },
        notes: {
          orderNumber: data.orderNumber,
        },
        theme: { color: "#6B1D3A" },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI / QR (Instant)",
                instruments: [{ method: "upi" }],
              },
              other: {
                name: "Cards / NetBanking",
                instruments: [{ method: "card" }, { method: "netbanking" }],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            toast.message("Payment cancelled. Your cart items are preserved.");
            setPaying(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                orderNumber: data.orderNumber,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              toast.error(verifyData.error || "Payment verification failed");
              setPaying(false);
              return;
            }
            finishSuccess(verifyData.orderNumber, "ONLINE / Razorpay");
          } catch {
            toast.error("Could not verify payment");
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Network error while starting payment");
    } finally {
      setTimeout(() => setPaying(false), 500);
    }
  };

  const onPlace = () => {
    if (payMethod === "COD") return onCod();
    return onPayOnline();
  };

  return (
    <div className="container-pro py-10 md:py-16 pb-28">
      <SectionHeading
        eyebrow="Secure Checkout"
        title="Complete Your Order"
        subtitle="Pay online (UPI / cards) via Razorpay, or choose Cash on Delivery. Boutique owner is notified on WhatsApp instantly."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-display text-xl text-wine mb-4">
              Shipping details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Full name *", "name"],
                  ["Phone *", "phone"],
                  ["Email", "email"],
                  ["City", "city"],
                  ["Pincode *", "pincode"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="text-xs text-muted space-y-1.5">
                  <span>{label}</span>
                  <Input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <label className="text-xs text-muted space-y-1.5 sm:col-span-2">
                <span>Address *</span>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-display text-xl text-wine mb-4">
              Payment method
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={cn(
                  "relative flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer select-none",
                  payMethod === "ONLINE"
                    ? "border-wine bg-wine/5 ring-2 ring-wine/20 shadow-xs"
                    : "border-line hover:border-wine/30 bg-white"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={payMethod === "ONLINE"}
                  onChange={() => setPayMethod("ONLINE")}
                  className="mt-1 h-4 w-4 accent-wine cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-wine font-semibold text-sm leading-snug">
                    <CreditCard size={18} className="shrink-0 text-wine" />
                    <span>Pay Online via UPI / QR / Cards (Instant via Razorpay)</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    UPI · QR · Cards · Netbanking (Fast, secure & instant confirmation via Razorpay)
                  </p>
                </div>
              </label>

              <label
                className={cn(
                  "relative flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer select-none",
                  payMethod === "COD"
                    ? "border-wine bg-wine/5 ring-2 ring-wine/20 shadow-xs"
                    : "border-line hover:border-wine/30 bg-white"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={payMethod === "COD"}
                  onChange={() => setPayMethod("COD")}
                  className="mt-1 h-4 w-4 accent-wine cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-wine font-semibold text-sm leading-snug">
                    <Banknote size={18} className="shrink-0 text-wine" />
                    <span>Cash on Delivery (COD) - Pay upon delivery</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    Pay in cash or UPI directly to the courier partner when your parcel arrives.
                  </p>
                </div>
              </label>
            </div>
            {payMethod === "COD" && (
              <p className="mt-3 text-xs text-muted rounded-xl bg-cream/60 border border-line px-3 py-2">
                COD orders stay <strong className="text-wine">PENDING</strong> until
                delivery. Please keep exact change ready when possible.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-display text-xl text-wine mb-4">Coupon code</h3>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="KALAA10"
              />
              <Button type="button" variant="outline" onClick={onApply}>
                Apply
              </Button>
            </div>
            {appliedLabel && (
              <p className="mt-2 text-sm text-success">{appliedLabel}</p>
            )}
            {liveCoupons.filter((c) => c.active).length > 0 && (
              <ul className="mt-4 space-y-2">
                {liveCoupons
                  .filter((c) => c.active)
                  .slice(0, 6)
                  .map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => {
                          setCode(c.code);
                          const res = applyCouponLocal(c.code, base, liveCoupons);
                          if (!res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          setDiscount(res.discount);
                          setCoupon(res.coupon.code);
                          toast.success(
                            res.coupon.type === "percent"
                              ? `${c.code}: ${c.value}% OFF on orders above ₹${c.minOrder.toLocaleString("en-IN")}`
                              : `${c.code}: Flat ₹${c.value} OFF on orders above ₹${c.minOrder.toLocaleString("en-IN")}`
                          );
                        }}
                        className="w-full text-left rounded-2xl border border-dashed border-gold/40 bg-cream/40 px-3 py-2 hover:border-wine/30 transition"
                      >
                        <span className="font-semibold text-wine tracking-wide">
                          {c.code}
                        </span>
                        <span className="block text-xs text-muted mt-0.5">
                          {c.type === "percent"
                            ? `${c.value}% OFF on orders above ₹${c.minOrder.toLocaleString("en-IN")}`
                            : `Flat ₹${c.value} OFF on orders above ₹${c.minOrder.toLocaleString("en-IN")}`}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-cream/50 p-6 sticky top-28">
          <h3 className="font-display text-xl text-wine">Payment summary</h3>
          <ul className="mt-4 space-y-2 text-sm max-h-48 overflow-auto">
            {items.map((i) => (
              <li
                key={`${i.productId}-${i.size}`}
                className="flex justify-between gap-3"
              >
                <span className="text-muted line-clamp-1">
                  {i.name} × {i.qty}
                </span>
                <span>{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatINR(base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Discount</span>
              <span className="text-success">−{formatINR(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Method</span>
              <span className="font-medium text-wine">
                {payMethod === "COD" ? "Cash on Delivery (COD)" : "Pay Online (Razorpay)"}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2">
              <span>Total</span>
              <span className="text-wine">{formatINR(total)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-5"
            size="lg"
            onClick={onPlace}
            disabled={paying}
          >
            {paying
              ? payMethod === "COD"
                ? "Placing Order (Cash on Delivery)…"
                : "Opening Razorpay…"
              : payMethod === "COD"
                ? "Place Order (Cash on Delivery)"
                : "Pay Now"}
          </Button>
          <p className="mt-3 text-[11px] text-center text-muted">
            {payMethod === "COD"
              ? "Boutique owner is alerted on WhatsApp instantly (+91 79798 20645)"
              : "Secured by Razorpay · Instant UPI / Cards · Boutique owner alerted on WhatsApp"}
          </p>
          <p className="mt-2 text-[11px] text-center text-muted">
            By ordering you agree to our{" "}
            <Link href="/terms-and-conditions" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/cancellation-refund-policy" className="underline">
              Refund Policy
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
