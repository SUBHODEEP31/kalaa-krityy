"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/use-catalog";

export default function ShopClient() {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const initialSort = params.get("sort") || "featured";
  const { products, categories, loading } = useCatalog();
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState(initialSort);
  const [onlySale, setOnlySale] = useState(false);
  const [q] = useState(initialQ);

  const list = useMemo(() => {
    let items = [...products];
    if (q) {
      const qq = q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(qq) ||
          p.category.toLowerCase().includes(qq) ||
          p.tags.some((t) => t.includes(qq)) ||
          p.fabric?.toLowerCase().includes(qq)
      );
    }
    if (category !== "all") items = items.filter((p) => p.categorySlug === category);
    if (onlySale) items = items.filter((p) => p.mrp > p.price);
    if (sort === "newest") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === "popular") items.sort((a, b) => b.sold - a.sold);
    else if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => Number(b.featured) - Number(a.featured));
    return items;
  }, [category, sort, onlySale, q, products]);

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Boutique Edit"
        title={q ? `Results for "${q}"` : "Shop All"}
        subtitle="Sarees, suits, blouses, dress materials and handicrafts — refined for everyday luxury and celebration."
      />
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setCategory("all")} className={cn("shrink-0 rounded-full px-4 py-2 text-sm border", category === "all" ? "bg-wine text-cream border-wine" : "bg-white border-line")}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm border", category === c.slug ? "bg-wine text-cream border-wine" : "bg-white border-line")}>{c.name}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} className="accent-[var(--color-wine)]" />
            On sale
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-full border border-line bg-white px-4 text-sm">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="popular">Most sold</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-sm text-muted">{loading ? "Syncing catalog…" : `${list.length} pieces`}</p>
      <ProductGrid products={list} />
    </div>
  );
}
