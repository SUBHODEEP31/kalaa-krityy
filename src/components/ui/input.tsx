import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-wine/40 focus:ring-4 focus:ring-wine/8",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-wine/40 focus:ring-4 focus:ring-wine/8",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? "fill-gold text-gold"
              : "fill-transparent text-line"
          }
        />
      ))}
    </div>
  );
}
