"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/badge";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <div className="container-pro py-16 max-w-md">
      <SectionHeading title="Create account" subtitle="Join Kalaa Krityy for faster checkout." />
      <form
        className="rounded-3xl border border-line bg-white p-6 space-y-3 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "kk-auth",
            JSON.stringify({ role: "CUSTOMER", email: form.email, name: form.name })
          );
          toast.success("Account created");
          router.push("/account");
        }}
      >
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Button type="submit" className="w-full" size="lg">Register</Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-wine font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
