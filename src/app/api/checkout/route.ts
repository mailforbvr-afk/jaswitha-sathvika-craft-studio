import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, getCheckoutSupabase, razorpayConfig } from "@/lib/commerce-server";

export const runtime = "edge";
type CheckoutBody = { customer?: Record<string, unknown>; items?: Array<{ productId?: unknown; quantity?: unknown }>; paymentMethod?: unknown; upiReference?: unknown };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CheckoutBody;
    if (!body || !Array.isArray(body.items) || !body.customer || typeof body.customer !== "object") return NextResponse.json({ error: "Please enter complete checkout details." }, { status: 400 });
    const paymentMethod = body.paymentMethod === "RAZORPAY" || body.paymentMethod === "UPI" ? body.paymentMethod : null;
    if (!paymentMethod) return NextResponse.json({ error: "Choose an available payment method." }, { status: 400 });
    const supabase = getCheckoutSupabase();
    const { data, error } = await (supabase.rpc as unknown as (name: string, params: Record<string, unknown>) => Promise<{ data: Array<{ order_id: string; order_number: string; total: number; payment_method: string }> | null; error: { message: string } | null }>)("create_commerce_order", { p_customer: body.customer, p_items: body.items, p_payment_method: paymentMethod, p_upi_reference: typeof body.upiReference === "string" ? body.upiReference.trim() || null : null });
    if (error || !data?.[0]) return NextResponse.json({ error: error?.message ?? "Unable to create the order." }, { status: 400 });
    const order = data[0];
    if (paymentMethod !== "RAZORPAY") return NextResponse.json({ order, paymentStatus: "PENDING" });
    const razorpay = razorpayConfig();
    if (!razorpay.configured) return NextResponse.json({ error: "Online payment is not configured. Please choose UPI." }, { status: 503 });
    const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${btoa(`${razorpay.keyId}:${razorpay.keySecret}`)}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.round(Number(order.total) * 100), currency: "INR", receipt: order.order_number, notes: { little_arts_order_id: order.order_id } }) });
    const razorpayOrder = await response.json() as { id?: string; error?: { description?: string } };
    if (!response.ok || !razorpayOrder.id) return NextResponse.json({ error: razorpayOrder.error?.description ?? "Unable to start Razorpay payment. Please try again." }, { status: 502 });
    const admin = getAdminSupabase();
    const { error: updateError } = await admin!.from("commerce_orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.order_id);
    if (updateError) return NextResponse.json({ error: "Unable to secure the payment order." }, { status: 500 });
    return NextResponse.json({ order, paymentStatus: "PENDING", razorpayOrder: { id: razorpayOrder.id, amount: Math.round(Number(order.total) * 100), currency: "INR", keyId: razorpay.keyId } });
  } catch { return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 500 }); }
}
