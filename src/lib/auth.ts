import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "kk_owner_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function getSecret() {
  const secret =
    process.env.OWNER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "kalaa-krityy-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function getOwnerCredentials() {
  return {
    email: (process.env.OWNER_EMAIL || "owner@kalaakrityy.com").toLowerCase(),
    // Default strong-ish demo password — change via .env for production
    password: process.env.OWNER_PASSWORD || "Kalaa@Owner2026",
  };
}

export async function createOwnerToken(email: string) {
  return new SignJWT({ role: "OWNER", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyOwnerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "OWNER") return null;
    return payload as { role: string; email: string };
  } catch {
    return null;
  }
}

export async function getOwnerSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyOwnerToken(token);
}

export function setOwnerCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearOwnerCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireOwner(req?: NextRequest) {
  if (req) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    return verifyOwnerToken(token);
  }
  return getOwnerSession();
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Simple in-memory rate limit for login attempts (per process). */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string) {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || row.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { ok: true as const };
  }
  if (row.count >= 8) {
    return {
      ok: false as const,
      retryAfterSec: Math.ceil((row.resetAt - now) / 1000),
    };
  }
  row.count += 1;
  return { ok: true as const };
}

export function clearLoginRateLimit(ip: string) {
  attempts.delete(ip);
}
