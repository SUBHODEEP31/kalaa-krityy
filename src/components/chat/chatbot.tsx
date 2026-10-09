"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/data/catalog";

type QA = { q: string; a: string; keys: string[] };

const FAQS: QA[] = [
  {
    q: "What do you sell?",
    a: "We sell sarees, dress materials, readymade suits, blouses and handicrafts. We also offer custom stitching and training courses.",
    keys: ["sell", "product", "collection", "shop", "saree", "suit", "blouse"],
  },
  {
    q: "Where is your store?",
    a: `Our boutique is at ${SITE.address}. You can also shop online and order on WhatsApp ${SITE.phone}.`,
    keys: ["where", "address", "location", "store", "patna"],
  },
  {
    q: "How can I order on WhatsApp?",
    a: `Tap Order on WhatsApp anywhere on the site, or message ${SITE.phone}. Share the product name, size and city for faster help.`,
    keys: ["whatsapp", "order", "message", "chat"],
  },
  {
    q: "Do you do custom stitching?",
    a: "Yes. We offer custom stitching, dress designing, alteration and fitting, and boutique consultation. Visit Services to send an enquiry.",
    keys: ["stitch", "tailor", "custom", "alter", "fitting"],
  },
  {
    q: "What training courses are available?",
    a: "We run Stitching, Dress Designing and Handicraft courses. Open the Training page to see duration, fees and enrol.",
    keys: ["course", "training", "class", "learn", "academy", "enroll"],
  },
  {
    q: "How do coupons work?",
    a: "Open the Sale page to copy active codes like KALAA10. Apply the code at checkout. Minimum order value may apply.",
    keys: ["coupon", "discount", "offer", "code", "promo", "sale"],
  },
  {
    q: "What is delivery time?",
    a: "Ready-to-wear usually ships in 2-5 working days across India. Custom stitching timelines are shared after measurements.",
    keys: ["delivery", "shipping", "how long", "dispatch", "courier"],
  },
  {
    q: "What payment methods do you accept?",
a: "Checkout supports UPI, cards and netbanking via Razorpay. You can also confirm payment on WhatsApp with the boutique.",
    keys: ["payment", "pay", "upi", "razorpay", "card"],
  },
  {
    q: "How do I track my order?",
    a: "After payment, your order ID is shown on the success screen. The owner updates status in Admin, Orders. WhatsApp us with your order ID for help.",
    keys: ["track", "order status", "where is my order", "order id"],
  },
  {
    q: "What are your contact details?",
    a: `Phone/WhatsApp: ${SITE.phone}. Email: ${SITE.email}. Store: ${SITE.address}. Reg. No. ${SITE.registration}.`,
    keys: ["contact", "phone", "email", "call", "support"],
  },
  {
    q: "Can I return or exchange?",
    a: "Ready-to-wear exchanges are possible for unused items with tags. Custom-stitched pieces are generally non-returnable. Contact us within 48 hours of delivery.",
    keys: ["return", "exchange", "refund", "replace"],
  },
  {
    q: "Hello",
    a: `Namaste! Welcome to ${SITE.name}. Ask about products, stitching, courses, delivery, coupons or orders.`,
    keys: ["hi", "hello", "hey", "namaste", "good morning", "good evening"],
  },
];

function answerFor(text: string) {
  const q = text.toLowerCase().trim();
  if (!q) return "Please type a question about our boutique.";
  let best: QA | null = null;
  let score = 0;
  for (const item of FAQS) {
    let s = 0;
    for (const k of item.keys) if (q.includes(k)) s += k.length;
    if (
      item.q
        .toLowerCase()
        .split(" ")
        .some((w) => w.length > 3 && q.includes(w))
    ) {
      s += 2;
    }
    if (s > score) {
      score = s;
      best = item;
    }
  }
  if (best && score > 0) return best.a;
  return `I am not fully sure. WhatsApp us at ${SITE.phone}, or ask about products, stitching, courses, delivery, coupons, payments or order tracking.`;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi! I am Kalaa Assistant. Ask me about shopping, stitching, training, delivery or orders.",
    },
  ]);

  const suggestions = useMemo(
    () => [
      "Where is store?",
      "Custom stitching?",
      "Coupons",
      "Track order",
      "Courses",
    ],
    []
  );

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const reply = answerFor(value);
    setMessages((m) => [
      ...m,
      { role: "user", text: value },
      { role: "bot", text: reply },
    ]);
    setInput("");
  }

  return (
<div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-[90] sm:bottom-6 sm:left-6">
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-ivory shadow-lift">
          <div className="royal-gradient px-4 py-3 text-cream flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Kalaa Assistant</p>
              <p className="text-[11px] text-cream/70">Usually replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-72 space-y-2 overflow-y-auto p-3 bg-cream/30">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "bot"
                    ? "bg-white border border-line text-ink"
                    : "ml-auto bg-wine text-cream"
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] text-wine hover:bg-cream"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-line p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, orders..."
              className="h-10 flex-1 rounded-full border border-line bg-white px-3 text-sm outline-none focus:border-wine/40"
            />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-full bg-wine text-cream"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex h-14 items-center gap-2 rounded-full royal-gradient px-5 text-sm font-medium text-cream shadow-lift"
      >
        <MessageCircle size={18} />
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}
