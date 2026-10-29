import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, hmacSha256Hex, razorpayConfig, safeEqual } from "@/lib/commerce-server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const rawBody = await request.text(); const signature = request.headers.get("x-razorpay-signature") ?? ""; const config = razorpayConfig(); const admin = getAdminSupabase();
  if (!config.webhookSecret || !admin) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const expected = await hmacSha256Hex(config.webhookSecret, rawBody);
  if (!safeEqual(expected, signature)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  try {
    const event = JSON.parse(rawBody) as { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
    const payment = event.payload?.payment?.entity;
    if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id && payment.id) {
      const { error } = await admin.from("commerce_orders").update({ payment_status: "PAID", razorpay_payment_id: payment.id }).eq("razorpay_order_id", payment.order_id).neq("payment_status", "PAID");
      if (error) return NextResponse.json({ error: "Unable to record payment." }, { status: 500 });
    }
    if (event.event === "payment.failed" && payment?.order_id) await admin.from("commerce_orders").update({ payment_status: "FAILED" }).eq("razorpay_order_id", payment.order_id).eq("payment_status", "PENDING");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }); }
}
