"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ownerLoginAction, type LoginState } from "./actions";

const initial: LoginState = {};

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [state, formAction, pending] = useActionState(ownerLoginAction, initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-[28px] border border-line bg-white/90 p-6 md:p-8 shadow-lift space-y-4"
    >
      <input type="hidden" name="next" value={next} />
      <label className="block text-xs font-medium text-muted space-y-1.5">
        <span>Owner email</span>
        <Input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@kalaakrityy.com"
          required
        />
      </label>
      <label className="block text-xs font-medium text-muted space-y-1.5">
        <span>Password</span>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </label>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        <Lock size={16} />
        {pending ? "Verifying…" : "Enter dashboard"}
      </Button>
      <p className="text-[11px] text-center text-muted leading-relaxed pt-2 border-t border-line">
        Secure httpOnly session (24h). Set OWNER_EMAIL / OWNER_PASSWORD /
        OWNER_SESSION_SECRET on Vercel Production.
      </p>
    </form>
  );
}

export default function OwnerLoginPage() {
  return (
    <div className="min-h-[70vh] cream-radial flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full royal-gradient text-gold shadow-soft">
            <Shield size={22} />
          </div>
          <h1 className="font-display text-3xl text-wine">Owner Access</h1>
          <p className="mt-2 text-sm text-muted">
            Private console for Kalaa Krityy — products, stock, discounts & coupons.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-[28px] border border-line bg-white p-8 text-center text-muted text-sm">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-wine hover:underline">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
