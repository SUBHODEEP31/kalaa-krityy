import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "kk_owner_session";

/**
 * Keep secret resolution identical to src/lib/auth.ts
 * (middleware runs on Edge — cannot import full auth module with cookies()).
 */
function getSecret() {
  const secret =
    process.env.OWNER_SESSION_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "kalaa-krityy-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

function isSecureCookie() {
  if (process.env.VERCEL === "1") return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    const existing = req.cookies.get(ADMIN_COOKIE)?.value;
    if (existing) {
      try {
        const { payload } = await jwtVerify(existing, getSecret());
        if (payload.role === "OWNER") {
          const url = req.nextUrl.clone();
          url.pathname = "/admin";
          url.search = "";
          return NextResponse.redirect(url);
        }
      } catch {
        // invalid cookie — show login
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "OWNER") {
      throw new Error("invalid role");
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    const res = NextResponse.redirect(url);
    res.cookies.set(ADMIN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      maxAge: 0,
    });
    return res;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
