export type ProductBadge = "new" | "bestseller" | "sale" | "limited";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  care?: string;
  fabric?: string;
  mrp: number;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  badges: ProductBadge[];
  tags: string[];
  featured?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
}

export interface Review {
  id: string;
  name: string;
  city?: string;
  rating: number;
  text: string;
  product?: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  duration: string;
  level: string;
  price: number;
  description: string;
  highlights: string[];
  image: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  description: string;
  active: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color: string;
  qty: number;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  tone: "light" | "dark";
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}
