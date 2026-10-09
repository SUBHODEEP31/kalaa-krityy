from pathlib import Path

# --- extend db.ts with orders ---
db = Path("src/lib/db.ts")
t = db.read_text(encoding="utf-8")

if "export interface Order" not in t:
    insert = '''
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
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

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  notes?: string;
}

'''
    t = t.replace("export interface CatalogDB {", insert + "export interface CatalogDB {")
    t = t.replace(
        """export interface CatalogDB {
  version: number;
  updatedAt: string;
  products: Product[];
  coupons: Coupon[];
  settings: SiteSettings;
}""",
        """export interface CatalogDB {
  version: number;
  updatedAt: string;
  products: Product[];
  coupons: Coupon[];
  settings: SiteSettings;
  orders: Order[];
}""",
    )
    t = t.replace(
        """    settings: {
      name: SITE.name,
      tagline: SITE.tagline,
      phone: SITE.phone,
      phoneRaw: SITE.phoneRaw,
      email: SITE.email,
      address: SITE.address,
      registration: SITE.registration,
      announcement: SITE.announcement,
      whatsappEnabled: true,
    },
  };
}""",
        """    settings: {
      name: SITE.name,
      tagline: SITE.tagline,
      phone: SITE.phone,
      phoneRaw: SITE.phoneRaw,
      email: SITE.email,
      address: SITE.address,
      registration: SITE.registration,
      announcement: SITE.announcement,
      whatsappEnabled: true,
    },
    orders: [],
  };
}""",
    )
    # normalize missing orders on read
    t = t.replace(
        "return JSON.parse(raw) as CatalogDB;",
        """const parsed = JSON.parse(raw) as CatalogDB;
    if (!Array.isArray(parsed.orders)) parsed.orders = [];
    return parsed;""",
    )
    t += '''

export async function getOrders(): Promise<Order[]> {
  const db = await readDB();
  return [...(db.orders || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createOrder(order: Order): Promise<Order> {
  const db = await readDB();
  if (!db.orders) db.orders = [];
  // reduce stock
  for (const item of order.items) {
    const p = db.products.find((x) => x.id === item.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - item.qty);
      p.sold = (p.sold || 0) + item.qty;
    }
  }
  db.orders.unshift(order);
  await writeDB(db);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const db = await readDB();
  const order = (db.orders || []).find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  await writeDB(db);
  return order;
}
'''
    db.write_text(t, encoding="utf-8")
    print("db_orders_ok")
else:
    print("db_orders_exists")
