import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function requiredPublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("Checkout is not configured yet.");
  return value;
}

export function getCheckoutSupabase() {
  return createClient<Database>(
    requiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function getAdminSupabase() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) return null;
  return createClient<Database>(requiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"), secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? "";
  const testMode = process.env.RAZORPAY_TEST_MODE !== "false";
  return { keyId, keySecret, webhookSecret, testMode, configured: Boolean(keyId && keySecret && getAdminSupabase()) };
}

export async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const result = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}
