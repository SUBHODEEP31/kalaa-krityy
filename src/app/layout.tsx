import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { Chatbot } from "@/components/chat/chatbot";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Kalaa Krityy | A Unit of Krity Creations",
    template: "%s | Kalaa Krityy",
  },
  description:
    "Kalaa Krityy — A Unit of Krity Creations. Premium boutique fashion, custom stitching and handicraft training in Patna. Shop sarees, suits, blouses and more.",
  keywords: [
    "Kalaa Krityy",
    "Krity Creations",
    "boutique Patna",
    "sarees",
    "custom stitching",
    "training center",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
        style={{
          fontFamily: "var(--font-dm-sans), var(--font-sans), system-ui",
        }}
      >
<Providers>
          <Header />
          <main className="flex-1 pb-20 sm:pb-8">{children}</main>
          <Footer />
          <Chatbot />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
