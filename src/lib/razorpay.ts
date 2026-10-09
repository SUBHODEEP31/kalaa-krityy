import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function getRazorpay() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured in environment");
  }
  if (!client) {
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}
