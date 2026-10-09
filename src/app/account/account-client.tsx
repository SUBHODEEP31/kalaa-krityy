"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/badge";

export default function AccountClient() {
  const params = useSearchParams();
  const order = params.get("order");
  const [user, setUser] = useState<{ email?: string; name?: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kk-auth");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="container-pro py-10 md:py-16 max-w-2xl">
      <SectionHeading
        title={user ? `Hello${user.name ? `, ${user.name}` : ""}` : "Your Account"}
        subtitle={user?.email || "Sign in to manage orders and profile."}
      />
      {order && (
        <div className="mb-6 rounded-3xl border border-success/30 bg-success/5 p-5">
          <p className="font-medium text-success">Order placed successfully</p>
          <p className="text-sm text-muted mt-1">Order ID: {order}</p>
        </div>
      )}
      {!user ? (
        <Link href="/login"><Button>Sign in</Button></Link>
      ) : (
        <div className="rounded-3xl border border-line bg-white p-6 space-y-4">
          <p className="text-sm text-muted">Role: {user.role}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop"><Button variant="outline">Continue shopping</Button></Link>
            {user.role === "ADMIN" && <Link href="/admin"><Button>Admin dashboard</Button></Link>}
            <Button variant="ghost" onClick={() => { localStorage.removeItem("kk-auth"); setUser(null); }}>Sign out</Button>
          </div>
        </div>
      )}
    </div>
  );
}
