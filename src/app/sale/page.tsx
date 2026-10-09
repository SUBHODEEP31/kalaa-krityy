"use client";

import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading, Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { useCatalog } from "@/lib/use-catalog";
import { toast } from "sonner";
import { useMemo } from "react";

export default function SalePage() {
  const { products, coupons, loading } = useCatalog(true);

  const sale = useMemo(
    () =>
      products
        .filter((p) => p.mrp > p.price)
        .sort((a, b) => b.mrp - b.price - (a.mrp - a.price)),
    [products]
  );

  const activeCoupons = coupons.filter((c) => c.active);

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Offers"
        title="Sale and Coupon Codes"
        subtitle="Discounted atelier pieces and launch codes you can apply at checkout."
      />

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeCoupons.map((c) => (
          <button
            key={c.code}
            onClick={() => {
              navigator.clipboard?.writeText(c.code);
              toast.success(`Copied ${c.code}`);
            }}
            className="rounded-3xl border border-dashed border-gold/60 bg-white p-5 text-left hover-lift"
          >
            <Badge tone="gold">Tap to copy</Badge>
            <p className="mt-3 font-display text-2xl text-wine">{c.code}</p>
            <p className="mt-1 text-sm text-muted">{c.description}</p>
            <p className="mt-2 text-xs text-muted">
              Min order {formatINR(c.minOrder)} ·{" "}
              {c.type === "percent" ? `${c.value}%` : formatINR(c.value)} off
            </p>
          </button>
        ))}
        {!loading && activeCoupons.length === 0 && (
          <p className="text-sm text-muted col-span-full">No active coupons right now.</p>
        )}
      </div>

      <h3 className="font-display text-2xl text-wine mb-6">Discounted pieces</h3>
      <ProductGrid products={sale} />
    </div>
  );
}
