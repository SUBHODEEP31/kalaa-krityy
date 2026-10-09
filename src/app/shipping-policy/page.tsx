import type { Metadata } from "next";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Shipping Policy | Kalaa Krityy",
  description:
    "Dispatch timelines, shipping charges and delivery coverage for Kalaa Krityy Boutique, Patna.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Shipping Policy"
      intro="Kalaa Krityy ships carefully packed ethnic wear and handicrafts from our boutique in Patna across India. Below is how dispatch, charges and delivery work."
      sections={[
        {
          heading: "1. Processing time",
          body: [
            "Ready stock pieces are usually packed and handed to courier within 2–4 business days after payment confirmation.",
            "Custom stitching / blouse / alteration orders follow the timeline shared at booking (often 7–14 business days depending on embroidery).",
            "Orders placed on Sundays or public holidays begin processing the next working day.",
          ],
        },
        {
          heading: "2. Shipping charges",
          body: [
            "Standard shipping is ₹99 for orders below ₹2,999. Orders ₹2,999 and above enjoy free standard shipping within India (unless otherwise stated on a product).",
            "Remote pin codes may require additional courier charges; we will confirm on WhatsApp before dispatch if applicable.",
            "Express shipping can be arranged on request at actual courier cost.",
          ],
        },
        {
          heading: "3. Delivery partners & tracking",
          body: [
            "We ship via trusted pan-India partners. Once dispatched, the order status moves to SHIPPED and you can track progress on Track Order.",
            "Typical transit time is 3–7 business days after dispatch, depending on destination. Delays due to weather, strikes or courier backlog are beyond our control; we will keep you informed.",
            "Please ensure someone is available to receive the parcel. Failed delivery attempts may incur reattempt charges.",
          ],
        },
        {
          heading: "4. Local Patna pickup",
          body: [
            "Customers in Patna may choose store pickup at Vinay Tower after we confirm the order is ready. No shipping fee applies for verified pickup orders.",
            "Bring a valid ID and the order number when collecting.",
          ],
        },
        {
          heading: "5. Damaged in transit",
          body: [
            "If a package arrives damaged, refuse delivery when possible and contact us immediately with photos of the outer packaging and product.",
            "We will arrange a replacement or full refund once the courier claim is verified.",
          ],
        },
      ]}
    />
  );
}
