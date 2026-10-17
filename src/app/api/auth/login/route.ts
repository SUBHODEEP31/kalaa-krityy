import { NextRequest, NextResponse } from "next/server";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  createOwnerToken,
  getOwnerCredentials,
  setOwnerCookie,
  setOwnerCookieOnStore,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  const limit = checkLoginRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Too many attempts. Try again later.",
        retryAfterSec: limit.retryAfterSec,
      },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const creds = getOwnerCredentials();

  if (email !== creds.email || password !== creds.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  clearLoginRateLimit(ip);
  const token = await createOwnerToken(email);

  // Dual-set: cookie store + response header (most reliable on Vercel)
  try {
    await setOwnerCookieOnStore(token);
  } catch {
    // cookies().set can throw outside certain contexts — response set still applies
  }

  const res = NextResponse.json({
    ok: true,
    user: { email, role: "OWNER" },
  });
  setOwnerCookie(res, token);
  return res;
}
