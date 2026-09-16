import {
  MAX_IMAGE_BYTES,
  SITE_ALLOWED_IMAGE_TYPES,
  SITE_IMAGE_BUCKET,
} from "@/lib/config";
import { optimizeImageFile } from "@/lib/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SiteImageSlot = "hero" | "story-1" | "story-2" | "story-3";

export type SiteImageUrlField =
  | "hero_image_url"
  | "story_card_1_image_url"
  | "story_card_2_image_url"
  | "story_card_3_image_url";

export const SITE_IMAGE_FIELD_BY_SLOT: Record<SiteImageSlot, SiteImageUrlField> = {
  hero: "hero_image_url",
  "story-1": "story_card_1_image_url",
  "story-2": "story_card_2_image_url",
  "story-3": "story_card_3_image_url",
};

export function validateSiteImageFile(file: File): string | null {
  if (!SITE_ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, or WebP photo.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Please choose a photo smaller than 5 MB.";
  }
  return null;
}

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function storagePathForSlot(slot: SiteImageSlot, extension: string): string {
  const id = crypto.randomUUID();
  if (slot === "hero") return `site/hero/${id}.${extension}`;
  if (slot === "story-1") return `site/story/1/${id}.${extension}`;
  if (slot === "story-2") return `site/story/2/${id}.${extension}`;
  return `site/story/3/${id}.${extension}`;
}

export function siteImagePathFromPublicUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const marker = `/object/public/${SITE_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export function filenameFromSiteImageUrl(imageUrl: string | null | undefined): string | null {
  const path = siteImagePathFromPublicUrl(imageUrl);
  if (!path) return null;
  const name = path.split("/").pop()?.trim() ?? "";
  return name.length > 0 ? name : null;
}

export async function uploadSiteImage(slot: SiteImageSlot, file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const validationError = validateSiteImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const optimized = await optimizeImageFile(file);
  const contentType = SITE_ALLOWED_IMAGE_TYPES.includes(optimized.type)
    ? optimized.type
    : file.type;
  const path = storagePathForSlot(slot, extensionForType(contentType));

  const { error } = await supabase.storage.from(SITE_IMAGE_BUCKET).upload(path, optimized, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });

  if (error) {
    throw new Error("Unable to upload the photo. Please try again.");
  }

  const { data } = supabase.storage.from(SITE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteSiteImage(
  imageUrl: string | null | undefined,
): Promise<"deleted" | "skipped" | "failed"> {
  const path = siteImagePathFromPublicUrl(imageUrl);
  if (!path) return "skipped";

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "failed";

  const { error } = await supabase.storage.from(SITE_IMAGE_BUCKET).remove([path]);
  return error ? "failed" : "deleted";
}
