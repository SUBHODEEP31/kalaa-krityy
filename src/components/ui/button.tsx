import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-wine text-cream shadow-soft hover:bg-wine-soft hover:shadow-lift",
        gold: "gold-gradient text-wine-deep shadow-soft hover:brightness-105 hover:shadow-lift font-semibold",
        outline:
          "border border-wine/25 bg-transparent text-wine hover:border-wine hover:bg-wine hover:text-cream",
        ghost: "text-ink hover:bg-cream-dark/80",
        soft: "bg-cream text-wine hover:bg-cream-dark border border-line",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#1ebe57] shadow-soft",
        dark: "bg-charcoal text-cream hover:bg-ink",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-[15px]",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
