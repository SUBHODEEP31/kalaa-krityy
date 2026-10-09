"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/badge";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container-pro py-16 max-w-md">
      <SectionHeading title="Welcome back" subtitle="Sign in to track orders and wishlists." />
      <form
        className="rounded-3xl border border-line bg-white p-6 space-y-3 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
                    localStorage.setItem("kk-auth", JSON.stringify({ role: "CUSTOMER", email }));
          toast.success("Signed in");
          router.push("/account");
        }}
      >
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" size="lg">Sign in</Button>
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-wine font-medium hover:underline">
            Create account
          </Link>
        </p>
        <p className="text-[11px] text-center text-muted pt-2 border-t border-line">
          Owner console: /admin/login (separate secure login)
        </p>
      </form>
    </div>
  );
}
