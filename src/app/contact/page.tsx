"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Mail, MapPin, PackageSearch, Phone } from "lucide-react";
import { SITE } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { whatsappLink } from "@/lib/utils";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Visit & Connect"
        title="Contact Us"
        subtitle="We would love to style your next celebration or welcome you to the academy. For order help, use Track Order or WhatsApp with your KK order number."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Phone / WhatsApp", value: SITE.phone, href: `tel:+${SITE.phoneRaw}` },
            { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
            { icon: MapPin, label: "Store", value: SITE.address, href: "#" },
            {
              icon: Clock,
              label: "Boutique hours",
              value: "Mon–Sat 10:30 AM – 7:30 PM · Sunday by appointment",
              href: "#",
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex gap-4 rounded-3xl border border-line bg-white p-5 hover:border-wine/30 transition"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-wine">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{item.label}</p>
                <p className="mt-1 font-medium text-wine">{item.value}</p>
              </div>
            </a>
          ))}
          <a href={whatsappLink(`Hi ${SITE.name}!`)} target="_blank" rel="noreferrer">
            <Button variant="whatsapp" className="w-full mt-2">Chat on WhatsApp</Button>
          </a>
          <Link href="/track-order">
            <Button variant="outline" className="w-full mt-2">
              <PackageSearch size={16} /> Track or cancel an order
            </Button>
          </Link>
          <div className="text-xs text-muted space-y-1 pt-1">
            <p>Registration No.: {SITE.registration}</p>
            <p>
              Policies:{" "}
              <Link href="/cancellation-refund-policy" className="underline text-wine">
                Refunds
              </Link>
              {" · "}
              <Link href="/shipping-policy" className="underline text-wine">
                Shipping
              </Link>
              {" · "}
              <Link href="/privacy-policy" className="underline text-wine">
                Privacy
              </Link>
            </p>
          </div>
        </div>
        <form
          className="rounded-3xl border border-line bg-cream/40 p-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const text = `Contact form — Name: ${form.name}, Email: ${form.email}, Message: ${form.message}`;
            window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
            toast.success("Opening WhatsApp so we can reply faster");
            setForm({ name: "", email: "", message: "" });
          }}
        >
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Textarea placeholder="How can we help? Include order ID if relevant." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <Button type="submit" className="w-full" size="lg">Send via WhatsApp</Button>
        </form>
      </div>
    </div>
  );
}
