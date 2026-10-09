"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/types";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, couponCode, setCoupon, clear } = useCart();
  const [code, setCode] = useState(couponCode || "");
  const [discount, setDiscount] = useState(0);
  const [paying, setPaying] = useState(false);
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

  const onPay = async () => {
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
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email || undefined,
          contact: form.phone,
        },
        notes: {
          orderNumber: data.orderNumber,
        },
        theme: { color: "#4A0E2E" },
        modal: {
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
            try {
              sessionStorage.setItem(
                "kk-last-order",
                JSON.stringify({
                  orderNumber: verifyData.orderNumber,
                  total,
                  subtotal: base,
                  discount,
                  shipping,
                  customer: form,
                  items: items.map((i) => ({
                    name: i.name,
                    qty: i.qty,
                    size: i.size,
                    price: i.price,
                  })),
                })
              );
            } catch {
              /* ignore */
            }
            clear();
            toast.success("Payment successful");
            router.push(
              `/order-success?orderId=${encodeURIComponent(verifyData.orderNumber)}`
            );
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
      // keep paying true until modal dismiss/success sets it false
      setTimeout(() => setPaying(false), 500);
    }
  };

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Secure Checkout"
        title="Complete Your Order"
        subtitle="Pay safely via UPI, cards or netbanking powered by Razorpay. WhatsApp confirmation available."
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
            <div className="flex justify-between text-base font-semibold pt-2">
              <span>Total</span>
              <span className="text-wine">{formatINR(total)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-5"
            size="lg"
            onClick={onPay}
            disabled={paying}
          >
            {paying ? "Opening Razorpay…" : `Pay ${formatINR(total)}`}
          </Button>
          <p className="mt-3 text-[11px] text-center text-muted">
            Secured by Razorpay · UPI / Cards / Netbanking · PCI-DSS compliant
          </p>
          <p className="mt-2 text-[11px] text-center text-muted">
            By paying you agree to our{" "}
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
