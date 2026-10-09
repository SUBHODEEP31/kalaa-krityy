"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fffdf9",
            border: "1px solid #e8dfd4",
            color: "#2a211f",
          },
        }}
      />
    </>
  );
}
