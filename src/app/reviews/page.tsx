import { reviews } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";
import { Stars } from "@/components/ui/input";

function QuoteMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 24"
      className="h-8 w-10 text-gold/70"
      fill="currentColor"
    >
      <path d="M0 24V12.6C0 5.4 4.2 1.1 12 0l1.2 3.2C8.6 4.3 6.4 6.7 6.2 11H12v13H0zm18 0V12.6C18 5.4 22.2 1.1 30 0L31.2 3.2C26.6 4.3 24.4 6.7 24.2 11H30v13H18z" />
    </svg>
  );
}

export default function ReviewsPage() {
  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Love Notes"
        title="Customer Reviews"
        subtitle="Real words from clients who shopped, stitched and trained with us."
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-3xl border border-line bg-white p-6 shadow-soft">
            <QuoteMark />
            <div className="mt-3">
              <Stars rating={r.rating} />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink">{r.text}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="font-medium text-wine">{r.name}</p>
              <p className="text-xs text-muted">
                {r.city || "India"}
                {r.product ? ` · ${r.product}` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
