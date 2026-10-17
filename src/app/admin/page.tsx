"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
  Minus,
  RefreshCw,
} from "lucide-react";
import type { Coupon, Product } from "@/types";
import { categories } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ColorPalettePicker } from "@/components/admin/color-palette-picker";
import { cn, formatINR, discountPercent } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "dashboard" | "products" | "coupons" | "orders";

const emptyForm = {
  name: "",
  categorySlug: "sarees",
  mrp: "",
  price: "",
  stock: "10",
  fabric: "",
  description: "",
  images: [] as string[],
  sizesText: "Free Size",
  colors: ["#4A0E2E", "#C9A227"] as string[],
  featured: true,
  bestseller: false,
};

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent" as "percent" | "flat",
    value: "",
    minOrder: "0",
    description: "",
  });
  const [query, setQuery] = useState("");

const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (me.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!me.ok) {
        toast.error("Could not verify owner session. Retrying…");
        setReady(false);
        return;
      }
      const meData = await me.json();
      setEmail(meData.user?.email || "");

      const [pRes, cRes, oRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store", credentials: "include" }),
        fetch("/api/admin/coupons", { cache: "no-store", credentials: "include" }),
        fetch("/api/admin/orders", { cache: "no-store", credentials: "include" }),
      ]);

      // Only treat 401 as auth failure — data/API errors should not bounce to login
      if (pRes.status === 401 || cRes.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!pRes.ok || !cRes.ok) {
        const errBody = !pRes.ok ? await pRes.text() : await cRes.text();
        console.error("[admin load]", pRes.status, cRes.status, errBody);
        toast.error(
          "Owner session is valid but catalog APIs failed. Check Supabase env on Vercel."
        );
        setProducts([]);
        setCoupons([]);
        setOrders([]);
        setReady(true);
        return;
      }
      const pData = await pRes.json();
      const cData = await cRes.json();
      const oData = oRes.ok ? await oRes.json() : { orders: [] };
      setProducts(pData.products || []);
      setCoupons(cData.coupons || []);
      setOrders(oData.orders || []);
      setReady(true);
    } catch (err) {
      console.error("[admin load]", err);
      toast.error("Network error loading owner console");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const onSale = products.filter((p) => p.mrp > p.price).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const out = products.filter((p) => p.stock <= 0).length;
    const inventory = products.reduce((s, p) => s + p.stock, 0);
    const activeCoupons = coupons.filter((c) => c.active).length;
    return {
      total: products.length,
      onSale,
      lowStock,
      out,
      inventory,
      activeCoupons,
    };
  }, [products, coupons]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.includes(q)
    );
  }, [products, query]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || `Upload failed: ${file.name}`);
          continue;
        }
        urls.push(data.url);
      }
      if (urls.length) {
        setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
        toast.success(`${urls.length} file(s) uploaded`);
      }
    } finally {
      setUploading(false);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categorySlug: p.categorySlug,
      mrp: String(p.mrp),
      price: String(p.price),
      stock: String(p.stock),
      fabric: p.fabric || "",
      description: p.description || "",
      images: [...p.images],
sizesText: (p.sizes || ["Free Size"]).join(", "),
      colors: [...(p.colors || ["#4A0E2E"])],
      featured: Boolean(p.featured),
      bestseller: p.badges.includes("bestseller"),
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveProduct() {
    if (!form.name || !form.mrp || !form.price) {
      toast.error("Name, MRP and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        categorySlug: form.categorySlug,
        mrp: Number(form.mrp),
        price: Number(form.price),
        stock: Number(form.stock),
        fabric: form.fabric,
        description: form.description,
        images: form.images,
sizes: form.sizesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors.length ? form.colors : ["#4A0E2E"],
        featured: form.featured,
        badges: [
          "new",
          ...(form.bestseller ? (["bestseller"] as const) : []),
          ...(Number(form.mrp) > Number(form.price)
            ? (["sale"] as const)
            : []),
        ],
      };

      const res = editingId
        ? await fetch(`/api/admin/products/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Save failed");
        return;
      }
      toast.success(
        editingId ? "Product updated" : "Product added to storefront"
      );
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function adjustStock(p: Product, delta: number) {
    const stock = Math.max(0, p.stock + delta);
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    if (!res.ok) {
      toast.error("Stock update failed");
      return;
    }
    setProducts((list) =>
      list.map((x) => (x.id === p.id ? { ...x, stock } : x))
    );
  }

  async function removeProduct(id: string) {
    if (!confirm("Remove this product from the storefront?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Product removed");
    if (editingId === id) resetForm();
    await load();
  }

  async function saveCoupon() {
    if (!couponForm.code || !couponForm.value) {
      toast.error("Code and value required");
      return;
    }
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder || 0),
        description: couponForm.description,
        active: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Coupon save failed");
      return;
    }
    toast.success(`Coupon ${data.coupon.code} saved`);
    setCouponForm({
      code: "",
      type: "percent",
      value: "",
      minOrder: "0",
      description: "",
    });
    await load();
  }

  async function toggleCoupon(c: Coupon) {
    const res = await fetch(
      `/api/admin/coupons/${encodeURIComponent(c.code)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      }
    );
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    await load();
  }

  async function removeCoupon(code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Coupon deleted");
    await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!ready || loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="animate-spin" size={18} /> Loading owner console…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea]">
      <header className="royal-gradient text-cream">
        <div className="container-pro py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-pale">
              Secure owner console
            </p>
            <h1 className="font-display text-2xl md:text-3xl">
              Kalaa Krityy · Seller Hub
            </h1>
            <p className="text-xs text-cream/70 mt-1">{email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" size="sm" onClick={() => load()}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Link href="/" target="_blank">
              <Button variant="gold" size="sm">
                View storefront
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="border-cream/30 text-cream hover:bg-cream hover:text-wine"
              onClick={logout}
            >
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-pro py-8 grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-3xl border border-line bg-white p-3 space-y-1 sticky top-6 shadow-soft">
          {(
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["products", "Products and stock", Package],
              ["coupons", "Coupons", Tag],
              ["orders", "Orders", Package],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "w-full flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition",
                tab === id ? "bg-wine text-cream" : "hover:bg-cream text-ink"
              )}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
          <div className="pt-3 mt-2 border-t border-line px-2 text-[11px] text-muted leading-relaxed">
            Upload photos or videos, set price and discount, control stock,
            launch coupon codes. Changes appear on the live shop immediately.
          </div>
        </aside>

        <div className="space-y-6 min-w-0">
          {tab === "dashboard" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(
                  [
                    { label: "Total products", value: stats.total },
                    { label: "On discount", value: stats.onSale },
                    { label: "Units in stock", value: stats.inventory },
                    { label: "Low stock", value: stats.lowStock },
                    { label: "Out of stock", value: stats.out },
                    { label: "Active coupons", value: stats.activeCoupons },
                    { label: "Orders", value: orders.length },
                  ] as const
                ).map((c) => (
                  <div
                    key={c.label}
                    className="rounded-3xl border border-line bg-white p-5 shadow-soft"
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                      {c.label}
                    </p>
                    <p className="mt-2 font-display text-3xl text-wine">
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <h2 className="font-display text-xl text-wine">Quick start</h2>
                <ol className="mt-3 space-y-2 text-sm text-muted list-decimal pl-5">
                  <li>
                    Open <strong>Products and stock</strong>
                  </li>
                  <li>Upload suit or saree photos (or short video)</li>
                  <li>Set MRP, selling price (auto discount %), and stock</li>
                  <li>Save — item shows on Shop, Home rails and Sale page</li>
                  <li>Create coupons under Coupons tab for checkout</li>
                </ol>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => setTab("products")}>
                    <Plus size={16} /> Add product
                  </Button>
                  <Button variant="outline" onClick={() => setTab("coupons")}>
                    Manage coupons
                  </Button>
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-xl text-wine">
                    {editingId ? "Edit product" : "Add product"}
                  </h2>
                  {editingId && (
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                      Cancel edit
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Product name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <select
                    className="h-12 rounded-2xl border border-line bg-white px-4 text-sm"
                    value={form.categorySlug}
                    onChange={(e) =>
                      setForm({ ...form, categorySlug: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="MRP *"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Selling price *"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Stock quantity"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                  <Input
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
                  <div className="md:col-span-2">
                    <ColorPalettePicker
                      value={form.colors}
                      onChange={(colors) => setForm({ ...form, colors })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                {form.mrp &&
                  form.price &&
                  Number(form.mrp) > Number(form.price) && (
                    <p className="mt-3 text-sm text-success">
                      Auto discount:{" "}
                      {discountPercent(Number(form.mrp), Number(form.price))}%
                      OFF · Customer saves{" "}
                      {formatINR(Number(form.mrp) - Number(form.price))}
                    </p>
                  )}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted mb-2">
                    Photos / video
                  </p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-wine/25 bg-cream/50 px-4 py-8 hover:bg-cream transition">
                    {uploading ? (
                      <Loader2 className="animate-spin text-wine" />
                    ) : (
                      <Upload className="text-wine" />
                    )}
                    <span className="text-sm text-wine font-medium">
                      {uploading
                        ? "Uploading…"
                        : "Click to upload images or MP4/WebM"}
                    </span>
                    <span className="text-[11px] text-muted">
                      Max 12MB each · JPEG PNG WebP GIF MP4 WebM
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        uploadFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {form.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {form.images.map((src) => (
                        <div
                          key={src}
                          className="relative h-24 w-20 overflow-hidden rounded-xl border border-line bg-cream-dark group"
                        >
                          {src.match(/\.(mp4|webm)$/i) ? (
                            <video
                              src={src}
                              className="h-full w-full object-cover"
                              muted
                            />
                          ) : (
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized={src.startsWith("/uploads")}
                            />
                          )}
                          <button
                            type="button"
                            className="absolute inset-x-0 bottom-0 bg-wine/90 text-cream text-[10px] py-1 opacity-0 group-hover:opacity-100"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                images: f.images.filter((x) => x !== src),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <Input
                      placeholder="Or paste image URL and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = (e.target as HTMLInputElement).value.trim();
                          if (v) {
                            setForm((f) => ({
                              ...f,
                              images: [...f.images, v],
                            }));
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.checked })
                      }
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.bestseller}
                      onChange={(e) =>
                        setForm({ ...form, bestseller: e.target.checked })
                      }
                    />
                    Bestseller badge
                  </label>
                </div>

                <div className="mt-5">
                  <Button onClick={saveProduct} disabled={saving || uploading}>
                    {saving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : editingId ? (
                      <Pencil size={16} />
                    ) : (
                      <ImagePlus size={16} />
                    )}
                    {editingId ? "Update product" : "Publish to storefront"}
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white overflow-hidden shadow-soft">
                <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-wine">
                    Inventory ({products.length})
                  </h3>
                  <Input
                    className="max-w-xs h-10"
                    placeholder="Search products…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="divide-y divide-line max-h-[640px] overflow-auto">
                  {filtered.map((p) => {
                    const off = discountPercent(p.mrp, p.price);
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-cream/40"
                      >
                        <div className="relative h-16 w-14 overflow-hidden rounded-lg bg-cream-dark shrink-0">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            unoptimized={p.images[0]?.startsWith("/uploads")}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-wine truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted">
                            {p.category} · {formatINR(p.price)}
                            {off > 0 ? ` (-${off}%)` : ""} · MRP{" "}
                            {formatINR(p.mrp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-line px-1">
                          <button
                            className="h-8 w-8 grid place-items-center"
                            onClick={() => adjustStock(p, -1)}
                            aria-label="Decrease stock"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">
                            {p.stock}
                          </span>
                          <button
                            className="h-8 w-8 grid place-items-center"
                            onClick={() => adjustStock(p, 1)}
                            aria-label="Increase stock"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(p)}
                          >
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeProduct(p.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="p-8 text-center text-sm text-muted">
                      No products match.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "coupons" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <h2 className="font-display text-xl text-wine mb-4">
                  Create or update coupon
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="CODE (e.g. DIWALI20)"
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <select
                    className="h-12 rounded-2xl border border-line bg-white px-4 text-sm"
                    value={couponForm.type}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        type: e.target.value as "percent" | "flat",
                      })
                    }
                  >
                    <option value="percent">Percent %</option>
                    <option value="flat">Flat amount</option>
                  </select>
                  <Input
                    type="number"
                    placeholder={
                      couponForm.type === "percent"
                        ? "Percent value"
                        : "Amount value"
                    }
                    value={couponForm.value}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, value: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Min order"
                    value={couponForm.minOrder}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        minOrder: e.target.value,
                      })
                    }
                  />
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Description shown to customers"
                      value={couponForm.description}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={saveCoupon}>
                  <Plus size={16} /> Save coupon
                </Button>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <h3 className="font-display text-xl text-wine mb-4">
                  All coupons
                </h3>
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-wine tracking-wide">
                          {c.code}
                        </p>
                        <p className="text-xs text-muted">{c.description}</p>
                        <p className="text-[11px] text-muted mt-0.5">
                          {c.type === "percent"
                            ? `${c.value}%`
                            : formatINR(c.value)}{" "}
                          · min {formatINR(c.minOrder)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={c.active ? "primary" : "outline"}
                          onClick={() => toggleCoupon(c)}
                        >
                          {c.active ? "Active" : "Off"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCoupon(c.code)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

{tab === "orders" && (
            <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl text-wine mb-2">Orders</h2>
              <p className="text-sm text-muted mb-5">
                Customer payments land here with name, phone, address and items. Update status as you pack and ship. Orders with a cancellation request are highlighted in gold.
              </p>
              <div className="space-y-4">
                {orders.length === 0 && (
                  <p className="text-sm text-muted py-8 text-center">
                    No orders yet. When a customer completes checkout, the order appears here instantly.
                  </p>
                )}
                {orders.map((o) => {
                  const cancelRequested = String(o.notes || "").includes(
                    "CANCEL_REQUESTED"
                  );
                  return (
                  <div
                    key={o.id}
                    className={cn(
                      "rounded-2xl border p-4",
                      cancelRequested
                        ? "border-gold bg-gold/10 ring-1 ring-gold/40"
                        : "border-line"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-wine">{o.id}</p>
                          {cancelRequested && (
                            <span className="rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wine">
                              Cancel requested
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {new Date(o.createdAt).toLocaleString()} · {o.status}
                          {o.paymentMethod ? ` · ${o.paymentMethod}` : ""}
                        </p>
                        <p className="text-sm mt-2">
                          {o.customer?.name} · {o.customer?.phone}
                        </p>
                        <p className="text-xs text-muted">
                          {o.customer?.address}, {o.customer?.city} {o.customer?.pincode}
                        </p>
                        {(o.razorpayPayId || o.razorpayOrderId) && (
                          <p className="text-[11px] text-muted mt-1 font-mono break-all">
                            {o.razorpayPayId
                              ? `Pay ID: ${o.razorpayPayId}`
                              : null}
                            {o.razorpayPayId && o.razorpayOrderId ? " · " : ""}
                            {o.razorpayOrderId
                              ? `Rzp Order: ${o.razorpayOrderId}`
                              : null}
                          </p>
                        )}
                        {o.notes && (
                          <p className="text-[11px] text-wine/80 mt-1 whitespace-pre-wrap">
                            Notes: {o.notes}
                          </p>
                        )}
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
                          cancelRequested
                            ? `Hi ${o.customer?.name || ""}, we received your cancellation request for Kalaa Krityy order ${o.id}. Our team is reviewing it.`
                            : `Hi ${o.customer?.name || ""}, update on your Kalaa Krityy order ${o.id}: status is ${o.status}.`
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
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
