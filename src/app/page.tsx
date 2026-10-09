import {
  HeroCarousel,
  TrustStrip,
  CategoryShowcase,
  ProductRails,
  ServicesTrainingAbout,
  ReviewsAndGallery,
  CouponBanner,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <TrustStrip />
      <CategoryShowcase />
      <ProductRails />
      <ServicesTrainingAbout />
      <ReviewsAndGallery />
      <CouponBanner />
    </>
  );
}
