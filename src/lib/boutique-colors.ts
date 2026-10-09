export type BoutiqueColor = {
  name: string;
  hex: string;
};

/** Curated Indian boutique fabric swatches for admin + storefront. */
export const BOUTIQUE_COLORS: BoutiqueColor[] = [
  { name: "Rani Pink", hex: "#E0115F" },
  { name: "Royal Maroon", hex: "#6B1D3A" },
  { name: "Wine Deep", hex: "#4A0E2E" },
  { name: "Antique Gold", hex: "#C9A227" },
  { name: "Mustard Yellow", hex: "#E1AD01" },
  { name: "Emerald Green", hex: "#046307" },
  { name: "Peacock Teal", hex: "#0D7377" },
  { name: "Royal Blue", hex: "#1B1F3B" },
  { name: "Midnight Navy", hex: "#001F3F" },
  { name: "Crimson Red", hex: "#990000" },
  { name: "Pastel Peach", hex: "#F4C2C2" },
  { name: "Lavender Lilac", hex: "#B57EDC" },
  { name: "Ivory Off-White", hex: "#FAF7F2" },
  { name: "Jet Black", hex: "#1A1A1A" },
];

export function normalizeHex(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) return null;
  return withHash.toUpperCase();
}

export function colorLabel(hexOrName: string): string {
  const n = normalizeHex(hexOrName);
  if (n) {
    const found = BOUTIQUE_COLORS.find((c) => c.hex.toUpperCase() === n);
    return found ? found.name : n;
  }
  return hexOrName;
}

export function colorStyle(value: string): string {
  const n = normalizeHex(value);
  if (n) return n;
  // named colours fall back to wine if unknown CSS name fails
  return value;
}
