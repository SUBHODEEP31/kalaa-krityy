from pathlib import Path
p = Path("src/app/admin/page.tsx")
t = p.read_text(encoding="utf-8")

# Tab type
t = t.replace(
    'type Tab = "dashboard" | "products" | "coupons";',
    'type Tab = "dashboard" | "products" | "coupons" | "orders";',
)

# emptyForm fields
if "sizesText" not in t:
    t = t.replace(
        """const emptyForm = {
  name: "",
  categorySlug: "sarees",
  mrp: "",
  price: "",
  stock: "10",
  fabric: "",
  description: "",
  images: [] as string[],
  featured: true,
  bestseller: false,
};""",
        """const emptyForm = {
  name: "",
  categorySlug: "sarees",
  mrp: "",
  price: "",
  stock: "10",
  fabric: "",
  description: "",
  images: [] as string[],
  sizesText: "Free Size",
  colorsText: "#4A0E2E, #C9A227",
  featured: true,
  bestseller: false,
};""",
    )

# orders state after coupons state
if "const [orders" not in t:
    t = t.replace(
        "const [coupons, setCoupons] = useState<Coupon[]>([]);",
        """const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<any[]>([]);""",
    )

# load orders in load()
if 'fetch("/api/admin/orders"' not in t:
    t = t.replace(
        """      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/coupons", { cache: "no-store" }),
      ]);
      if (!pRes.ok || !cRes.ok) {
        router.replace("/admin/login");
        return;
      }
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products || []);
      setCoupons(cData.coupons || []);""",
        """      const [pRes, cRes, oRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/coupons", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
      ]);
      if (!pRes.ok || !cRes.ok) {
        router.replace("/admin/login");
        return;
      }
      const pData = await pRes.json();
      const cData = await cRes.json();
      const oData = oRes.ok ? await oRes.json() : { orders: [] };
      setProducts(pData.products || []);
      setCoupons(cData.coupons || []);
      setOrders(oData.orders || []);""",
    )

# startEdit sizes/colors
if "sizesText:" not in t:
    t = t.replace(
        """      images: [...p.images],
      featured: Boolean(p.featured),
      bestseller: p.badges.includes("bestseller"),
    });""",
        """      images: [...p.images],
      sizesText: (p.sizes || ["Free Size"]).join(", "),
      colorsText: (p.colors || ["#4A0E2E"]).join(", "),
      featured: Boolean(p.featured),
      bestseller: p.badges.includes("bestseller"),
    });""",
    )

# payload sizes colors
if "sizes:" not in t or "sizes: form" not in t:
    t = t.replace(
        """        images: form.images,
        featured: form.featured,
        badges: [""",
        """        images: form.images,
        sizes: form.sizesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colorsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        featured: form.featured,
        badges: [""",
    )

# sidebar nav item
if '"orders"' not in t and "Orders" not in t[t.find("as const"):t.find("as const")+400]:
    t = t.replace(
        """            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["products", "Products and stock", Package],
              ["coupons", "Coupons", Tag],
            ] as const""",
        """            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["products", "Products and stock", Package],
              ["coupons", "Coupons", Tag],
              ["orders", "Orders", Package],
            ] as const""",
    )

# stats card for orders
if "New orders" not in t:
    t = t.replace(
        '{ label: "Active coupons", value: stats.activeCoupons },',
        """{ label: "Active coupons", value: stats.activeCoupons },
                    { label: "Orders", value: orders.length },""",
    )

# form fields for size/color after fabric
if 'placeholder="Sizes' not in t and "sizesText" in t:
    t = t.replace(
        """                  <Input
                    placeholder="Fabric (optional)"
                    value={form.fabric}
                    onChange={(e) =>
                      setForm({ ...form, fabric: e.target.value })
                    }
                  />
                  <div className="md:col-span-2">""",
        """                  <Input
                    placeholder="Fabric (optional)"
                    value={form.fabric}
                    onChange={(e) =>
                      setForm({ ...form, fabric: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Sizes (comma separated, e.g. Free Size or S, M, L)"
                    value={form.sizesText}
                    onChange={(e) =>
                      setForm({ ...form, sizesText: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Colours (hex or names, e.g. #4A0E2E, Maroon)"
                    value={form.colorsText}
                    onChange={(e) =>
                      setForm({ ...form, colorsText: e.target.value })
                    }
                  />
                  <div className="md:col-span-2">""",
    )

# orders tab UI before final closing of space-y-6
orders_ui = r'''
          {tab === "orders" && (
            <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl text-wine mb-2">Orders</h2>
              <p className="text-sm text-muted mb-5">
                Customer payments land here with name, phone, address and items. Update status as you pack and ship. For urgent confirmations, WhatsApp the customer from their phone number.
              </p>
              <div className="space-y-4">
                {orders.length === 0 && (
                  <p className="text-sm text-muted py-8 text-center">
                    No orders yet. When a customer completes checkout, the order appears here instantly.
                  </p>
                )}
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-wine">{o.id}</p>
                        <p className="text-xs text-muted">
                          {new Date(o.createdAt).toLocaleString()} · {o.status}
                        </p>
                        <p className="text-sm mt-2">
                          {o.customer?.name} · {o.customer?.phone}
                        </p>
                        <p className="text-xs text-muted">
                          {o.customer?.address}, {o.customer?.city} {o.customer?.pincode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-wine">{formatINR(o.total || 0)}</p>
                        <p className="text-[11px] text-muted">
                          {o.couponCode ? `Coupon ${o.couponCode}` : "No coupon"}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-muted border-t border-line pt-3">
                      {(o.items || []).map((it: any, idx: number) => (
                        <li key={idx}>
                          {it.name} × {it.qty} · size {it.size} · {formatINR(it.price)}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant={o.status === st ? "primary" : "outline"}
                          onClick={async () => {
                            const res = await fetch(`/api/admin/orders/${o.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: st }),
                            });
                            if (!res.ok) {
                              toast.error("Status update failed");
                              return;
                            }
                            toast.success(`Order marked ${st}`);
                            await load();
                          }}
                        >
                          {st}
                        </Button>
                      ))}
                      <a
                        href={`https://wa.me/91${String(o.customer?.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                          `Hi ${o.customer?.name || ""}, update on your Kalaa Krityy order ${o.id}: status is ${o.status}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" variant="whatsapp">
                          WhatsApp customer
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
'''

if 'tab === "orders"' not in t:
    # insert before last closing of main content area - find coupons block end
    marker = '          {tab === "coupons" && ('
    # append after coupons section - find the closing pattern near end
    # simpler: insert before final `        </div>\n      </div>\n    </div>\n  );\n}`
    end = """        </div>
      </div>
    </div>
  );
}"""
    if end in t:
        t = t.replace(end, orders_ui + "\n" + end)
        print("orders_ui_added")
    else:
        print("end_marker_missing")

p.write_text(t, encoding="utf-8")
print("admin_patched", 'sizesText' in t, 'orders' in t)
