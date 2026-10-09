from pathlib import Path

p = Path("src/app/product/[slug]/page.tsx")
t = p.read_text(encoding="utf-8")

t = t.replace(
    'import { use, useMemo, useState } from "react";',
    'import { use, useEffect, useMemo, useState } from "react";',
)

old_imp = '''import {
  getProductBySlug,
  getRelated,
  SITE,
} from "@/data/catalog";'''

new_imp = '''import { getProductBySlug, products as seedProducts, SITE } from "@/data/catalog";
import type { Product } from "@/types";'''

if old_imp in t:
    t = t.replace(old_imp, new_imp)

t = t.replace(
'''  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [img, setImg] = useState(0);''',
'''  const { slug } = use(params);
  const seed = getProductBySlug(slug);
  const [product, setProduct] = useState(seed || null);
  const [img, setImg] = useState(0);

  useEffect(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.products || []).find((x: Product) => x.slug === slug);
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [slug]);'''
)

t = t.replace(
'''  const related = useMemo(
    () => (product ? getRelated(product) : []),
    [product]
  );''',
'''  const related = useMemo(() => {
    if (!product) return [] as Product[];
    return seedProducts
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, 4);
  }, [product]);'''
)

p.write_text(t, encoding="utf-8")
print("pdp_ok")
