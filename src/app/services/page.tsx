"use client";

import Image from "next/image";
import { useState } from "react";
import { Crown, Ruler, Scissors, Sparkles } from "lucide-react";
import { services, servicesImage, SITE } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { whatsappLink } from "@/lib/utils";
import { toast } from "sonner";

const icons = { scissors: Scissors, sparkles: Sparkles, ruler: Ruler, crown: Crown };

export default function ServicesPage() {
  const [form, setForm] = useState({ name: "", phone: "", service: "Custom Stitching", note: "" });

  return (
    <div>
      <section className="relative min-h-[42vh] flex items-end">
        <Image src={servicesImage} alt="Services" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-wine-deep via-wine-deep/50 to-wine-deep/20" />
        <div className="container-pro relative z-10 pb-12 pt-28 text-cream">
          <p className="text-xs uppercase tracking-[0.28em] text-gold-pale">Boutique Atelier</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Services & Custom Tailoring</h1>
          <p className="mt-3 max-w-xl text-cream/80">
            From measurement to final drape — precision stitching, alterations and personal styling in Patna.
          </p>
        </div>
      </section>

      <div className="container-pro py-14 md:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((s) => {
            const Icon = icons[s.icon as keyof typeof icons] || Scissors;
            return (
              <div key={s.id} className="rounded-3xl border border-line bg-white p-7 shadow-soft hover-lift">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-wine">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-2xl text-wine">{s.title}</h3>
                <p className="mt-2 text-muted leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Enquiry"
              title="Book a stitching consultation"
              subtitle="Share your requirements — fabric, occasion, timeline. We will confirm on WhatsApp."
              className="mb-6"
            />
            <a href={whatsappLink(`Hi ${SITE.name}, I need boutique services.`)} target="_blank" rel="noreferrer">
              <Button variant="whatsapp">Chat on WhatsApp</Button>
            </a>
          </div>
          <form
            className="rounded-3xl border border-line bg-cream/40 p-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Enquiry received — we will contact you shortly");
              setForm({ name: "", phone: "", service: "Custom Stitching", note: "" });
            }}
          >
            <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <select
              className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            >
              {services.map((s) => (
                <option key={s.id}>{s.title}</option>
              ))}
            </select>
            <Textarea placeholder="Tell us about your outfit / measurements" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <Button type="submit" className="w-full">Submit enquiry</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
