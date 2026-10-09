"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/input";
import { discountPercent, formatINR, cn } from "@/lib/utils";
import { colorLabel, colorStyle } from "@/lib/boutique-colors";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { toggle, has } = useWishlist();
  const liked = has(product.id);
  const off = discountPercent(product.mrp, product.price);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-cream-dark img-zoom">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {off > 0 && <Badge tone="sale">{off}% OFF</Badge>}
          {product.badges.includes("new") && <Badge tone="new">New</Badge>}
          {product.badges.includes("bestseller") && (
            <Badge tone="gold">Bestseller</Badge>
          )}
          {product.badges.includes("limited") && (
            <Badge tone="wine">Limited</Badge>
          )}
        </div>

        <button
          onClick={() => {
            toggle(product.id);
            toast.success(liked ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className={cn(
            "absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full glass transition hover:scale-105",
            liked && "text-danger"
          )}
          aria-label="Wishlist"
        >
          <Heart size={16} className={liked ? "fill-current" : ""} />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-3 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/product/${product.slug}`}
            className="block rounded-full bg-wine/95 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-cream backdrop-blur-md hover:bg-wine"
          >
            Quick View
          </Link>
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col px-0.5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 font-medium text-[15px] leading-snug text-ink line-clamp-2 group-hover:text-wine transition">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={product.rating} size={12} />
          <span className="text-[11px] text-muted">({product.reviewCount})</span>
        </div>
        <div className="mt-auto pt-2.5 flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-wine">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-sm text-muted line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>
{product.colors?.length > 0 && (
          <div className="mt-2.5 flex gap-1.5">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c}
                title={colorLabel(c)}
                className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
                style={{ background: colorStyle(c) }}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
"grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5 md:gap-y-10",
        className
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
