export const BRAND = {
  names: "Jaswitha & Sathvika",
  studio: "Little Arts",
  studioName: "Little Arts",
  title: "Welcome to Our\nCreative World 💗",
  tagline: "Little hands • Big imagination • Handmade with love ❤️",
  supportingText:
    "Handmade creations made with lots of imagination, creativity and love.",
  contactHeading: "Interested in any of our creations?",
  contactMessage: "Send us a WhatsApp message!",
  aboutText:
    "Welcome to Little Arts, a little space filled with handmade creations, imagination and love by Jaswitha & Sathvika. Every creation is made with care and lots of creativity.",
  heroBadge: "❤️ Handmade with little hands",
  heroPrimaryButton: "✨ Explore Our Crafts",
  heroSecondaryButton: "💬 Chat on WhatsApp",
  heroVisualTitle: "Made by Little Hands",
  heroVisualCaption: "Made by Little Hands ♡",
  heroHighlights: [
    { icon: "♡", title: "Handmade", text: "with Love" },
    { icon: "🌿", title: "Unique", text: "Creations" },
    { icon: "⭐", title: "Made by", text: "Little Hands" },
  ],
  collectionsEyebrow: "🌸 Our Collections",
  collectionsTitle: "Little categories, lots of colour",
  collectionsDescription: "Tap a category to see handmade pieces made with little hands.",
  featuredEyebrow: "Favorites",
  featuredTitle: "✨ Little Favorites",
  featuredDescription: "A few handmade pieces we are especially happy to share.",
  galleryEyebrow: "Gallery",
  galleryTitle: "All our crafts",
  galleryDescription:
    "Every piece is handmade, one of a kind, and shared here so you can enjoy looking — and message us if something makes you smile.",
  aboutEyebrow: "Our Story",
  aboutTitle: "💕 Our Little Story",
  aboutHighlight: "Two sisters, one little studio.",
  storySectionTitle: "Every creation has a story ✨",
  storySectionText:
    "This website is about creativity, learning and enjoying the process of making things. Some days it is a bracelet. Some days it is a tiny flower. The joy is in trying, practising and making something with their own hands.",
  storyCard1Title: "Made with Love ❤️",
  storyCard1Text: "Every little creation is made with care, patience and lots of love.",
  storyCard2Title: "Little Hands, Big Ideas ✨",
  storyCard2Text: "From tiny flowers to colourful bracelets, every creation starts with imagination.",
  storyCard3Title: "Learning Through Creativity 🌸",
  storyCard3Text: "Making things helps us learn, experiment, practice and enjoy the joy of creating.",
  contactEyebrow: "GET IN TOUCH",
  contactButtonText: "Chat on WhatsApp",
  footerCopyright: "Handmade with love by Jaswitha & Sathvika.",
  heroImageAlt: "Jaswitha and Sathvika",
  logoAlt: "Little Arts logo",
};

const LEGACY_PUBLIC_COPY = new Set([
  "jaswitha & sathvika little craft studio",
  "little craft studio",
  "little creations, made with love",
  "handmade with little hands",
  "collections",
  "little crafts, made with care",
]);

export function designedPublicText(
  saved: string | null | undefined,
  designed: string,
): string {
  const value = saved?.trim() ?? "";
  if (!value) return designed;
  if (LEGACY_PUBLIC_COPY.has(value.toLowerCase())) return designed;
  if (/little creations/i.test(value)) return designed;
  return value;
}

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
export const SITE_IMAGE_BUCKET = "site-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const SITE_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
