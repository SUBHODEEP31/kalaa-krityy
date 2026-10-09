import { Suspense } from "react";
import ShopClient from "./shop-client";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-pro py-20 text-center text-muted">Loading boutique…</div>}>
      <ShopClient />
    </Suspense>
  );
}
