"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { getProductBySlug, products as seedProducts, SITE } from "@/data/catalog";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/input";
import { discountPercent, formatINR, whatsappLink, cn } from "@/lib/utils";
import { colorLabel, colorStyle } from "@/lib/boutique-colors";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useUI } from "@/store/ui";
import { toast } from "sonner";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const seed = getProductBySlug(slug);
  const [product, setProduct] = useState(seed || null);
  const [img, setImg] = useState(0);

  useEffect(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.products || []).find((x: Product) => x.slug === slug);
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [slug]);
  const [size, setSize] = useState(product?.sizes[0] || "");
  const [color, setColor] = useState(product?.colors[0] || "");
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const { toggle, has } = useWishlist();
  const setCartOpen = useUI((s) => s.setCartOpen);

  const related = useMemo(() => {
    if (!product) return [] as Product[];
    return seedProducts
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="container-pro py-24 text-center">
        <h1 className="font-display text-3xl text-wine">Product not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const off = discountPercent(product.mrp, product.price);
  const liked = has(product.id);

  const addToBag = () => {
    addItem(product, { size, color, qty });
    toast.success("Added to bag");
    setCartOpen(true);
  };

  return (
    <div className="container-pro py-8 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3 md:grid-cols-[88px_1fr]">
          <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setImg(i)}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2",
                  img === i ? "border-wine" : "border-transparent"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 md:order-2 relative aspect-[3/4] overflow-hidden rounded-[28px] bg-cream-dark">
            <Image
              src={product.images[img]}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            {off > 0 && (
              <div className="absolute left-4 top-4">
                <Badge tone="sale">{off}% OFF</Badge>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {product.category}
            {product.fabric ? ` · ${product.fabric}` : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl text-wine leading-tight text-balance">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-muted">
              {product.rating} · {product.reviewCount} reviews · {product.sold} sold
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-wine">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatINR(product.mrp)}
                </span>
                <Badge tone="sale">Save {formatINR(product.mrp - product.price)}</Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            {product.description}
          </p>

<div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink mb-2">
              Colour{color ? ` · ${colorLabel(color)}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={colorLabel(c)}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition touch-manipulation",
                    color === c ? "border-wine scale-110 ring-2 ring-gold/40" : "border-white shadow"
                  )}
                  style={{ background: colorStyle(c) }}
                  aria-label={colorLabel(c)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink mb-2">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 rounded-full border px-4 py-2 text-sm transition",
                    size === s
                      ? "border-wine bg-wine text-cream"
                      : "border-line bg-white hover:border-wine/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-line bg-white p-1">
              <button
                className="h-10 w-10 grid place-items-center rounded-full hover:bg-cream"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button
                className="h-10 w-10 grid place-items-center rounded-full hover:bg-cream"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-xs text-muted">{product.stock} in stock</p>
          </div>

<div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1 min-h-12" onClick={addToBag}>
              <ShoppingBag size={18} /> Add to Bag
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-12"
              onClick={() => {
                toggle(product.id);
                toast.success(liked ? "Removed from wishlist" : "Saved");
              }}
            >
              <Heart size={18} className={liked ? "fill-danger text-danger" : ""} />
            </Button>
          </div>

          <a
            href={whatsappLink(
              `Hi ${SITE.name}, I am interested in ordering: ${product.name} (Price: ₹${product.price}). Is this available in ${size || "Free Size"}? Colour: ${colorLabel(color || product.colors[0] || "")}.`
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block"
          >
            <Button variant="whatsapp" size="lg" className="w-full min-h-12 text-base shadow-lift">
              <MessageCircle size={18} fill="currentColor" /> Inquire / Order on WhatsApp
            </Button>
          </a>

          <div className="mt-8 grid gap-3 rounded-3xl border border-line bg-cream/50 p-5">
            <div className="flex gap-3 text-sm">
              <Truck size={18} className="text-wine shrink-0" />
              <div>
                <p className="font-medium text-wine">Pan-India delivery</p>
                <p className="text-muted text-xs mt-0.5">
                  Secure packing · Easy returns on ready-to-wear
                </p>
              </div>
            </div>
            {product.care && (
              <p className="text-xs text-muted border-t border-line pt-3">
                Care: {product.care}
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-3xl text-wine mb-8">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
