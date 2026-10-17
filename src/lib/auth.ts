import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "kk_owner_session";
/** 24 hours — production owner console session */
export const OWNER_SESSION_MAX_AGE = 60 * 60 * 24;

/**
 * Single source of truth for JWT signing/verify.
 * Must match between Edge middleware and Node route handlers.
 * Always set OWNER_SESSION_SECRET on Vercel Production.
 */
export function getOwnerSessionSecretString() {
  const secret =
    process.env.OWNER_SESSION_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "kalaa-krityy-dev-secret-change-me";
  return secret;
}

function getSecret() {
  return new TextEncoder().encode(getOwnerSessionSecretString());
}

function isSecureCookie() {
  // Vercel always serves HTTPS; NODE_ENV is production there.
  if (process.env.VERCEL === "1") return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
}

export function ownerCookieOptions(maxAge = OWNER_SESSION_MAX_AGE) {
  return {
    httpOnly: true as const,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getOwnerCredentials() {
  return {
    email: (process.env.OWNER_EMAIL || "owner@kalaakrityy.com").toLowerCase(),
    password: process.env.OWNER_PASSWORD || "Kalaa@Owner2026",
  };
}

export async function createOwnerToken(email: string) {
  return new SignJWT({ role: "OWNER", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OWNER_SESSION_MAX_AGE}s`)
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
  res.cookies.set(ADMIN_COOKIE, token, ownerCookieOptions());
}

export async function setOwnerCookieOnStore(token: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, ownerCookieOptions());
}

export function clearOwnerCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", {
    ...ownerCookieOptions(0),
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
