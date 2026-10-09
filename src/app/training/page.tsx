"use client";

import Image from "next/image";
import { useState } from "react";
import { courses, trainingImage } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

export default function TrainingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState(courses[0].title);

  return (
    <div>
      <section className="relative min-h-[42vh] flex items-end">
        <Image src={trainingImage} alt="Training" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-wine-deep via-wine-deep/55 to-transparent" />
        <div className="container-pro relative z-10 pb-12 pt-28 text-cream">
          <p className="text-xs uppercase tracking-[0.28em] text-gold-pale">Academy</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Training Programs</h1>
          <p className="mt-3 max-w-xl text-cream/80">
            Professional courses in stitching, dress designing and handicrafts — taught by boutique practitioners.
          </p>
        </div>
      </section>

      <div className="container-pro py-14 md:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {courses.map((c) => (
            <article key={c.id} className="rounded-[28px] border border-line bg-white overflow-hidden shadow-soft hover-lift">
              <div className="relative h-48">
                <Image src={c.image} alt={c.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{c.duration}</p>
                <h3 className="mt-1 font-display text-2xl text-wine">{c.title}</h3>
                <p className="mt-1 text-xs text-muted">{c.level}</p>
                <p className="mt-3 text-sm text-muted leading-relaxed">{c.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {c.highlights.map((h) => (
                    <li key={h} className="text-sm text-ink flex gap-2">
                      <span className="text-gold">✦</span> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-semibold text-wine text-lg">{formatINR(c.price)}</span>
                  <Button size="sm" onClick={() => setCourse(c.title)}>Select</Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[28px] cream-radial border border-line p-8 md:p-10 max-w-2xl mx-auto">
          <SectionHeading title="Enrolment form" subtitle="We will confirm batch dates on your phone." className="mb-6" />
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Enrolment request submitted");
              setName("");
              setPhone("");
            }}
          >
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Phone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <select className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm" value={course} onChange={(e) => setCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id}>{c.title}</option>
              ))}
            </select>
            <Button type="submit" className="w-full" size="lg">Enroll Now</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
