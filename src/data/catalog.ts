import type {
  Category,
  Coupon,
  Course,
  HeroSlide,
  Product,
  Review,
  ServiceItem,
} from "@/types";

/** Curated Unsplash fashion imagery — premium editorial look */
const img = {
  saree1:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
  saree2:
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80",
  saree3:
    "https://images.unsplash.com/photo-1594873604892-b599f847e859?w=900&q=80",
  suit1:
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=80",
  suit2:
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&q=80",
  blouse1:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80",
  blouse2:
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=80",
  fabric1:
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80",
  fabric2:
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80",
  craft1:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80",
  craft2:
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=900&q=80",
  hero1:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=85",
  hero2:
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1600&q=85",
  hero3:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85",
  mannequin:
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80",
  sewing:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
  about:
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80",
g1: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  g2: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
  g3: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  g4: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  g5: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
  g6: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  g7: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
  g8: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
};

export const SITE = {
  name: "Kalaa Krityy",
  tagline: "A Unit of Krity Creations",
  motto: "Where Tradition Meets Creativity",
  phone: "79798 20645",
  phoneRaw: "917979820645",
  email: "kalaakrityy@gmail.com",
  address: "Vinay Tower, Patna, Bihar",
  registration: "BR-26-0018641",
  instagram: "https://www.instagram.com/kalaakrityy/",
  announcement:
    "Festive Edit Live · Free alterations on custom orders above ₹2,999 · Use code KALAA10",
};

export const categories: Category[] = [
  {
    id: "c1",
    name: "Sarees",
    slug: "sarees",
    description: "Handpicked silks, banarasi, organza & festive weaves",
    image: img.saree1,
    count: 48,
  },
  {
    id: "c2",
    name: "Dress Materials",
    slug: "dress-materials",
    description: "Premium unstitched fabrics for bespoke silhouettes",
    image: img.fabric1,
    count: 36,
  },
  {
    id: "c3",
    name: "Readymade Suits",
    slug: "readymade-suits",
    description: "Elegant suits tailored for everyday grace",
    image: img.suit1,
    count: 42,
  },
  {
    id: "c4",
    name: "Blouses",
    slug: "blouses",
    description: "Statement backs, fine embroidery & custom fits",
    image: img.blouse1,
    count: 28,
  },
  {
    id: "c5",
    name: "Handicrafts",
    slug: "handicrafts",
    description: "Artisanal décor & gifts crafted with love",
    image: img.craft1,
    count: 22,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "banarasi-silk-maroon-saree",
    name: "Royal Banarasi Silk Saree — Maroon Gold",
    category: "Sarees",
    categorySlug: "sarees",
    description:
      "A regal maroon Banarasi silk saree woven with intricate gold zari motifs. Drapes with quiet luxury — perfect for weddings, receptions and festive evenings. Comes with a matching unstitched blouse piece.",
    care: "Dry clean only. Store in muslin.",
    fabric: "Pure Banarasi Silk",
    mrp: 8999,
    price: 6499,
    images: [img.saree1, img.saree2, img.saree3],
    colors: ["#6B1D3A", "#C9A227"],
    sizes: ["Free Size"],
    stock: 12,
    sold: 86,
    rating: 4.9,
    reviewCount: 34,
    badges: ["bestseller", "sale"],
    tags: ["wedding", "silk", "festive"],
    featured: true,
    createdAt: "2026-07-01",
  },
  {
    id: "p2",
    slug: "pastel-organza-floral-saree",
    name: "Pastel Organza Floral Saree",
    category: "Sarees",
    categorySlug: "sarees",
    description:
      "Feather-light organza with hand-finished floral borders. Soft pastels for daytime functions and intimate celebrations.",
    care: "Dry clean recommended.",
    fabric: "Organza",
    mrp: 5499,
    price: 4299,
    images: [img.saree2, img.saree1],
    colors: ["#E8D5C4", "#F5E6D3"],
    sizes: ["Free Size"],
    stock: 18,
    sold: 54,
    rating: 4.7,
    reviewCount: 21,
    badges: ["new"],
    tags: ["organza", "pastel"],
    featured: true,
    createdAt: "2026-08-01",
  },
  {
    id: "p3",
    slug: "kanjeevaram-heritage-saree",
    name: "Kanjeevaram Heritage Weave",
    category: "Sarees",
    categorySlug: "sarees",
    description:
      "Traditional temple border Kanjeevaram with rich contrast pallu. A heirloom piece for the modern wardrobe.",
    fabric: "Kanjeevaram Silk",
    mrp: 12999,
    price: 10999,
    images: [img.saree3, img.saree1],
    colors: ["#8B2500", "#FFD700"],
    sizes: ["Free Size"],
    stock: 6,
    sold: 41,
    rating: 5,
    reviewCount: 18,
    badges: ["limited", "bestseller"],
    tags: ["kanjeevaram", "bridal"],
    featured: true,
    createdAt: "2026-06-12",
  },
  {
    id: "p4",
    slug: "embroidered-anarkali-suit-teal",
    name: "Embroidered Anarkali Suit — Teal",
    category: "Readymade Suits",
    categorySlug: "readymade-suits",
    description:
      "Floor-grazing anarkali with delicate thread work and lined georgette flare. Includes dupatta and churidar.",
    fabric: "Georgette",
    mrp: 4999,
    price: 3499,
    images: [img.suit1, img.suit2],
    colors: ["#0D7377", "#14919B"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 20,
    sold: 112,
    rating: 4.8,
    reviewCount: 47,
    badges: ["bestseller", "sale"],
    tags: ["anarkali", "party"],
    featured: true,
    createdAt: "2026-07-18",
  },
  {
    id: "p5",
    slug: "cotton-linen-everyday-suit",
    name: "Cotton Linen Everyday Suit",
    category: "Readymade Suits",
    categorySlug: "readymade-suits",
    description:
      "Breathable cotton-linen set with minimal embroidery. Designed for comfort without compromising elegance.",
    fabric: "Cotton Linen",
    mrp: 2799,
    price: 2199,
    images: [img.suit2, img.suit1],
    colors: ["#F5F0E8", "#2C2C2C"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 30,
    sold: 98,
    rating: 4.6,
    reviewCount: 39,
    badges: ["new"],
    tags: ["cotton", "daily"],
    featured: true,
    createdAt: "2026-08-05",
  },
  {
    id: "p6",
    slug: "velvet-festive-sharara-set",
    name: "Velvet Festive Sharara Set",
    category: "Readymade Suits",
    categorySlug: "readymade-suits",
    description:
      "Luxe velvet kurta with flared sharara and sequin-dusted dupatta. Evening glamour, boutique finish.",
    fabric: "Velvet",
    mrp: 7499,
    price: 5999,
    images: [img.suit1, img.blouse1],
    colors: ["#4A0E2E", "#1A1A2E"],
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
    sold: 63,
    rating: 4.9,
    reviewCount: 28,
    badges: ["sale", "bestseller"],
    tags: ["velvet", "wedding"],
    featured: true,
    createdAt: "2026-07-22",
  },
  {
    id: "p7",
    slug: "zardozi-backless-blouse",
    name: "Zardozi Statement Back Blouse",
    category: "Blouses",
    categorySlug: "blouses",
    description:
      "Deep back blouse with hand zardozi and padded structure. Pairs beautifully with plain or kanjeevaram sarees.",
    fabric: "Silk Blend",
    mrp: 3499,
    price: 2699,
    images: [img.blouse1, img.blouse2],
    colors: ["#6B1D3A", "#0A0A0A"],
    sizes: ["32", "34", "36", "38", "40", "42"],
    stock: 15,
    sold: 77,
    rating: 4.8,
    reviewCount: 31,
    badges: ["bestseller"],
    tags: ["blouse", "zardozi"],
    featured: true,
    createdAt: "2026-07-10",
  },
  {
    id: "p8",
    slug: "pearl-boat-neck-blouse",
    name: "Pearl Boat Neck Blouse",
    category: "Blouses",
    categorySlug: "blouses",
    description:
      "Refined boat neck with pearl cluster sleeves. Soft lining for all-day wear.",
    fabric: "Raw Silk",
    mrp: 2499,
    price: 1899,
    images: [img.blouse2, img.blouse1],
    colors: ["#F8F1E3", "#C9A227"],
    sizes: ["32", "34", "36", "38", "40"],
    stock: 22,
    sold: 45,
    rating: 4.5,
    reviewCount: 16,
    badges: ["new"],
    tags: ["blouse", "pearl"],
    createdAt: "2026-08-08",
  },
  {
    id: "p9",
    slug: "handblock-cotton-dress-material",
    name: "Handblock Cotton Dress Material",
    category: "Dress Materials",
    categorySlug: "dress-materials",
    description:
      "3.5m premium handblock cotton with matching dupatta fabric. Ideal for kurtas and anarkalis — stitch at our boutique or yours.",
    fabric: "Handblock Cotton",
    mrp: 1899,
    price: 1499,
    images: [img.fabric1, img.fabric2],
    colors: ["#B85C38", "#F4E4C1"],
    sizes: ["2.5m", "3.5m", "5m"],
    stock: 40,
    sold: 130,
    rating: 4.7,
    reviewCount: 52,
    badges: ["bestseller", "sale"],
    tags: ["unstitched", "cotton"],
    featured: true,
    createdAt: "2026-06-28",
  },
  {
    id: "p10",
    slug: "banarasi-brocade-dress-material",
    name: "Banarasi Brocade Dress Material",
    category: "Dress Materials",
    categorySlug: "dress-materials",
    description:
      "Heavy brocade suitable for lehengas and grand kurtas. Rich weave with soft fall.",
    fabric: "Banarasi Brocade",
    mrp: 4599,
    price: 3799,
    images: [img.fabric2, img.fabric1],
    colors: ["#4A0E2E", "#C9A227"],
    sizes: ["3.5m", "5m"],
    stock: 14,
    sold: 38,
    rating: 4.8,
    reviewCount: 14,
    badges: ["limited"],
    tags: ["brocade", "unstitched"],
    createdAt: "2026-07-30",
  },
  {
    id: "p11",
    slug: "jaipur-blue-pottery-vase-set",
    name: "Jaipur Blue Pottery Vase Set",
    category: "Handicrafts",
    categorySlug: "handicrafts",
    description:
      "Hand-painted blue pottery pair — gift-ready packaging. A touch of craft for modern homes.",
    fabric: "Ceramic",
    mrp: 2299,
    price: 1799,
    images: [img.craft1, img.craft2],
    colors: ["#1E90FF", "#FFFFFF"],
    sizes: ["Set of 2"],
    stock: 25,
    sold: 67,
    rating: 4.6,
    reviewCount: 22,
    badges: ["sale"],
    tags: ["decor", "gift"],
    createdAt: "2026-07-05",
  },
  {
    id: "p12",
    slug: "handloom-table-runner-kit",
    name: "Handloom Table Runner & Coaster Kit",
    category: "Handicrafts",
    categorySlug: "handicrafts",
    description:
      "Woven table runner with six coasters. Natural dyes, artisan cooperative made.",
    mrp: 1599,
    price: 1299,
    images: [img.craft2, img.craft1],
    colors: ["#D4A574", "#5C4033"],
    sizes: ["Standard"],
    stock: 18,
    sold: 29,
    rating: 4.4,
    reviewCount: 9,
    badges: ["new"],
    tags: ["home", "handloom"],
    createdAt: "2026-08-10",
  },
  {
    id: "p13",
    slug: "meenakari-festive-saree",
    name: "Meenakari Festive Saree",
    category: "Sarees",
    categorySlug: "sarees",
    description:
      "Vibrant meenakari work on soft silk blend. Lightweight drape with dramatic border.",
    fabric: "Silk Blend",
    mrp: 6999,
    price: 4999,
    images: [img.saree1, img.saree3],
    colors: ["#9B1B30", "#FF6B35"],
    sizes: ["Free Size"],
    stock: 9,
    sold: 58,
    rating: 4.7,
    reviewCount: 25,
    badges: ["sale", "bestseller"],
    tags: ["festive", "meenakari"],
    featured: true,
    createdAt: "2026-07-14",
  },
  {
    id: "p14",
    slug: "chikankari-lucknowi-kurta-set",
    name: "Chikankari Lucknowi Kurta Set",
    category: "Readymade Suits",
    categorySlug: "readymade-suits",
    description:
      "Authentic shadow-work chikankari on mulmul cotton. Cool, refined, endlessly wearable.",
    fabric: "Mulmul Cotton",
    mrp: 3999,
    price: 2999,
    images: [img.suit2, img.fabric1],
    colors: ["#FFFFFF", "#E8F0FE"],
    sizes: ["S", "M", "L", "XL"],
    stock: 24,
    sold: 91,
    rating: 4.9,
    reviewCount: 44,
    badges: ["bestseller", "new"],
    tags: ["chikankari", "cotton"],
    featured: true,
    createdAt: "2026-08-03",
  },
  {
    id: "p15",
    slug: "mirror-work-ghaghra-choli",
    name: "Mirror Work Ghaghra Choli",
    category: "Readymade Suits",
    categorySlug: "readymade-suits",
    description:
      "Rajasthani-inspired mirror work set with flouncy ghaghra. Celebration-ready.",
    fabric: "Art Silk",
    mrp: 8499,
    price: 6799,
    images: [img.suit1, img.blouse2],
    colors: ["#FF1493", "#FFD700"],
    sizes: ["S", "M", "L"],
    stock: 7,
    sold: 33,
    rating: 4.8,
    reviewCount: 12,
    badges: ["limited", "sale"],
    tags: ["ghaghra", "festive"],
    createdAt: "2026-06-20",
  },
  {
    id: "p16",
    slug: "designer-sleeveless-blouse",
    name: "Designer Sleeveless Cutwork Blouse",
    category: "Blouses",
    categorySlug: "blouses",
    description:
      "Architectural cutwork with soft cups and side zip. Modern silhouette for classic drapes.",
    fabric: "Dupion Silk",
    mrp: 2999,
    price: 2399,
    images: [img.blouse1, img.saree2],
    colors: ["#2C1810", "#F5E6D3"],
    sizes: ["32", "34", "36", "38", "40"],
    stock: 16,
    sold: 49,
    rating: 4.6,
    reviewCount: 19,
    badges: ["new"],
    tags: ["modern", "blouse"],
    createdAt: "2026-08-06",
  },
];

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    eyebrow: "Festive Edit 2026",
    title: "Kalaa Krityy",
    subtitle: "Unique Fashion · Custom Stitching · Handicraft Training",
    cta: "Shop the Collection",
    href: "/shop",
    image: img.hero1,
    tone: "light",
  },
  {
    id: "h2",
    eyebrow: "Boutique Atelier",
    title: "Tailored to You",
    subtitle: "Custom stitching, perfect fit — from measurement to final drape",
    cta: "Book Stitching",
    href: "/services",
    image: img.hero2,
    tone: "dark",
  },
  {
    id: "h3",
    eyebrow: "New Arrivals",
    title: "Crafted Stories",
    subtitle: "Sarees, suits & blouses curated for the modern Indian wardrobe",
    cta: "Explore New",
    href: "/shop?sort=newest",
    image: img.hero3,
    tone: "dark",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Neha Singh",
    city: "Patna",
    rating: 5,
    text: "Amazing quality, perfect stitching and beautiful designs. Love shopping from Kalaa Krityy!",
    product: "Royal Banarasi Silk Saree",
    date: "2026-07-20",
  },
  {
    id: "r2",
    name: "Ananya Verma",
    city: "Gaya",
    rating: 5,
    text: "Got my wedding trousseau stitched here — the fit was flawless and the fabric suggestions were spot on.",
    date: "2026-06-14",
  },
  {
    id: "r3",
    name: "Priya Kumari",
    city: "Muzaffarpur",
    rating: 5,
    text: "Enrolled in the stitching course. Teachers are patient and the curriculum is truly professional.",
    date: "2026-05-30",
  },
  {
    id: "r4",
    name: "Shreya Mishra",
    city: "Patna",
    rating: 4,
    text: "Blouse work is exceptional. Turnaround was quick and finishing is boutique-level.",
    product: "Zardozi Statement Back Blouse",
    date: "2026-08-02",
  },
  {
    id: "r5",
    name: "Ritika Jha",
    city: "Bhagalpur",
    rating: 5,
    text: "Ordered a saree online and received exactly as shown. Packaging felt premium.",
    date: "2026-07-28",
  },
];

export const courses: Course[] = [
  {
    id: "co1",
    title: "Stitching Course",
    duration: "3 Months",
    level: "Beginner → Intermediate",
    price: 8999,
    description:
      "Master fundamentals of garment construction, measurements, and finishing used in boutique production.",
    highlights: [
      "Pattern making basics",
      "Blouse & kurta construction",
      "Machine handling",
      "Industry finishing",
    ],
    image: img.sewing,
  },
  {
    id: "co2",
    title: "Dress Designing Course",
    duration: "4 Months",
    level: "Intermediate",
    price: 12999,
    description:
      "From moodboards to final garments — learn design thinking, illustration, and collection building.",
    highlights: [
      "Design process",
      "Fabric science",
      "Draping intro",
      "Portfolio project",
    ],
    image: img.mannequin,
  },
  {
    id: "co3",
    title: "Handicraft Course",
    duration: "2 Months",
    level: "All Levels",
    price: 5999,
    description:
      "Explore embroidery, surface ornamentation and craft techniques that elevate boutique pieces.",
    highlights: [
      "Hand embroidery",
      "Surface techniques",
      "Product finishing",
      "Market-ready crafts",
    ],
    image: img.craft2,
  },
];

export const services: ServiceItem[] = [
  {
    id: "s1",
    title: "Custom Stitching",
    description: "Bespoke garments from your fabric or ours — precision fit guaranteed.",
    icon: "scissors",
  },
  {
    id: "s2",
    title: "Dress Designing",
    description: "Collaborative design for trousseaus, events and signature looks.",
    icon: "sparkles",
  },
  {
    id: "s3",
    title: "Alteration & Fitting",
    description: "Expert alterations that respect the original silhouette.",
    icon: "ruler",
  },
  {
    id: "s4",
    title: "Boutique Consultation",
    description: "Personal styling sessions for weddings and festive wardrobes.",
    icon: "crown",
  },
];

export const coupons: Coupon[] = [
  {
    code: "KALAA10",
    type: "percent",
    value: 10,
    minOrder: 1999,
    description: "10% off on orders above ₹1,999",
    active: true,
  },
  {
    code: "FIRST500",
    type: "flat",
    value: 500,
    minOrder: 3999,
    description: "Flat ₹500 off on first order above ₹3,999",
    active: true,
  },
  {
    code: "FESTIVE15",
    type: "percent",
    value: 15,
    minOrder: 4999,
    description: "Festive special — 15% off above ₹4,999",
    active: true,
  },
  {
    code: "BLOUSE200",
    type: "flat",
    value: 200,
    minOrder: 1499,
    description: "₹200 off blouse orders above ₹1,499",
    active: true,
  },
];

export const trustBadges = [
  {
    title: "Premium Quality",
    subtitle: "Finest fabrics & handpicked designs",
    icon: "award",
  },
  {
    title: "Custom Stitching",
    subtitle: "Perfect fit, just for you",
    icon: "shirt",
  },
  {
    title: "Pan India Delivery",
    subtitle: "Safe & fast shipping",
    icon: "truck",
  },
  {
    title: "Secure Payment",
    subtitle: "100% safe checkout",
    icon: "shield",
  },
  {
    title: "Customer Support",
    subtitle: "We're here for you",
    icon: "headset",
  },
  {
    title: "Trusted Brand",
    subtitle: "Loved by 1000+ customers",
    icon: "heart",
  },
];

export const galleryImages = [
  img.g1,
  img.g2,
  img.g3,
  img.g4,
  img.g5,
  img.g6,
  img.g7,
  img.g8,
  img.saree1,
  img.saree2,
  img.suit1,
  img.blouse1,
];

export const aboutImage = img.about;
export const servicesImage = img.mannequin;
export const trainingImage = img.sewing;

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}

export function getRelated(product: Product, limit = 4) {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);
}

export function getNewArrivals(limit = 8) {
  return [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getBestsellers(limit = 8) {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit);
}

export function getSaleProducts(limit = 8) {
  return products
    .filter((p) => p.mrp > p.price)
    .sort((a, b) => b.mrp - b.price - (a.mrp - a.price))
    .slice(0, limit);
}

export function searchProducts(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.fabric?.toLowerCase().includes(q)
  );
}

export function applyCoupon(code: string, subtotal: number) {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
  );
  if (!coupon) return { ok: false as const, error: "Invalid coupon code" };
  if (subtotal < coupon.minOrder)
    return {
      ok: false as const,
      error: `Minimum order ₹${coupon.minOrder.toLocaleString("en-IN")} required`,
    };
  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return {
    ok: true as const,
    coupon,
    discount: Math.min(discount, subtotal),
  };
}
