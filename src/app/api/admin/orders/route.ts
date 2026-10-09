import { NextRequest, NextResponse } from "next/server";
import { requireOwner, unauthorized } from "@/lib/auth";
import { getOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireOwner(req);
  if (!session) return unauthorized();
  const orders = await getOrders();
  return NextResponse.json({ orders });
}
