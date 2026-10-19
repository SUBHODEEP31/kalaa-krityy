"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Crown,
  Heart,
  Headset,
  Ruler,
  Scissors,
  Shield,
  Shirt,
  Sparkles,
  Truck,
  ChevronLeft,
  ChevronRight,
  Camera,
  MessageCircle,
} from "lucide-react";
import {
  aboutImage,
  categories,
  courses,
  galleryImages,
  heroSlides,
  reviews,
  services,
  servicesImage,
  SITE,
  trainingImage,
  trustBadges,
} from "@/data/catalog";
import { SectionHeading, Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-card";
import { Stars } from "@/components/ui/input";
import { cn, formatINR, whatsappLink } from "@/lib/utils";
import { useCatalog } from "@/lib/use-catalog";
import type { Product } from "@/types";

const iconMap = {
  award: Award,
  shirt: Shirt,
  truck: Truck,
  shield: Shield,
  headset: Headset,
  heart: Heart,
  scissors: Scissors,
  sparkles: Sparkles,
  ruler: Ruler,
  crown: Crown,
};

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative min-h-[78vh] md:min-h-[86vh] cream-radial">
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/10 md:via-cream/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/25 via-transparent to-transparent" />
                </div>

                <div className="container-pro relative z-10 flex min-h-[78vh] md:min-h-[86vh] items-center py-16">
                  <div className="max-w-xl">
                    <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.32em] text-gold mb-4">
                      {slide.eyebrow}
                    </p>
                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-wine leading-[1.05] text-balance">
                      {slide.title}
                    </h1>
                    <p className="mt-2 font-display text-xl md:text-2xl text-wine-soft/90 italic">
                      {SITE.tagline}
                    </p>
                    <div className="ornament-line mt-5 max-w-[180px] text-gold text-xs">
                      âœ¦
                    </div>
                    <p className="mt-5 text-base md:text-lg text-muted leading-relaxed max-w-md">
                      {slide.subtitle}
                    </p>
                    <p className="mt-3 font-display italic text-wine/80">
                      {SITE.motto}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href={slide.href}
                        className={cn(buttonVariants({ size: "lg" }))}
                      >
                        {slide.cta}
                      </Link>
                      <a
                        href={whatsappLink(
                          `Hi ${SITE.name}, I want to place an order.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "whatsapp", size: "lg" })
                        )}
                      >
                        <MessageCircle size={18} /> Order on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-3">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="hidden md:grid h-10 w-10 place-items-center rounded-full glass text-wine"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-wine" : "w-2.5 bg-wine/30"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="hidden md:grid h-10 w-10 place-items-center rounded-full glass text-wine"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-white">
      <div className="container-pro py-7 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {trustBadges.map((b) => {
          const Icon = iconMap[b.icon as keyof typeof iconMap] || Award;
          return (
            <div key={b.title} className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream text-wine">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-wine leading-tight">
                  {b.title}
                </p>
                <p className="mt-0.5 text-xs text-muted leading-snug">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CategoryShowcase() {
  return (
    <section className="container-pro py-16 md:py-24">
      <SectionHeading
        eyebrow="Collections"
        title="Shop by Category"
        subtitle="Curated edits spanning sarees, suits, blouses, fabrics and craft — each piece chosen for finish and feel."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={cn(
              "group relative overflow-hidden rounded-[24px] bg-cream-dark hover-lift",
              i === 0 ? "md:col-span-1 min-h-[280px]" : "min-h-[260px]"
            )}
          >
            <div className="absolute inset-0 img-zoom">
              <Image
                src={c.image}
                alt={c.name}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/85 via-wine-deep/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
              <h3 className="font-display text-xl text-cream">{c.name}</h3>
              <p className="mt-1 text-xs text-cream/70 line-clamp-2">
                {c.description}
              </p>
              <span className="mt-3 inline-flex text-[11px] uppercase tracking-[0.16em] text-gold-light">
                View Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProductRails() {
  const { products, loading } = useCatalog();

  const newest = useMemo(
    () =>
      [...products]
        .sort((a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [products]
  );
  const best = useMemo(
    () => [...products].sort((a: Product, b: Product) => b.sold - a.sold).slice(0, 8),
    [products]
  );
  const sale = useMemo(
    () =>
      products
        .filter((p: Product) => p.mrp > p.price)
        .sort((a: Product, b: Product) => b.mrp - b.price - (a.mrp - a.price))
        .slice(0, 8),
    [products]
  );

  return (
    <>
      <section className="container-pro py-8 md:py-12">
        <div className="flex items-end justify-between gap-4 mb-8">
          <SectionHeading
            eyebrow="Just In"
            title="New Arrivals"
            align="left"
            className="mb-0"
            subtitle={loading ? "Syncing latest pieces…" : undefined}
          />
          <Link
            href="/shop?sort=newest"
            className="text-sm font-medium text-wine hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>
        <ProductGrid products={newest} />
      </section>

      <section className="cream-radial py-16 md:py-20">
        <div className="container-pro">
          <div className="flex items-end justify-between gap-4 mb-8">
            <SectionHeading
              eyebrow="Most Loved"
              title="Bestsellers"
              align="left"
              className="mb-0"
              subtitle="Pieces our Patna clientele reorders and recommends."
            />
            <Link
              href="/shop?sort=popular"
              className="text-sm font-medium text-wine hover:underline shrink-0"
            >
              View all →
            </Link>
          </div>
          <ProductGrid products={best} />
        </div>
      </section>

      <section className="container-pro py-16 md:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <SectionHeading
            eyebrow="Limited Time"
            title="Sale & Discounts"
            align="left"
            className="mb-0"
            subtitle="Marked-down atelier favourites — while stocks last."
          />
          <Link
            href="/sale"
            className="text-sm font-medium text-danger hover:underline shrink-0"
          >
            All offers →
          </Link>
        </div>
        <ProductGrid products={sale} />
      </section>
    </>
  );
}

export function ServicesTrainingAbout() {
  return (
    <section className="container-pro py-8 md:py-12">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Services */}
        <div className="rounded-[28px] border border-line bg-white p-6 md:p-8 shadow-soft overflow-hidden relative">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cream" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
            Atelier
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-wine mt-2">
            Our Services
          </h3>
          <div className="relative mt-5 h-40 rounded-2xl overflow-hidden">
            <Image
              src={servicesImage}
              alt="Boutique services"
              fill
              className="object-cover"
            />
          </div>
          <ul className="mt-5 space-y-3">
            {services.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] || Scissors;
              return (
                <li key={s.id} className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-cream text-wine">
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-wine">{s.title}</p>
                    <p className="text-xs text-muted leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/services" className="mt-6 inline-block">
            <Button variant="primary" size="sm">
              Know More
            </Button>
          </Link>
        </div>

        {/* Training */}
        <div className="rounded-[28px] border border-line bg-cream p-6 md:p-8 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
            Academy
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-wine mt-2">
            Our Training Programs
          </h3>
          <div className="relative mt-5 h-40 rounded-2xl overflow-hidden">
            <Image
              src={trainingImage}
              alt="Training programs"
              fill
              className="object-cover"
            />
          </div>
          <ul className="mt-5 space-y-3">
            {courses.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5 border border-line/60"
              >
                <div>
                  <p className="text-sm font-medium text-wine">{c.title}</p>
                  <p className="text-[11px] text-muted">
                    {c.duration} · {c.level}
                  </p>
                </div>
                <span className="text-xs font-semibold text-wine">
                  {formatINR(c.price)}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/training" className="mt-6 inline-block">
            <Button variant="gold" size="sm">
              Enroll Now
            </Button>
          </Link>
        </div>

        {/* About */}
        <div className="rounded-[28px] royal-gradient p-6 md:p-8 text-cream shadow-soft relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-pale font-semibold">
            Our Story
          </p>
          <h3 className="font-display text-2xl md:text-3xl mt-2">
            About Kalaa Krityy
          </h3>
          <div className="relative mt-5 h-40 rounded-2xl overflow-hidden ring-1 ring-white/10">
            <Image
              src={aboutImage}
              alt="About Kalaa Krityy"
              fill
              className="object-cover"
            />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-cream/80">
            Kalaa Krityy is a creative boutique and training center offering
            exclusive fashion wear, custom stitching, and handicraft training —
            with a mission to empower creativity and skills.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-cream/20 bg-white/5 px-4 py-2 backdrop-blur">
            <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center text-wine-deep font-display">
              K
            </div>
            <div>
              <p className="text-sm font-medium">{SITE.name}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-pale">
                {SITE.tagline}
              </p>
            </div>
          </div>
          <Link href="/about" className="mt-6 inline-block">
            <Button variant="gold" size="sm">
              Read More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ReviewsAndGallery() {
  const [active, setActive] = useState(0);
  const review = reviews[active];

  return (
    <section className="container-pro py-16 md:py-24">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-[28px] royal-gradient p-8 md:p-10 text-cream relative overflow-hidden">
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-pale font-semibold">
            Testimonials
          </p>
          <h3 className="font-display text-3xl mt-2">What Our Customers Say</h3>
<div className="mt-8">
            <svg
              aria-hidden
              viewBox="0 0 32 24"
              className="h-10 w-12 text-gold/60"
              fill="currentColor"
            >
              <path d="M0 24V12.6C0 5.4 4.2 1.1 12 0l1.2 3.2C8.6 4.3 6.4 6.7 6.2 11H12v13H0zm18 0V12.6C18 5.4 22.2 1.1 30 0L31.2 3.2C26.6 4.3 24.4 6.7 24.2 11H30v13H18z" />
            </svg>
            <p className="mt-3 text-lg leading-relaxed text-cream/90">
              {review.text}
            </p>
            <div className="mt-5">
              <Stars rating={review.rating} />
            </div>
            <p className="mt-4 font-medium">— {review.name}</p>
            {review.city && (
              <p className="text-xs text-cream/60">{review.city}</p>
            )}
          </div>
          <div className="mt-8 flex gap-2">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setActive(i)}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  i === active ? "bg-gold w-6" : "bg-cream/30"
                )}
                aria-label={`Review ${i + 1}`}
              />
            ))}
          </div>
          <Link href="/reviews" className="mt-8 inline-block text-sm text-gold-pale hover:underline">
            Read all reviews →
          </Link>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-end justify-between mb-6">
            <SectionHeading
              eyebrow="Social"
              title="Instagram Gallery"
              align="left"
              className="mb-0"
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {galleryImages.map((src, i) => (
              <Link
                key={src + i}
                href="/gallery"
                className={cn(
                  "relative overflow-hidden rounded-2xl img-zoom bg-cream-dark",
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                )}
              >
                <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
              </Link>
            ))}
          </div>
<div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/kalaa_krityy"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "border-transparent text-white")}
              style={{
                background:
                  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
              }}
            >
              <Camera size={16} /> Follow on Instagram
            </a>
            <a
              href={whatsappLink(`Hi ${SITE.name}! Saw your gallery — interested.`)}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "whatsapp", size: "md" }))}
            >
              <MessageCircle size={16} /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CouponBanner() {
  return (
    <section className="container-pro pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-[32px] border border-line bg-white shadow-soft">
        <div className="absolute inset-0 cream-radial opacity-80" />
        <div className="relative grid md:grid-cols-2 gap-6 p-8 md:p-12 items-center">
          <div>
            <Badge tone="gold">Member Perks</Badge>
            <h3 className="mt-4 font-display text-3xl md:text-4xl text-wine text-balance">
              Unlock boutique coupons & festive offers
            </h3>
            <p className="mt-3 text-muted leading-relaxed">
              Use <span className="font-semibold text-wine">KALAA10</span> at
              checkout for 10% off, or explore active festival codes on our
              offers page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sale" className={cn(buttonVariants({ size: "md" }))}>
                View Coupons
              </Link>
              <Link
                href="/shop"
                className={cn(buttonVariants({ variant: "outline", size: "md" }))}
              >
                Shop Collection
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
{[
              { code: "KALAA10", detail: "10% OFF above ₹1,999" },
              { code: "FIRST500", detail: "Flat ₹500 OFF above ₹3,999" },
              { code: "FESTIVE15", detail: "15% OFF above ₹4,999" },
              { code: "BLOUSE200", detail: "Flat ₹200 OFF above ₹1,499" },
            ].map((c) => (
              <div
                key={c.code}
                className="rounded-2xl border border-dashed border-gold/50 bg-ivory/80 p-4 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Coupon
                </p>
                <p className="mt-1 font-display text-xl text-wine">{c.code}</p>
                <p className="mt-1 text-[11px] text-muted">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
