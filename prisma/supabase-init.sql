-- Kalaa Krityy production schema (idempotent)
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'OWNER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "phone" TEXT UNIQUE,
  "name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "categorySlug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "care" TEXT,
  "fabric" TEXT,
  "mrp" DOUBLE PRECISION NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "images" TEXT[] NOT NULL DEFAULT '{}',
  "colors" TEXT[] NOT NULL DEFAULT '{}',
  "sizes" TEXT[] NOT NULL DEFAULT '{}',
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sold" INTEGER NOT NULL DEFAULT 0,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "badges" TEXT[] NOT NULL DEFAULT '{}',
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Product_categorySlug_idx" ON "Product"("categorySlug");
CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");

CREATE TABLE IF NOT EXISTS "Coupon" (
  "code" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL DEFAULT 'percent',
  "value" DOUBLE PRECISION NOT NULL,
  "minOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "description" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT PRIMARY KEY,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerEmail" TEXT,
  "shippingAddress" JSONB NOT NULL DEFAULT '{}',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "couponCode" TEXT,
  "paymentMethod" TEXT,
  "razorpayOrderId" TEXT,
  "razorpayPayId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_customerPhone_idx" ON "Order"("customerPhone");

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "slug" TEXT NOT NULL DEFAULT '',
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "mrp" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "image" TEXT NOT NULL DEFAULT '',
  "size" TEXT NOT NULL DEFAULT 'Free Size',
  "color" TEXT NOT NULL DEFAULT '',
  "quantity" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

CREATE TABLE IF NOT EXISTS "SiteSettings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "name" TEXT NOT NULL DEFAULT 'Kalaa Krityy',
  "tagline" TEXT NOT NULL DEFAULT 'Boutique & Training Center',
  "phone" TEXT NOT NULL DEFAULT '79798 20645',
  "phoneRaw" TEXT NOT NULL DEFAULT '917979820645',
  "email" TEXT NOT NULL DEFAULT 'kalaakrityy@gmail.com',
  "address" TEXT NOT NULL DEFAULT 'Vinay Tower, Patna, Bihar',
  "registration" TEXT NOT NULL DEFAULT 'BR-26-0018641',
  "announcement" TEXT NOT NULL DEFAULT '',
  "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- PostgREST / service_role access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Expose to API
NOTIFY pgrst, 'reload schema';
