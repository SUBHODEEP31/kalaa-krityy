from pathlib import Path

p = Path("src/app/checkout/page.tsx")
t = p.read_text(encoding="utf-8")

t = t.replace(
    'import { useMemo, useState } from "react";',
    'import { useEffect, useMemo, useState } from "react";',
)

t = t.replace(
    'import { applyCoupon } from "@/data/catalog";',
    '''import type { Coupon } from "@/types";

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
}''',
)

if "const [liveCoupons" not in t:
    t = t.replace(
        "const [paying, setPaying] = useState(false);",
        '''const [paying, setPaying] = useState(false);
  const [liveCoupons, setLiveCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLiveCoupons(d.allCoupons || d.coupons || []))
      .catch(() => {});
  }, []);''',
    )

t = t.replace(
    "const res = applyCoupon(code, base);",
    "const res = applyCouponLocal(code, base, liveCoupons);",
)

p.write_text(t, encoding="utf-8")
print("checkout_ok")
