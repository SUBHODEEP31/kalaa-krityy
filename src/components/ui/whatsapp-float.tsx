"use client";

import { MessageCircle } from "lucide-react";
import { SITE } from "@/data/catalog";
import { whatsappLink, cn } from "@/lib/utils";

export function WhatsAppFloat({
  className,
}: {
  className?: string;
}) {
  const href = whatsappLink(
    `Hello ${SITE.name}! I have an enquiry about your collection.`
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with boutique on WhatsApp"
      title="Chat with boutique"
      className={cn(
        "group fixed z-40 bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6",
        "flex items-center gap-0 sm:gap-2",
        className
      )}
    >
      <span className="pointer-events-none mr-2 hidden sm:inline-flex max-w-0 overflow-hidden opacity-0 translate-x-2 rounded-full bg-charcoal px-3 py-1.5 text-xs font-medium text-cream shadow-lift transition-all duration-300 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:translate-x-0">
        Chat with boutique
      </span>
      <span className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
        <span className="absolute inset-1 rounded-full bg-[#25D366]/25" />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift ring-4 ring-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110">
          <MessageCircle size={26} strokeWidth={2.25} fill="currentColor" className="opacity-95" />
        </span>
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gold ring-2 ring-white" />
      </span>
    </a>
  );
}
