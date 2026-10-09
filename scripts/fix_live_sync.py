from pathlib import Path

p = Path("src/components/home/sections.tsx")
t = p.read_text(encoding="utf-8")

if "useMemo" not in t[:400]:
    t = t.replace(
        'import { useCallback, useEffect, useState } from "react";',
        'import { useCallback, useEffect, useMemo, useState } from "react";',
    )

if "useCatalog" not in t:
    t = t.replace(
        'import { cn, formatINR, whatsappLink } from "@/lib/utils";',
        'import { cn, formatINR, whatsappLink } from "@/lib/utils";\nimport { useCatalog } from "@/lib/use-catalog";',
    )

for name in ["getBestsellers", "getNewArrivals", "getSaleProducts"]:
    t = t.replace(f"  {name},\n", "")
    t = t.replace(f"{name}, ", "")
    t = t.replace(f", {name}", "")

p.write_text(t, encoding="utf-8")
print("sections_ok")

cat = Path("src/app/category/[slug]/page.tsx")
cat.write_text(
    r'''"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/badge";
import { useCatalog } from "@/lib/use-catalog";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { products, categories, loading } = useCatalog();
  const category = categories.find((c) => c.slug === slug);
  const items = useMemo(
    () => products.filter((p) => p.categorySlug === slug),
    [products, slug]
  );

  if (!loading && !category) {
    return (
      <div className="container-pro py-24 text-center">
        <h1 className="font-display text-3xl text-wine">Category not found</h1>
        <Link href="/shop" className="mt-4 inline-block underline text-sm">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Category"
        title={category?.name || "Collection"}
        subtitle={category?.description || (loading ? "Loading..." : "")}
      />
      <p className="mb-8 text-sm text-muted">
        {loading ? "Syncing..." : `${items.length} pieces`}
      </p>
      {items.length ? (
        <ProductGrid products={items} />
      ) : (
        <p className="text-center text-muted py-16">
          {loading ? "Loading pieces..." : "Fresh pieces arriving soon in this edit."}
        </p>
      )}
    </div>
  );
}
''',
    encoding="utf-8",
)
print("category_ok")
