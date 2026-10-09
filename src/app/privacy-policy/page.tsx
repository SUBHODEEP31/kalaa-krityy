import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Kalaa Krityy",
  description:
    "How Kalaa Krityy collects, uses and protects customer information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Privacy Policy"
      intro="Your trust matters. This policy describes what personal information we collect when you shop or contact Kalaa Krityy, and how we use it."
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "Account and checkout details: name, phone, email, shipping address and pincode.",
            "Order data: items purchased, amounts, coupons, payment status and Razorpay payment / order references (not full card numbers).",
            "Communications: WhatsApp or email messages you send us, and optional contact-form content.",
            "Technical data: basic browser/device information and cookies needed for cart, wishlist and session security.",
          ],
        },
        {
          heading: "2. How we use information",
          body: [
            "To fulfil orders, arrange shipping, process refunds and provide order tracking.",
            "To respond to enquiries, custom-stitching requests and training admissions.",
            "To improve our catalogue, prevent fraud and comply with legal obligations.",
            "We do not sell your personal data to third parties.",
          ],
        },
        {
          heading: "3. Payment processors",
          body: [
            "Payments are handled by Razorpay. Their privacy practices apply to card/UPI data processed on their secure checkout.",
            "We receive confirmation identifiers (order id, payment id, signature) to mark your order paid.",
          ],
        },
        {
          heading: "4. Storage & security",
          body: [
            "Order and catalogue data are stored on secured cloud infrastructure (including Supabase). Access to owner tools is protected by authenticated sessions.",
            "No method of transmission over the internet is 100% secure; we use industry-standard safeguards appropriate for a boutique e-commerce site.",
          ],
        },
        {
          heading: "5. Sharing",
          body: [
            "We share only what is necessary with courier partners (name, phone, address) to deliver parcels.",
            "We may disclose information if required by law or to protect our rights, customers or boutique premises.",
          ],
        },
        {
          heading: "6. Your choices",
          body: [
            "You may request access or correction of your order contact details by emailing kalaakrityy@gmail.com or WhatsApp 79798 20645 with proof of identity.",
            "You can clear browser cart/wishlist data anytime from your device. Marketing messages (if any) can be opted out by replying STOP on WhatsApp.",
          ],
        },
        {
          heading: "7. Contact & jurisdiction",
          body: [
            "Data queries: kalaakrityy@gmail.com · Vinay Tower, Patna, Bihar · Reg. BR-26-0018641.",
            "This policy is governed by Indian law; disputes are subject to Patna courts.",
          ],
        },
      ]}
    />
  );
}
