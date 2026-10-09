"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { categories, SITE } from "@/data/catalog";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { SocialIconLinks } from "@/components/ui/social-icons";

const links = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Shop All", "/shop"],
  ["Sale & Coupons", "/sale"],
  ["Services", "/services"],
  ["Training", "/training"],
  ["Gallery", "/gallery"],
  ["Reviews", "/reviews"],
  ["Track Order", "/track-order"],
  ["Contact", "/contact"],
  ["My Account", "/login"],
  ["Wishlist", "/wishlist"],
  ["Staff Access", "/admin"],
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUI();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] lg:hidden transition",
        mobileNavOpen ? "visible" : "invisible pointer-events-none"
      )}
    >
      <button
        className={cn(
          "absolute inset-0 bg-wine-deep/45 backdrop-blur-sm transition-opacity",
          mobileNavOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-label="Close menu"
      />
      <aside
        className={cn(
          "absolute left-0 top-0 h-full w-[min(360px,88vw)] bg-ivory shadow-lift transition-transform duration-400 ease-out overflow-y-auto",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <div className="font-display text-xl text-wine">{SITE.name}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {SITE.tagline}
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-full hover:bg-cream-dark"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-ink hover:bg-cream hover:text-wine transition"
            >
              {label}
            </Link>
          ))}
        </nav>
<div className="px-5 pb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold font-semibold mb-3">
            Categories
          </p>
          <div className="grid grid-cols-1 gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-wine hover:bg-cream transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-cream/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted mb-3">
              Chat & social
            </p>
            <SocialIconLinks size="lg" showLabels />
            <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted">
              {SITE.tagline}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
