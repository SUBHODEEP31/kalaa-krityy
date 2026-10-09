"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/badge";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const total = subtotal();

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading eyebrow="Bag" title="Your Shopping Bag" />
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-6">Your bag is empty.</p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 rounded-3xl border border-line bg-white p-4"
              >
                <div className="relative h-28 w-24 overflow-hidden rounded-2xl bg-cream-dark shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium text-wine hover:underline line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted mt-1">Size {item.size}</p>
                  <p className="mt-2 font-semibold">{formatINR(item.price)}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line p-0.5">
                      <button
                        className="h-8 w-8 grid place-items-center"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty - 1)
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        className="h-8 w-8 grid place-items-center"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty + 1)
                        }
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.size, item.color)
                      }
                      className="text-xs text-muted hover:text-danger inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-line bg-cream/40 p-6 sticky top-28">
            <h3 className="font-display text-xl text-wine">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>Calculated next</span>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-4 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="text-lg font-semibold text-wine">
                {formatINR(total)}
              </span>
            </div>
            <Link href="/checkout" className="mt-5 block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
