import { BRAND } from "@/lib/config";
import type { SiteImageUrlField } from "@/lib/site-images";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SiteSettings, SiteSettingsInput } from "@/lib/supabase/types";
import { DEFAULT_THEME_ID, isThemeId, resolveThemeId } from "@/lib/themes";

export const SITE_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export type PublicSiteSettings = SiteSettingsInput;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function filled(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : fallback;
}

export function fallbackSiteSettings(): PublicSiteSettings {
  return {
    studio_name: BRAND.studioName,
    main_title: BRAND.title,
    tagline: BRAND.tagline,
    contact_heading: BRAND.contactHeading,
    contact_message: BRAND.contactMessage,
    about_text: BRAND.aboutText,
    instagram_url: null,
    email: null,
    theme: DEFAULT_THEME_ID,
    header_studio_name: BRAND.studioName,
    header_tagline: BRAND.studio,
    hero_badge: BRAND.heroBadge,
    hero_description: BRAND.supportingText,
    hero_primary_button: BRAND.heroPrimaryButton,
    hero_secondary_button: BRAND.heroSecondaryButton,
    hero_visual_title: BRAND.heroVisualTitle,
    hero_visual_caption: BRAND.heroVisualCaption,
    collections_eyebrow: BRAND.collectionsEyebrow,
    collections_title: BRAND.collectionsTitle,
    collections_description: BRAND.collectionsDescription,
    featured_eyebrow: BRAND.featuredEyebrow,
    featured_title: BRAND.featuredTitle,
    featured_description: BRAND.featuredDescription,
    gallery_eyebrow: BRAND.galleryEyebrow,
    gallery_title: BRAND.galleryTitle,
    gallery_description: BRAND.galleryDescription,
    about_eyebrow: BRAND.aboutEyebrow,
    about_title: BRAND.aboutTitle,
    about_highlight: BRAND.aboutHighlight,
    story_section_title: BRAND.storySectionTitle,
    story_section_text: BRAND.storySectionText,
    story_card_1_title: BRAND.storyCard1Title,
    story_card_1_text: BRAND.storyCard1Text,
    story_card_2_title: BRAND.storyCard2Title,
    story_card_2_text: BRAND.storyCard2Text,
    story_card_3_title: BRAND.storyCard3Title,
    story_card_3_text: BRAND.storyCard3Text,
    contact_eyebrow: BRAND.contactEyebrow,
    contact_button_text: BRAND.contactButtonText,
    footer_description: BRAND.tagline,
    footer_copyright: BRAND.footerCopyright,
    hero_image_url: null,
    story_card_1_image_url: null,
    story_card_2_image_url: null,
    story_card_3_image_url: null,
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateSiteSettingsInput(input: SiteSettingsInput): string | null {
  if (!input.studio_name.trim()) {
    return "Please enter a studio name.";
  }
  if (!input.main_title.trim()) {
    return "Please enter a main title.";
  }
  if (!input.tagline.trim()) {
    return "Please enter a tagline.";
  }

  const instagramUrl = input.instagram_url?.trim() ?? "";
  if (instagramUrl && !isValidInstagramUrl(instagramUrl)) {
    return "Please enter a full Instagram link, such as https://instagram.com/yourstudio.";
  }

  const email = input.email?.trim() ?? "";
  if (email && !EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address, or leave it blank.";
  }

  if ((input.theme ?? "").trim() && !isThemeId(input.theme.trim())) {
    return "Please choose a website theme.";
  }

  return null;
}

export function normalizeSiteSettingsInput(input: SiteSettingsInput): SiteSettingsInput {
  return {
    studio_name: input.studio_name.trim(),
    main_title: input.main_title.trim(),
    tagline: input.tagline.trim(),
    contact_heading: input.contact_heading.trim(),
    contact_message: input.contact_message.trim(),
    about_text: input.about_text.trim(),
    instagram_url: emptyToNull(input.instagram_url ?? ""),
    email: emptyToNull(input.email ?? ""),
    theme: resolveThemeId(input.theme),
    header_studio_name: input.header_studio_name.trim(),
    header_tagline: input.header_tagline.trim(),
    hero_badge: input.hero_badge.trim(),
    hero_description: input.hero_description.trim(),
    hero_primary_button: input.hero_primary_button.trim(),
    hero_secondary_button: input.hero_secondary_button.trim(),
    hero_visual_title: input.hero_visual_title.trim(),
    hero_visual_caption: input.hero_visual_caption.trim(),
    collections_eyebrow: input.collections_eyebrow.trim(),
    collections_title: input.collections_title.trim(),
    collections_description: input.collections_description.trim(),
    featured_eyebrow: input.featured_eyebrow.trim(),
    featured_title: input.featured_title.trim(),
    featured_description: input.featured_description.trim(),
    gallery_eyebrow: input.gallery_eyebrow.trim(),
    gallery_title: input.gallery_title.trim(),
    gallery_description: input.gallery_description.trim(),
    about_eyebrow: input.about_eyebrow.trim(),
    about_title: input.about_title.trim(),
    about_highlight: input.about_highlight.trim(),
    story_section_title: input.story_section_title.trim(),
    story_section_text: input.story_section_text.trim(),
    story_card_1_title: input.story_card_1_title.trim(),
    story_card_1_text: input.story_card_1_text.trim(),
    story_card_2_title: input.story_card_2_title.trim(),
    story_card_2_text: input.story_card_2_text.trim(),
    story_card_3_title: input.story_card_3_title.trim(),
    story_card_3_text: input.story_card_3_text.trim(),
    contact_eyebrow: input.contact_eyebrow.trim(),
    contact_button_text: input.contact_button_text.trim(),
    footer_description: input.footer_description.trim(),
    footer_copyright: input.footer_copyright.trim(),
    hero_image_url: emptyToNull(input.hero_image_url ?? ""),
    story_card_1_image_url: emptyToNull(input.story_card_1_image_url ?? ""),
    story_card_2_image_url: emptyToNull(input.story_card_2_image_url ?? ""),
    story_card_3_image_url: emptyToNull(input.story_card_3_image_url ?? ""),
  };
}

function isValidInstagramUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    return host === "instagram.com" || host.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

export function toPublicSettings(row: Partial<SiteSettings> | null | undefined): PublicSiteSettings {
  const defaults = fallbackSiteSettings();
  if (!row) return defaults;

  return {
    studio_name: filled(row.studio_name, defaults.studio_name),
    main_title: filled(row.main_title, defaults.main_title),
    tagline: filled(row.tagline, defaults.tagline),
    contact_heading: filled(row.contact_heading, defaults.contact_heading),
    contact_message: filled(row.contact_message, defaults.contact_message),
    about_text: filled(row.about_text, defaults.about_text),
    instagram_url: row.instagram_url?.trim() ? row.instagram_url.trim() : null,
    email: row.email?.trim() ? row.email.trim() : null,
    theme: resolveThemeId(row.theme),
    header_studio_name: filled(row.header_studio_name, filled(row.studio_name, defaults.header_studio_name)),
    header_tagline: filled(row.header_tagline, defaults.header_tagline),
    hero_badge: filled(row.hero_badge, defaults.hero_badge),
    hero_description: filled(row.hero_description, defaults.hero_description),
    hero_primary_button: filled(row.hero_primary_button, defaults.hero_primary_button),
    hero_secondary_button: filled(row.hero_secondary_button, defaults.hero_secondary_button),
    hero_visual_title: filled(row.hero_visual_title, defaults.hero_visual_title),
    hero_visual_caption: filled(row.hero_visual_caption, defaults.hero_visual_caption),
    collections_eyebrow: filled(row.collections_eyebrow, defaults.collections_eyebrow),
    collections_title: filled(row.collections_title, defaults.collections_title),
    collections_description: filled(row.collections_description, defaults.collections_description),
    featured_eyebrow: filled(row.featured_eyebrow, defaults.featured_eyebrow),
    featured_title: filled(row.featured_title, defaults.featured_title),
    featured_description: filled(row.featured_description, defaults.featured_description),
    gallery_eyebrow: filled(row.gallery_eyebrow, defaults.gallery_eyebrow),
    gallery_title: filled(row.gallery_title, defaults.gallery_title),
    gallery_description: filled(row.gallery_description, defaults.gallery_description),
    about_eyebrow: filled(row.about_eyebrow, defaults.about_eyebrow),
    about_title: filled(row.about_title, defaults.about_title),
    about_highlight: filled(row.about_highlight, defaults.about_highlight),
    story_section_title: filled(row.story_section_title, defaults.story_section_title),
    story_section_text: filled(row.story_section_text, defaults.story_section_text),
    story_card_1_title: filled(row.story_card_1_title, defaults.story_card_1_title),
    story_card_1_text: filled(row.story_card_1_text, defaults.story_card_1_text),
    story_card_2_title: filled(row.story_card_2_title, defaults.story_card_2_title),
    story_card_2_text: filled(row.story_card_2_text, defaults.story_card_2_text),
    story_card_3_title: filled(row.story_card_3_title, defaults.story_card_3_title),
    story_card_3_text: filled(row.story_card_3_text, defaults.story_card_3_text),
    contact_eyebrow: filled(row.contact_eyebrow, defaults.contact_eyebrow),
    contact_button_text: filled(row.contact_button_text, defaults.contact_button_text),
    footer_description: filled(row.footer_description, filled(row.tagline, defaults.footer_description)),
    footer_copyright: filled(row.footer_copyright, defaults.footer_copyright),
    hero_image_url: emptyToNull(row.hero_image_url ?? ""),
    story_card_1_image_url: emptyToNull(row.story_card_1_image_url ?? ""),
    story_card_2_image_url: emptyToNull(row.story_card_2_image_url ?? ""),
    story_card_3_image_url: emptyToNull(row.story_card_3_image_url ?? ""),
  };
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return fallbackSiteSettings();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", SITE_SETTINGS_ID)
      .maybeSingle();

    if (error || !data) return fallbackSiteSettings();
    return toPublicSettings(data);
  } catch {
    return fallbackSiteSettings();
  }
}

export async function fetchAdminSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load site settings. [${error.code ?? "unknown"}] ${error.message}`,
    );
  }

  return toPublicSettings(data);
}

export async function saveSiteSettings(input: SiteSettingsInput): Promise<PublicSiteSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const payload = {
    id: SITE_SETTINGS_ID,
    ...normalizeSiteSettingsInput(input),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Unable to save site settings. [${error?.code ?? "unknown"}] ${error?.message ?? "Please try again."}`,
    );
  }

  return toPublicSettings(data);
}

export type { SiteImageUrlField };

export async function updateSiteImageUrl(
  field: SiteImageUrlField,
  url: string | null,
  current: SiteSettingsInput,
): Promise<PublicSiteSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const imageUrl = emptyToNull(url ?? "");
  const patch: Partial<SiteSettingsInput> =
    field === "hero_image_url"
      ? { hero_image_url: imageUrl }
      : field === "story_card_1_image_url"
        ? { story_card_1_image_url: imageUrl }
        : field === "story_card_2_image_url"
          ? { story_card_2_image_url: imageUrl }
          : { story_card_3_image_url: imageUrl };

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SITE_SETTINGS_ID)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to save the photo. [${error.code ?? "unknown"}] ${error.message}`,
    );
  }

  if (!data) {
    return saveSiteSettings({
      ...current,
      [field]: imageUrl,
    });
  }

  return {
    ...toPublicSettings(current),
    [field]: imageUrl,
  };
}
