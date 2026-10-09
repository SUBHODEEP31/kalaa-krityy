from pathlib import Path

# layout chatbot
layout = Path("src/app/layout.tsx")
lt = layout.read_text(encoding="utf-8")
if "Chatbot" not in lt:
    lt = lt.replace(
        'import { Providers } from "@/components/providers";',
        'import { Providers } from "@/components/providers";\nimport { Chatbot } from "@/components/chat/chatbot";',
    )
    lt = lt.replace(
        "<Footer />",
        "<Footer />\n          <Chatbot />",
    )
    layout.write_text(lt, encoding="utf-8")
print("layout_ok")

# checkout create order
co = Path("src/app/checkout/page.tsx")
t = co.read_text(encoding="utf-8")
old = '''    setPaying(true);
    // Simulated Razorpay success — wire real keys later via env
    await new Promise((r) => setTimeout(r, 1200));
    const orderId = `KK${Date.now().toString().slice(-8)}`;
    clear();
    toast.success("Payment successful");
    router.push(`/account?order=${orderId}`);
    setPaying(false);'''
new = '''    setPaying(true);
    try {
      // Simulated Razorpay success — order is stored for owner tracking
      await new Promise((r) => setTimeout(r, 800));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          subtotal: base,
          discount,
          shipping,
          total,
          couponCode,
          paymentMethod: "DEMO_RAZORPAY",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not place order");
        return;
      }
      const orderId = data.order?.id || `KK${Date.now().toString().slice(-8)}`;
      clear();
      toast.success("Payment successful — order saved for boutique");
      router.push(`/account?order=${orderId}`);
    } catch {
      toast.error("Network error while placing order");
    } finally {
      setPaying(false);
    }'''
if old in t:
    t = t.replace(old, new)
    co.write_text(t, encoding="utf-8")
    print("checkout_ok")
else:
    print("checkout_pattern_missing")
    # try alternate dash character
    if "setPaying(true)" in t and "/api/orders" not in t:
        print("needs_manual")

# sections imports check
sec = Path("src/components/home/sections.tsx").read_text(encoding="utf-8")
print("useCatalog" in sec, "useMemo" in sec[:500], "getNewArrivals" in sec)
