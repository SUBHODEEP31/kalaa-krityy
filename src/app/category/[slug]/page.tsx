"use client";

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
