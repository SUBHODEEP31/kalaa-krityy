import Image from "next/image";
import { aboutImage, SITE } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="container-pro py-12 md:py-20">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
          <Image src={aboutImage} alt="About Kalaa Krityy" fill className="object-cover" priority />
        </div>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Our Story"
            title="Kalaa Krityy Boutique & Training Center"
            subtitle={SITE.motto}
            className="mb-6"
          />
          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              Born in Patna, Kalaa Krityy is a creative house where tradition is not archived — it is worn, taught and reimagined. We curate premium ethnic wear, offer bespoke stitching, and run hands-on training that turns passion into profession.
            </p>
            <p>
              Every saree, suit and blouse is chosen for fabric integrity and finishing. Our atelier handles custom orders with the patience of a craft studio and the polish of a modern boutique.
            </p>
            <p>
              Visit us at {SITE.address}. Registration No. {SITE.registration}.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["1000+", "Happy clients"],
              ["5", "Core categories"],
              ["3", "Pro courses"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-cream p-4 text-center">
                <p className="font-display text-2xl text-wine">{n}</p>
                <p className="text-[11px] text-muted mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
