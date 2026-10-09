"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Coupon, Product } from "@/types";
import {
  categories as seedCategories,
  coupons as seedCoupons,
  products as seedProducts,
} from "@/data/catalog";

export interface LiveCatalog {
  products: Product[];
  coupons: Coupon[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCatalog(includeInactiveCoupons = false): LiveCatalog {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(seedCoupons);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load catalog");
      const data = await res.json();
      setProducts(data.products || []);
      setCoupons(
        includeInactiveCoupons
          ? data.allCoupons || data.coupons || []
          : data.coupons || []
      );
      setCategories(data.categories || seedCategories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Catalog error");
    } finally {
      setLoading(false);
    }
  }, [includeInactiveCoupons]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, coupons, categories, loading, error, refresh };
}
