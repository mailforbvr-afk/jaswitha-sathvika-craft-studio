import { NextResponse } from "next/server";
import { getCheckoutSupabase, razorpayConfig } from "@/lib/commerce-server";

export const runtime = "edge";

export async function GET() {
  try {
    const supabase = getCheckoutSupabase();
    const { data, error } = await (supabase.rpc as unknown as (name: string) => Promise<{ data: unknown; error: { message: string } | null }>)("checkout_options");
    if (error || !data) return NextResponse.json({ error: "Checkout is not available." }, { status: 503 });
    const razorpay = razorpayConfig();
    const options = data as Record<string, unknown>;
    return NextResponse.json({ ...options, razorpayEnabled: Boolean(options.razorpayEnabled) && razorpay.configured, razorpayConfigured: razorpay.configured, razorpayTestMode: razorpay.testMode, razorpayKeyId: razorpay.configured ? razorpay.keyId : null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 }); }
}
