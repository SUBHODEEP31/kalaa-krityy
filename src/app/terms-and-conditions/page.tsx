import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kalaa Krityy",
  description:
    "Website terms of use, purchases and services for Kalaa Krityy Boutique & Training Center.",
};

export default function TermsAndConditionsPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Terms & Conditions"
      intro="By browsing or purchasing from kalaakrityy (this website) or our Patna boutique, you agree to the following terms. Please read them carefully."
      sections={[
        {
          heading: "1. About us",
          body: [
            "Kalaa Krityy is a boutique and training center registered in Bihar (Registration No. BR-26-0018641), operating from Vinay Tower, Patna.",
            "We sell ethnic wear, dress materials, blouses, handicrafts and offer custom stitching and skill-training courses.",
          ],
        },
        {
          heading: "2. Products & pricing",
          body: [
            "Product images are for representation; slight colour variation may occur due to lighting and screen settings. Fabric hand-feel is best judged in-store when possible.",
            "Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We may update prices without prior notice; the price at checkout is final.",
            "MRP and offer prices shown on the site apply only while stock lasts.",
          ],
        },
        {
          heading: "3. Orders & payment",
          body: [
            "Placing an order constitutes an offer to buy. We reserve the right to refuse or cancel orders in case of pricing errors, stock issues or suspected fraud.",
            "Online payments are processed securely via Razorpay (UPI, cards, netbanking). We do not store full card details on our servers.",
            "An order is confirmed only after successful payment verification. You will receive an order number (KK…) for tracking.",
          ],
        },
        {
          heading: "4. Custom work & training",
          body: [
            "Custom stitching requires accurate measurements provided by you. Fit issues arising from incorrect measurements are not our liability.",
            "Training course fees, schedules and seat availability are confirmed separately at enrolment and may have distinct refund rules shared at admission.",
          ],
        },
        {
          heading: "5. Intellectual property",
          body: [
            "All website content, logos, photography and product descriptions belong to Kalaa Krityy or its licensors. You may not copy or reuse them commercially without written permission.",
          ],
        },
        {
          heading: "6. Limitation of liability",
          body: [
            "To the fullest extent permitted by law, Kalaa Krityy is not liable for indirect or consequential losses arising from use of the website or delays beyond our reasonable control.",
            "Our maximum liability for any order is limited to the amount paid for that order.",
          ],
        },
        {
          heading: "7. Governing law",
          body: [
            "These terms are governed by the laws of India. Exclusive jurisdiction lies with the competent courts at Patna, Bihar.",
            "For questions: kalaakrityy@gmail.com · 79798 20645.",
          ],
        },
      ]}
    />
  );
}
