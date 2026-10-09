import { Suspense } from "react";
import AccountClient from "./account-client";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="container-pro py-20 text-center text-muted">Loading…</div>}>
      <AccountClient />
    </Suspense>
  );
}
