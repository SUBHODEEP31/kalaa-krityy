"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import type { Order } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/badge";
import { formatINR, whatsappLink, cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function stepIndex(status: string) {
  if (status === "CANCELLED") return -1;
  const i = STEPS.indexOf(status as (typeof STEPS)[number]);
  return i >= 0 ? i : 0;
}

function TrackBody() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("orderId") || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = params.get("orderId");
    if (q) setOrderNumber(q);
  }, [params]);

  const activeStep = useMemo(
    () => (order ? stepIndex(order.status) : -1),
    [order]
  );

const canCancel =
    !!order &&
    (order.status === "PENDING" ||
      order.status === "PAID" ||
      order.status === "PROCESSING");

  async function onLookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast.error("Enter order number and phone");
      return;
    }
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Order not found");
        return;
      }
      setOrder(data.order);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function submitCancelRequest() {
    if (!order) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/cancel-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.id,
          phone,
          reason: reason || "Customer requested cancellation",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit request");
        return;
      }
      setOrder(data.order);
      setShowCancel(false);
      toast.success("Cancellation request sent to boutique staff");
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const waCancel = order
    ? whatsappLink(
        `Hello Kalaa Krityy Support, I would like to cancel my order ${order.id} placed on ${new Date(order.createdAt).toLocaleDateString("en-IN")}. Customer Phone: ${phone}. Please process the refund to my original payment source.`
      )
    : "#";

  return (
    <div className="container-pro py-10 md:py-16 max-w-3xl">
      <SectionHeading
        eyebrow="Orders"
        title="Track your order"
        subtitle="Enter your order number and the phone used at checkout."
      />

      <form
        onSubmit={onLookup}
        className="rounded-3xl border border-line bg-white p-6 shadow-soft grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <Input
          placeholder="Order number (KK…)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
        />
        <Input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Search size={16} /> {loading ? "Searching…" : "Track"}
        </Button>
      </form>

      {order && (
        <div className="mt-8 rounded-3xl border border-line bg-white p-6 md:p-8 shadow-soft space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Order
              </p>
              <p className="font-display text-2xl text-wine">{order.id}</p>
              <p className="text-sm text-muted mt-1">
                Placed {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  order.status === "CANCELLED"
                    ? "bg-danger/10 text-danger"
                    : order.notes?.includes("CANCEL_REQUESTED")
                      ? "bg-gold/20 text-wine"
                      : "bg-cream text-wine"
                )}
              >
                {order.status}
                {order.notes?.includes("CANCEL_REQUESTED")
                  ? " · Cancel requested"
                  : ""}
              </span>
              <p className="mt-2 font-semibold text-wine">
                {formatINR(order.total)}
              </p>
            </div>
          </div>

          {order.status !== "CANCELLED" && (
            <div className="grid grid-cols-5 gap-2">
              {STEPS.map((step, i) => (
                <div key={step} className="text-center">
                  <div
                    className={cn(
                      "mx-auto h-2 rounded-full",
                      activeStep >= i ? "bg-wine" : "bg-line"
                    )}
                  />
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-muted">
                    {step === "PENDING" ? "Placed" : step}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-wine mb-2">Items</p>
            <ul className="space-y-1.5 text-sm text-muted">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span>
                    {it.name} × {it.qty}
                    {it.size ? ` · ${it.size}` : ""}
                  </span>
                  <span>{formatINR(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-muted border-t border-line pt-4">
            <p className="font-medium text-wine">Ship to</p>
            <p className="mt-1">
              {order.customer.name} · {order.customer.phone}
            </p>
            <p>
              {order.customer.address}, {order.customer.city}{" "}
              {order.customer.pincode}
            </p>
          </div>

          {canCancel && (
            <div className="rounded-2xl border border-dashed border-wine/25 bg-cream/40 p-4">
              <p className="text-sm text-wine font-medium">Need to cancel?</p>
              <p className="text-xs text-muted mt-1">
                Cancellations are accepted within 24 hours or before dispatch.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={() => setShowCancel(true)}
              >
                Request cancellation
              </Button>
            </div>
          )}

          {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
            <p className="text-sm text-muted">
              Order is already in transit or delivered. Please contact support
              upon delivery for returns / exchanges.
            </p>
          )}
        </div>
      )}

      {showCancel && order && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <button
            className="absolute inset-0 bg-wine-deep/40 backdrop-blur-sm"
            onClick={() => setShowCancel(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-ivory border border-line p-6 shadow-lift space-y-4">
            <h3 className="font-display text-xl text-wine">
              Cancel order {order.id}
            </h3>
            <p className="text-sm text-muted">
              Choose WhatsApp (fastest) or notify boutique staff in-app.
            </p>
            <a href={waCancel} target="_blank" rel="noreferrer" className="block">
              <Button variant="whatsapp" className="w-full">
                <MessageCircle size={16} /> WhatsApp cancellation
              </Button>
            </a>
            <div className="border-t border-line pt-4 space-y-2">
              <Input
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                className="w-full"
                variant="outline"
                disabled={submitting}
                onClick={submitCancelRequest}
              >
                {submitting ? "Sending…" : "Notify boutique in-app"}
              </Button>
            </div>
            <button
              className="text-xs text-muted underline w-full"
              onClick={() => setShowCancel(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Need help?{" "}
        <Link href="/contact" className="text-wine underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container-pro py-24 text-center text-muted">
          Loading…
        </div>
      }
    >
      <TrackBody />
    </Suspense>
  );
}
