import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, hmacSha256Hex, razorpayConfig, safeEqual } from "@/lib/commerce-server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
    const config = razorpayConfig(); const admin = getAdminSupabase();
    if (!config.configured || !admin || !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) return NextResponse.json({ error: "Invalid payment verification request." }, { status: 400 });
    const expected = await hmacSha256Hex(config.keySecret, `${body.razorpay_order_id}|${body.razorpay_payment_id}`);
    if (!safeEqual(expected, body.razorpay_signature)) return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(body.razorpay_payment_id)}`, {
      headers: { Authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}` },
    });
    const providerPayment = await paymentResponse.json() as { status?: string; order_id?: string };
    if (!paymentResponse.ok || providerPayment.status !== "captured" || providerPayment.order_id !== body.razorpay_order_id) {
      return NextResponse.json({ error: "Payment is not captured yet. The order remains pending until Razorpay confirms it." }, { status: 409 });
    }
    const { data: payment, error: paymentError } = await admin.from("commerce_orders").select("id, payment_status").eq("razorpay_order_id", body.razorpay_order_id).maybeSingle();
    if (paymentError || !payment) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const { error } = await admin.from("commerce_orders").update({ payment_status: "PAID", razorpay_payment_id: body.razorpay_payment_id }).eq("id", payment.id).neq("payment_status", "PAID");
    if (error) return NextResponse.json({ error: "Unable to record verified payment." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 }); }
}
