import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapWooStatus } from "@/lib/order-status";

export async function POST(request: Request) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { id?: number; number?: string; status?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // WooCommerce sends a non-JSON "ping" when a webhook is first saved.
    return NextResponse.json({ ok: true });
  }

  if (!payload.id || !payload.status) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const status = mapWooStatus(payload.status);

  const { data: updated } = await admin
    .from("orders")
    .update({ status })
    .eq("woo_order_id", payload.id)
    .select("id");

  // Orders placed before this feature have no woo_order_id yet, so match them by reference.
  if (!updated || updated.length === 0) {
    await admin
      .from("orders")
      .update({ status, woo_order_id: payload.id })
      .eq("reference", `WOO-${payload.number ?? payload.id}`);
  }

  return NextResponse.json({ ok: true });
}