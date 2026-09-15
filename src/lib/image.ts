import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  PRODUCT_IMAGE_BUCKET,
} from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, WEBP, or GIF image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Please choose an image smaller than 5 MB.";
  }
  return null;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read that image."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function optimizeImageFile(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;

  const image = await loadImage(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);

  const mimeType = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), mimeType, 0.86);
  });

  return blob ?? file;
}

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/gif") return "gif";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function storagePathFromPublicUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const marker = `/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const optimized = await optimizeImageFile(file);
  const contentType = optimized.type || file.type;
  const path = `${crypto.randomUUID()}.${extensionForType(contentType)}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, optimized, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (error) {
    throw new Error("Unable to upload the image. Please try again.");
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string | null): Promise<void> {
  const path = storagePathFromPublicUrl(imageUrl);
  const supabase = getSupabaseBrowserClient();
  if (!path || !supabase) return;

  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
}
