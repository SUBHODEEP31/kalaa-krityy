import { NextResponse } from "next/server";
import { clearOwnerCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearOwnerCookie(res);
  return res;
}
