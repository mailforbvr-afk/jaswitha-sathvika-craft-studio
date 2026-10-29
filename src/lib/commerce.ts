import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CommerceOrder, CommerceSettings, CommerceSettingsInput } from "@/lib/supabase/types";

export const COMMERCE_SETTINGS_ID = "00000000-0000-0000-0000-000000000002";

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettingsInput = {
  razorpay_enabled: true,
  manual_upi_enabled: true,
  upi_id: null,
  upi_qr_url: null,
  manual_shipping_enabled: true,
  shiprocket_enabled: false,
  shipping_charge: 0,
  free_shipping_threshold: null,
  serviceable_pincodes: [],
};

function asNumber(value: number | string | null | undefined, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeCommerceSettings(value: Partial<CommerceSettings> | null): CommerceSettings {
  return {
    id: value?.id ?? COMMERCE_SETTINGS_ID,
    ...DEFAULT_COMMERCE_SETTINGS,
    ...value,
    upi_id: value?.upi_id?.trim() || null,
    upi_qr_url: value?.upi_qr_url?.trim() || null,
    shipping_charge: asNumber(value?.shipping_charge),
    free_shipping_threshold:
      value?.free_shipping_threshold === null || value?.free_shipping_threshold === undefined
        ? null
        : asNumber(value.free_shipping_threshold),
    serviceable_pincodes: (value?.serviceable_pincodes ?? []).filter((pincode) => /^[1-9][0-9]{5}$/.test(pincode)),
    created_at: value?.created_at ?? "",
    updated_at: value?.updated_at ?? "",
  };
}

export function validateCommerceSettings(input: CommerceSettingsInput): string | null {
  if (!Number.isFinite(input.shipping_charge) || input.shipping_charge < 0) return "Shipping charge must be zero or more.";
  if (input.free_shipping_threshold !== null && (!Number.isFinite(input.free_shipping_threshold) || input.free_shipping_threshold < 0)) {
    return "Free-shipping threshold must be zero or more.";
  }
  if (input.manual_upi_enabled && !input.upi_id?.trim()) return "Enter a UPI ID before enabling manual UPI.";
  if (input.serviceable_pincodes.some((pincode) => !/^[1-9][0-9]{5}$/.test(pincode))) return "Each serviceable pincode must be six digits.";
  return null;
}

export async function fetchCommerceSettings(): Promise<CommerceSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data, error } = await supabase.from("commerce_settings").select("*").eq("id", COMMERCE_SETTINGS_ID).maybeSingle();
  if (error) throw new Error("Unable to load payment and shipping settings.");
  return normalizeCommerceSettings(data);
}

export async function saveCommerceSettings(input: CommerceSettingsInput): Promise<CommerceSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data, error } = await supabase
    .from("commerce_settings")
    .upsert({ id: COMMERCE_SETTINGS_ID, ...input, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("*")
    .single();
  if (error || !data) throw new Error("Unable to save payment and shipping settings. Make sure the commerce SQL migration and admin access setup are complete.");
  return normalizeCommerceSettings(data);
}

export async function fetchCommerceOrders(): Promise<CommerceOrder[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data, error } = await supabase
    .from("commerce_orders")
    .select("*, items:commerce_order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load orders.");
  return (data ?? []) as CommerceOrder[];
}

export type CommerceOrderUpdate = Partial<Pick<CommerceOrder, "payment_status" | "fulfilment_status" | "courier_name" | "postage_amount" | "tracking_number" | "shipped_at">>;

export async function updateCommerceOrder(id: string, patch: CommerceOrderUpdate): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { error } = await supabase.from("commerce_orders").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("Unable to update order.");
}
