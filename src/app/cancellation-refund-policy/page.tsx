import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Kalaa Krityy",
  description:
    "Cancellation window, refund timelines and return guidelines for Kalaa Krityy Boutique, Patna.",
};

export default function CancellationRefundPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Cancellation & Refund Policy"
      intro="We want every Kalaa Krityy piece to feel right. This policy explains how cancellations, refunds and exchanges work for ready-to-wear and custom boutique orders."
      sections={[
        {
          heading: "1. Order cancellation",
          body: [
            "You may request cancellation within 24 hours of placing a paid order, or any time before the order is marked SHIPPED / dispatched from our Patna boutique.",
            "Once an order is packed and handed to the courier, cancellation is no longer available. Please use Track Order or WhatsApp support with your order number.",
            "Custom / made-to-measure stitching orders cannot be cancelled after fabric cutting or embroidery work has started. A partial studio fee may apply if work has already begun.",
          ],
        },
        {
          heading: "2. How to cancel",
          body: [
            "Preferred: open Track Order on our website, look up your order with phone number, and use Request cancellation — WhatsApp or in-app note both reach boutique staff.",
            "You may also WhatsApp 79798 20645 with order ID, phone used at checkout, and reason. Staff will confirm acceptance in writing.",
            "In-app requests add a [CANCEL_REQUESTED] note for the owner dashboard; final approval is done by boutique staff after checking packing status.",
          ],
        },
        {
          heading: "3. Refunds",
          body: [
            "Approved cancellations of prepaid orders are refunded to the original Razorpay payment method (UPI / card / netbanking).",
            "Refund processing typically completes within 5–7 business days after approval. Bank timelines may add 2–3 working days.",
            "Shipping charges (if paid and courier has already been booked) are non-refundable unless the cancellation is due to our error (wrong item, quality issue before dispatch).",
          ],
        },
        {
          heading: "4. Returns & exchanges",
          body: [
            "Ready-to-wear items may be considered for exchange within 3 days of delivery if unused, unwashed, with original tags and packaging intact.",
            "Sale / clearance items, lingerie, and custom-fitted garments are not eligible for return unless there is a manufacturing defect.",
            "Please share unboxing photos within 24 hours of delivery if you notice damage or a wrong item — we will arrange a free replacement or refund.",
          ],
        },
        {
          heading: "5. Contact",
          body: [
            "Email: kalaakrityy@gmail.com · Phone / WhatsApp: 79798 20645 · Store: Vinay Tower, Patna, Bihar.",
            "Disputes are subject to the jurisdiction of courts in Patna, Bihar.",
          ],
        },
      ]}
    />
  );
}
