"use client";

import { Camera, MessageCircle } from "lucide-react";
import { SITE } from "@/data/catalog";
import { cn, whatsappLink } from "@/lib/utils";

export function SocialIconLinks({
  size = "md",
  className,
  showLabels = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabels?: boolean;
}) {
  const dim =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "lg" ? 20 : size === "sm" ? 16 : 18;

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <a
        href={whatsappLink(`Hi ${SITE.name}!`)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          dim,
          "inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft ring-2 ring-white/90 hover:scale-105 hover:brightness-110 transition"
        )}
        aria-label="WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle size={icon} fill="currentColor" />
      </a>
      {showLabels && (
        <span className="text-xs font-semibold text-[#128C7E] mr-1">WhatsApp</span>
      )}
      <a
        href="https://www.instagram.com/kalaa_krityy"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          dim,
          "inline-flex items-center justify-center rounded-full text-white shadow-soft ring-2 ring-white/90 hover:scale-105 transition"
        )}
        style={{
          background:
            "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
        aria-label={`Instagram @${SITE.instagramHandle || "kalaa_krityy"}`}
        title={`@${SITE.instagramHandle || "kalaa_krityy"}`}
      >
        <Camera size={icon} />
      </a>
      {showLabels && (
        <span className="text-xs font-semibold text-[#C13584]">
          @{SITE.instagramHandle || "kalaa_krityy"}
        </span>
      )}
    </div>
  );
}
