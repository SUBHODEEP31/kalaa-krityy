"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  addItem: (
    product: Product,
    opts: { size: string; color: string; qty?: number }
  ) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQty: (
    productId: string,
    size: string,
    color: string,
    qty: number
  ) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      addItem: (product, { size, color, qty = 1 }) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) =>
              i.productId === product.id && i.size === size && i.color === color
          );
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
            return { items };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                image: product.images[0],
                size,
                color,
                qty,
              },
            ],
          };
        });
      },
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                i.color === color
              )
          ),
        })),
      updateQty: (productId, size, color, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) =>
                    !(
                      i.productId === productId &&
                      i.size === size &&
                      i.color === color
                    )
                )
              : state.items.map((i) =>
                  i.productId === productId &&
                  i.size === size &&
                  i.color === color
                    ? { ...i, qty }
                    : i
                ),
        })),
      clear: () => set({ items: [], couponCode: null }),
      setCoupon: (code) => set({ couponCode: code }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "kalaa-cart-v1" }
  )
);
