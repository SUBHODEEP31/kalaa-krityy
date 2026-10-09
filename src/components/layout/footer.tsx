import Link from "next/link";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { categories, SITE } from "@/data/catalog";
import { whatsappLink } from "@/lib/utils";
import { SocialIconLinks } from "@/components/ui/social-icons";

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* WhatsApp CTA strip */}
      <div className="royal-gradient text-cream">
        <div className="container-pro py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#25D366] grid place-items-center shadow-soft">
              <MessageCircle className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-pale">
                For Orders & Enquiries
              </p>
              <p className="font-display text-2xl md:text-3xl">{SITE.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-gold" />
            <span>Visit our store · {SITE.address}</span>
          </div>
          <a
            href={whatsappLink(
              `Hi ${SITE.name}! I would like to know more about your collection.`
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center rounded-full gold-gradient px-7 text-sm font-semibold text-wine-deep shadow-soft hover:brightness-105 transition"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="bg-wine-deep text-cream/90">
        <div className="container-pro py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="font-display text-2xl text-cream">{SITE.name}</div>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
              {SITE.tagline}
            </p>
<p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
              {SITE.name} — {SITE.tagline}. Unique fashion, custom stitching,
              and handicraft training, empowering creativity one stitch at a time.
            </p>
            <div className="mt-5">
              <SocialIconLinks size="lg" showLabels />
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-cream/75 hover:text-cream"
            >
              <Mail size={15} className="text-gold" /> {SITE.email}
            </a>
          </div>

<div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-cream/75">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Shop", "/shop"],
                ["Services", "/services"],
                ["Training", "/training"],
                ["Gallery", "/gallery"],
                ["Track Order", "/track-order"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-cream transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-cream/75">
              {[
                ["Cancellation & Refunds", "/cancellation-refund-policy"],
                ["Shipping Policy", "/shipping-policy"],
                ["Terms & Conditions", "/terms-and-conditions"],
                ["Privacy Policy", "/privacy-policy"],
                ["Sale & Coupons", "/sale"],
                ...categories.slice(0, 2).map((c) => [c.name, `/category/${c.slug}`] as [string, string]),
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-cream transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Contact Info
            </h4>
            <ul className="space-y-3 text-sm text-cream/75">
              <li className="flex gap-2">
                <Phone size={15} className="mt-0.5 text-gold shrink-0" />
                {SITE.phone}
              </li>
              <li className="flex gap-2">
                <Mail size={15} className="mt-0.5 text-gold shrink-0" />
                {SITE.email}
              </li>
              <li className="flex gap-2">
                <MapPin size={15} className="mt-0.5 text-gold shrink-0" />
                {SITE.address}
              </li>
              <li className="text-xs text-cream/50 pt-1">
                Registration No.: {SITE.registration}
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex text-xs uppercase tracking-[0.16em] text-gold hover:text-cream transition"
                >
                  Staff Access →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10">
          <div className="container-pro py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/50">
            <p>
              © {new Date().getFullYear()} {SITE.name}. All Rights Reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Link href="/privacy-policy" className="hover:text-cream">
                Privacy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-cream">
                Terms
              </Link>
              <Link href="/cancellation-refund-policy" className="hover:text-cream">
                Refunds
              </Link>
              <Link href="/admin" className="hover:text-gold">
                Staff Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
