from pathlib import Path

# Fix sections imports
p = Path("src/components/home/sections.tsx")
t = p.read_text(encoding="utf-8")
if "useCatalog" not in t:
    # add after utils import
    if 'from "@/lib/utils"' in t:
        t = t.replace(
            'from "@/lib/utils";',
            'from "@/lib/utils";\nimport { useCatalog } from "@/lib/use-catalog";\nimport type { Product } from "@/types";',
        )
    else:
        t = 'import { useCatalog } from "@/lib/use-catalog";\nimport type { Product } from "@/types";\n' + t
if "useMemo" not in t.split("from \"react\"")[0]:
    t = t.replace(
        'import { useCallback, useEffect, useState } from "react";',
        'import { useCallback, useEffect, useMemo, useState } from "react";',
    )
    t = t.replace(
        "import { useState } from \"react\";",
        "import { useMemo, useState } from \"react\";",
    )
# type product params
t = t.replace(
    ".filter((p) => p.mrp > p.price)",
    ".filter((p: Product) => p.mrp > p.price)",
)
t = t.replace(
    ".sort((a, b) => b.createdAt.localeCompare(a.createdAt))",
    ".sort((a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt))",
)
t = t.replace(
    ".sort((a, b) => b.sold - a.sold)",
    ".sort((a: Product, b: Product) => b.sold - a.sold)",
)
t = t.replace(
    ".sort((a, b) => b.mrp - b.price - (a.mrp - a.price))",
    ".sort((a: Product, b: Product) => b.mrp - b.price - (a.mrp - a.price))",
)
p.write_text(t, encoding="utf-8")
print("sections_fixed", "useCatalog" in t)

# Fix admin startEdit
ap = Path("src/app/admin/page.tsx")
at = ap.read_text(encoding="utf-8")
# find startEdit setForm block missing sizes
if "sizesText: (p.sizes" not in at:
    at = at.replace(
        """    setForm({
      name: p.name,
      categorySlug: p.categorySlug,
      mrp: String(p.mrp),
      price: String(p.price),
      stock: String(p.stock),
      fabric: p.fabric || "",
      description: p.description || "",
      images: [...p.images],
      featured: Boolean(p.featured),
      bestseller: p.badges.includes("bestseller"),
    });""",
        """    setForm({
      name: p.name,
      categorySlug: p.categorySlug,
      mrp: String(p.mrp),
      price: String(p.price),
      stock: String(p.stock),
      fabric: p.fabric || "",
      description: p.description || "",
      images: [...p.images],
      sizesText: (p.sizes || ["Free Size"]).join(", "),
      colorsText: (p.colors || ["#4A0E2E"]).join(", "),
      featured: Boolean(p.featured),
      bestseller: p.badges.includes("bestseller"),
    });""",
    )
    print("startEdit_fixed")
else:
    print("startEdit_already")

# ensure nav has orders
if '["orders", "Orders"' not in at:
    at = at.replace(
        '["coupons", "Coupons", Tag],',
        '["coupons", "Coupons", Tag],\n              ["orders", "Orders", Package],',
    )
    print("nav_orders_added")

ap.write_text(at, encoding="utf-8")
print("admin_ok")
