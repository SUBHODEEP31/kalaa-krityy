import Image from "next/image";
import { galleryImages, SITE } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/badge";
import { SocialIconLinks } from "@/components/ui/social-icons";

const FALLBACK =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";

export default function GalleryPage() {
  const shots = Array.from(new Set(galleryImages)).slice(0, 12);

  return (
    <div className="container-pro py-10 md:py-16">
      <SectionHeading
        eyebrow="Lookbook"
        title="Gallery"
        subtitle={`A visual diary of drapes, details and atelier moments from ${SITE.name}.`}
      />
      <div className="mb-8 flex justify-center">
        <SocialIconLinks size="lg" showLabels />
      </div>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {shots.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative break-inside-avoid overflow-hidden rounded-2xl img-zoom bg-cream-dark"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={src || FALLBACK}
                alt={`Kalaa Krityy gallery look ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width:768px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
