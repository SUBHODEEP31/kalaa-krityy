"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatINR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { items, updateQty, removeItem, subtotal } = useCart();
  const total = subtotal();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[75] transition",
        cartOpen ? "visible" : "invisible pointer-events-none"
      )}
    >
      <button
        className={cn(
          "absolute inset-0 bg-wine-deep/40 backdrop-blur-sm transition-opacity",
          cartOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setCartOpen(false)}
        aria-label="Close cart"
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(420px,100vw)] flex-col bg-ivory shadow-lift transition-transform duration-400",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-wine" />
            <h3 className="font-display text-xl text-wine">Your Bag</h3>
            <span className="text-xs text-muted">({items.length})</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-cream-dark"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-cream">
                <ShoppingBag className="text-wine/40" />
              </div>
              <p className="text-sm text-muted mb-4">Your bag is empty</p>
              <Link href="/shop" onClick={() => setCartOpen(false)}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-3 rounded-2xl border border-line bg-white p-3"
              >
                <div className="relative h-24 w-20 overflow-hidden rounded-xl bg-cream-dark shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="text-sm font-medium text-wine line-clamp-2 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-[11px] text-muted">
                    Size {item.size}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">{formatINR(item.price)}</p>
                    <div className="flex items-center gap-1 rounded-full border border-line bg-cream/50 p-0.5">
                      <button
                        className="h-7 w-7 grid place-items-center rounded-full hover:bg-white"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty - 1)
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">
                        {item.qty}
                      </span>
                      <button
                        className="h-7 w-7 grid place-items-center rounded-full hover:bg-white"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty + 1)
                        }
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted hover:text-danger"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-5 space-y-3 bg-white/70">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-wine">{formatINR(total)}</span>
            </div>
            <p className="text-[11px] text-muted">
              Shipping & coupons calculated at checkout
            </p>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={() => setCartOpen(false)}>
              <Button variant="outline" className="w-full" size="md">
                View Bag
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
