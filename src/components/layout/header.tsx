"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  Phone,
} from "lucide-react";
import { categories, SITE } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/layout/search-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SocialIconLinks } from "@/components/ui/social-icons";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/shop", label: "Shop", children: true },
  { href: "/services", label: "Services" },
  { href: "/training", label: "Training" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { setCartOpen, setSearchOpen, setMobileNavOpen } = useUI();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="royal-gradient text-cream text-[11px] md:text-xs">
        <div className="container-pro flex h-9 items-center justify-between gap-3">
          <p className="truncate opacity-90">
            Welcome to {SITE.name} · Reg. No. {SITE.registration}
          </p>
<div className="hidden sm:flex items-center gap-3">
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-gold-light transition truncate max-w-[180px]"
            >
              {SITE.email}
            </a>
            <a
              href={`tel:+${SITE.phoneRaw}`}
              className="inline-flex items-center gap-1 hover:text-gold-light transition"
            >
              <Phone size={12} /> {SITE.phone}
            </a>
            <SocialIconLinks size="sm" />
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-cream-dark/80 border-b border-line/70 overflow-hidden">
        <div className="container-pro py-1.5 text-center text-[11px] md:text-xs tracking-wide text-wine">
          <span className="md:hidden announce-marquee">{SITE.announcement} · {SITE.announcement}</span>
          <span className="hidden md:inline">{SITE.announcement}</span>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "glass shadow-soft" : "bg-ivory/95"
        )}
      >
        <div className="container-pro">
          <div className="flex h-[72px] md:h-[84px] items-center justify-between gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-wine"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

<Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 flex-1 lg:flex-none justify-center lg:justify-start">
              <div className="relative grid place-items-center h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full royal-gradient text-gold shadow-soft">
                <span className="font-display text-lg leading-none">K</span>
                <span className="absolute inset-0 rounded-full ring-1 ring-gold/40" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-display text-lg sm:text-xl md:text-2xl text-wine tracking-tight group-hover:text-wine-soft transition truncate">
                  {SITE.name}
                </div>
                <div className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted truncate max-w-[140px] sm:max-w-none">
                  {SITE.tagline}
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.map((item) =>
                item.children ? (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em] text-ink/80 hover:text-wine transition"
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform",
                          shopOpen && "rotate-180"
                        )}
                      />
                    </Link>
                    <div
                      className={cn(
                        "absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3 transition-all",
                        shopOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2 pointer-events-none"
                      )}
                    >
                      <div className="glass rounded-3xl p-5 shadow-lift">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                            Shop by Category
                          </p>
                          <Link
                            href="/sale"
                            className="text-xs text-danger font-medium hover:underline"
                          >
                            Sale & Offers →
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((c) => (
                            <Link
                              key={c.id}
                              href={`/category/${c.slug}`}
                              className="rounded-2xl px-3 py-3 hover:bg-cream transition group/item"
                            >
                              <div className="text-sm font-medium text-wine group-hover/item:text-wine-soft">
                                {c.name}
                              </div>
                              <div className="text-xs text-muted mt-0.5 line-clamp-1">
                                {c.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em] text-ink/80 hover:text-wine transition"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-cream-dark text-wine transition"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-cream-dark text-wine transition hidden sm:inline-flex"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-wine text-cream text-[10px] grid place-items-center">
                    {wishCount}
                  </span>
                )}
              </Link>
              <Link
                href="/login"
                className="p-2.5 rounded-full hover:bg-cream-dark text-wine transition hidden sm:inline-flex"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-cream-dark text-wine transition"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-gold text-wine-deep text-[10px] font-bold grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchModal />
      <CartDrawer />
      <MobileNav />
    </>
  );
}

