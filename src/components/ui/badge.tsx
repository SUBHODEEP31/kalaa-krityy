import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "wine",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "wine" | "gold" | "sale" | "new" | "soft";
}) {
  const tones = {
    wine: "bg-wine text-cream",
    gold: "gold-gradient text-wine-deep",
    sale: "bg-danger text-white",
    new: "bg-charcoal text-cream",
    soft: "bg-cream-dark text-wine border border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "text-center mx-auto max-w-2xl" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] text-wine leading-[1.15] text-balance">
        {title}
      </h2>
      {align === "center" ? (
        <div className="ornament-line mx-auto mt-4 max-w-[140px] text-gold text-xs">
          ✦
        </div>
      ) : (
        <div className="mt-3 h-px w-16 bg-gradient-to-r from-gold to-transparent" />
      )}
      {subtitle ? (
        <p className="mt-4 text-muted text-[15px] leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}
