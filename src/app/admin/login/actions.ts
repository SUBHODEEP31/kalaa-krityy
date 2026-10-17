"use server";

import { redirect } from "next/navigation";
import {
  createOwnerToken,
  getOwnerCredentials,
  setOwnerCookieOnStore,
  checkLoginRateLimit,
  clearLoginRateLimit,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function ownerLoginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "/admin");
  const next =
    nextRaw.startsWith("/admin") && !nextRaw.startsWith("/admin/login")
      ? nextRaw
      : "/admin";

  const ip = "action";
  const limit = checkLoginRateLimit(ip);
  if (!limit.ok) {
    return { error: "Too many attempts. Try again later." };
  }

  const creds = getOwnerCredentials();
  if (email !== creds.email || password !== creds.password) {
    return { error: "Invalid email or password" };
  }

  clearLoginRateLimit(ip);
  const token = await createOwnerToken(email);
  await setOwnerCookieOnStore(token);

  // redirect throws — ends the action with Set-Cookie on the response
  redirect(next);
}
