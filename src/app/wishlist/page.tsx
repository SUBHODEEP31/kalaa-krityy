"use client";

import { products } from "@/data/catalog";
import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/badge";
import { useWishlist } from "@/store/wishlist";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading eyebrow="Saved" title="Wishlist" subtitle="Pieces you loved at first sight." />
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-6">No saved pieces yet.</p>
          <Link href="/shop"><Button>Explore collection</Button></Link>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
