from pathlib import Path
p = Path("src/lib/db.ts")
t = p.read_text(encoding="utf-8")
t = t.replace('.select("*, OrderItem(*)")', '.select("*")')
# createOrder return patch
old = """  if (fetchErr) throw new Error(`createOrder fetch: ${fetchErr.message}`);
  return mapOrder(full as DbOrderRow);
}"""
new = """  if (fetchErr) throw new Error(`createOrder fetch: ${fetchErr.message}`);
  const { data: createdItems } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", orderId);
  return mapOrder({
    ...(full as DbOrderRow),
    OrderItem: (createdItems || []) as DbOrderItemRow[],
  });
}"""
if old in t:
    t = t.replace(old, new)
    print("patched createOrder")
else:
    print("createOrder block not exact match")
# updateOrderStatus after maybeSingle should reload items
# After mapOrder(data) in updateOrderStatus, enhance:
old2 = """  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  if (!data) return null;
  return mapOrder(data as DbOrderRow);
}"""
new2 = """  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  if (!data) return null;
  const row = data as DbOrderRow;
  const { data: items } = await sb()
    .from("OrderItem")
    .select("*")
    .eq("orderId", row.id);
  return mapOrder({ ...row, OrderItem: (items || []) as DbOrderItemRow[] });
}"""
if old2 in t:
    t = t.replace(old2, new2)
    print("patched updateOrderStatus")
else:
    print("updateOrderStatus block not exact")
p.write_text(t, encoding="utf-8")
print("embeds left", t.count("OrderItem(*)"))
