import Link from "next/link";
import { SITE } from "@/data/catalog";

export type PolicySection = {
  heading: string;
  body: string[];
};

export function PolicyPage({
  title,
  eyebrow,
  intro,
  sections,
  updated = "24 September 2026",
}: {
  title: string;
  eyebrow: string;
  intro: string;
  sections: PolicySection[];
  updated?: string;
}) {
  return (
    <div className="container-pro py-10 md:py-16 max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl text-wine">
        {title}
      </h1>
      <p className="mt-3 text-muted leading-relaxed">{intro}</p>
      <p className="mt-2 text-xs text-muted">Last updated: {updated}</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading} className="rounded-3xl border border-line bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl text-wine">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-sm text-muted leading-relaxed">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-line bg-cream/50 p-6 text-sm text-muted">
        <p className="font-medium text-wine">Kalaa Krityy Boutique & Training Center</p>
        <p className="mt-1">{SITE.address}</p>
        <p>
          {SITE.phone} · {SITE.email}
        </p>
        <p className="mt-1">Registration No.: {SITE.registration}</p>
        <p className="mt-3">
          Related:{" "}
          <Link href="/cancellation-refund-policy" className="text-wine underline">
            Cancellation & Refunds
          </Link>
          {" · "}
          <Link href="/shipping-policy" className="text-wine underline">
            Shipping
          </Link>
          {" · "}
          <Link href="/terms-and-conditions" className="text-wine underline">
            Terms
          </Link>
          {" · "}
          <Link href="/privacy-policy" className="text-wine underline">
            Privacy
          </Link>
          {" · "}
          <Link href="/contact" className="text-wine underline">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
