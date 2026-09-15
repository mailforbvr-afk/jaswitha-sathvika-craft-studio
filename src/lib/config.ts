export const BRAND = {
  names: "Jaswitha & Sathvika",
  studio: "Little Craft Studio",
  tagline: "Little hands • Big imagination • Handmade with love ❤️",
  supportingText:
    "Handmade creations made with lots of imagination, creativity and love.",
};

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabasePublishableKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}

export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  return (
    url.startsWith("https://") &&
    !url.includes("your-project-id") &&
    key.length > 20 &&
    !key.includes("your-publishable-key")
  );
}

export function shouldUseDemoData(): boolean {
  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") return true;
  return !isSupabaseConfigured();
}

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
