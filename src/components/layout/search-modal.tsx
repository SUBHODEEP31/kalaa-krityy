"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { searchProducts } from "@/data/catalog";
import { formatINR } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!searchOpen) setQ("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => searchProducts(q).slice(0, 8), [q]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-wine-deep/40 backdrop-blur-sm"
        onClick={() => setSearchOpen(false)}
        aria-label="Close search"
      />
      <div className="relative mx-auto mt-[10vh] w-[min(680px,92vw)] glass rounded-[28px] p-5 md:p-6 shadow-lift">
        <div className="flex items-center gap-3">
          <Search className="text-wine" size={20} />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search "Banarasi", "Blouse", "Chikankari"...'
            className="border-0 bg-transparent px-0 focus:ring-0 h-12 text-base"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 rounded-full hover:bg-cream-dark"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 max-h-[50vh] overflow-auto no-scrollbar space-y-2">
          {q && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No pieces found. Try another style or fabric.
            </p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-3 rounded-2xl p-2 hover:bg-cream transition"
            >
              <div className="relative h-16 w-14 overflow-hidden rounded-xl bg-cream-dark">
                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-wine truncate">{p.name}</p>
                <p className="text-xs text-muted">{p.category}</p>
              </div>
              <p className="text-sm font-semibold">{formatINR(p.price)}</p>
            </Link>
          ))}
          {q && results.length > 0 && (
            <Link
              href={`/shop?q=${encodeURIComponent(q)}`}
              onClick={() => setSearchOpen(false)}
              className="block text-center text-sm text-wine font-medium py-3 hover:underline"
            >
              View all results →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
