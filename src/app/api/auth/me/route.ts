import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Prefer request cookies (same path as admin APIs) for consistency on Vercel
  const session = await requireOwner(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, role: "OWNER" },
  });
}
