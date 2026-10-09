"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success("Welcome, owner");
      router.replace("/admin");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

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

        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-line bg-white/90 p-6 md:p-8 shadow-lift space-y-4"
        >
          <label className="block text-xs font-medium text-muted space-y-1.5">
            <span>Owner email</span>
            <Input
              type="email"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <Lock size={16} />
            {loading ? "Verifying…" : "Enter dashboard"}
          </Button>
          <p className="text-[11px] text-center text-muted leading-relaxed pt-2 border-t border-line">
            Session is httpOnly-cookie secured (12h). Change credentials in{" "}
            <code className="text-wine">.env</code> before going live.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-wine hover:underline">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
