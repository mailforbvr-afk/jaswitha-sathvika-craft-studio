"use client";

import { useEffect, useState } from "react";
import { categoryDisplayIcon } from "@/lib/categories";
import { SitePhoto } from "@/components/site/SitePhoto";
import type { Category, Product } from "@/lib/supabase/types";

const FALLBACK_CRAFTS = [
  { label: "Bracelets", icon: "🎀" },
  { label: "Flowers", icon: "🌸" },
  { label: "Keychains", icon: "🔑" },
  { label: "Magnets", icon: "💖" },
];

export type HeroVisualSlot =
  | { type: "photo"; src: string; alt: string }
  | { type: "craft"; label: string; icon: string };

export function heroVisualSlots(products: Product[], categories: Category[]): HeroVisualSlot[] {
  const seen = new Set<string>();
  const photos: HeroVisualSlot[] = [];

  const ordered = [
    ...products.filter((product) => product.featured && product.image_url),
    ...products.filter((product) => !product.featured && product.image_url),
  ];

  for (const product of ordered) {
    if (!product.image_url || seen.has(product.image_url)) continue;
    seen.add(product.image_url);
    photos.push({ type: "photo", src: product.image_url, alt: product.name });
    if (photos.length === 4) return photos;
  }

  const crafts = (categories.length > 0 ? categories : FALLBACK_CRAFTS).map((item) =>
    "name" in item
      ? { type: "craft" as const, label: item.name, icon: categoryDisplayIcon(item) }
      : { type: "craft" as const, label: item.label, icon: item.icon },
  );

  const slots = [...photos];
  for (const craft of crafts) {
    if (slots.length === 4) break;
    slots.push(craft);
  }

  while (slots.length < 4) {
    const fallback = FALLBACK_CRAFTS[slots.length % FALLBACK_CRAFTS.length];
    slots.push({ type: "craft", label: fallback.label, icon: fallback.icon });
  }

  return slots.slice(0, 4);
}

type HeroVisualProps = {
  products: Product[];
  categories: Category[];
  title: string;
  caption: string;
  imageUrl?: string | null;
  imageAlt?: string;
  decorations?: string[];
};

export function HeroVisual({
  products,
  categories,
  title,
  caption,
  imageUrl,
  imageAlt,
  decorations = ["✨", "🌸", "🦋", "🎀"],
}: HeroVisualProps) {
  const photo = imageUrl?.trim() ?? "";
  const [photoFailed, setPhotoFailed] = useState(false);
  const motifs = decorations.length >= 4 ? decorations : ["✨", "🌸", "🦋", "🎀", "💕", "⭐"];

  useEffect(() => {
    setPhotoFailed(false);
  }, [photo]);

  const showKidsPhoto = photo.length > 0 && !photoFailed;

  return (
    <div className="dream-reveal relative mx-auto w-full min-w-0 max-w-md px-2 pb-3 lg:max-w-lg" style={{ animationDelay: "0.12s" }}>
      <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 text-lg sm:text-xl" aria-hidden="true">
        {motifs[1]}
      </span>
      <span className="pointer-events-none absolute -left-2 top-[28%] z-20 text-lg sm:text-xl" aria-hidden="true">
        {motifs[3] ?? "🌸"}
      </span>
      <span className="pointer-events-none absolute -right-2 top-[42%] z-20 text-lg sm:text-xl" aria-hidden="true">
        {motifs[0]}
      </span>
      <span className="pointer-events-none absolute -bottom-1 left-8 z-20 text-sm opacity-80 sm:text-base" aria-hidden="true">
        {motifs[1]}
      </span>
      <span className="pointer-events-none absolute -bottom-1 right-10 z-20 text-sm opacity-80 sm:text-base" aria-hidden="true">
        {motifs[2]}
      </span>

      <div className="hero-photo-mat relative">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <p className="font-display text-lg leading-tight text-ink sm:text-xl">{title}</p>
          <span className="text-base opacity-80" aria-hidden="true">
            {motifs[1] ?? "✨"}
          </span>
        </div>

        {showKidsPhoto ? (
          <figure className="hero-photo-well aspect-[4/5]">
            <SitePhoto
              src={photo}
              alt={imageAlt || "Jaswitha and Sathvika"}
              sizes="(max-width: 1024px) 90vw, 480px"
              objectFit="contain"
              fallback={null}
              onError={() => setPhotoFailed(true)}
            />
          </figure>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {heroVisualSlots(products, categories).map((slot, index) => (
              <HeroVisualTile key={`${slot.type}-${index}`} slot={slot} />
            ))}
          </div>
        )}

        <p className="mt-3 px-1 text-center text-sm font-semibold text-ink-soft">{caption}</p>
      </div>
    </div>
  );
}

function HeroVisualTile({ slot }: { slot: HeroVisualSlot }) {
  if (slot.type === "photo") {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-cream-dark">
        <SitePhoto
          src={slot.src}
          alt={slot.alt}
          sizes="(max-width: 640px) 42vw, 220px"
          objectFit="cover"
          fallback={
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-cream to-lilac/50">
              <span aria-hidden="true">✨</span>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-cream to-lilac/50 px-2 text-center">
      <span className="text-2xl sm:text-3xl" aria-hidden="true">
        {slot.icon}
      </span>
      <span className="mt-1 text-xs font-bold text-ink sm:text-sm">{slot.label}</span>
    </div>
  );
}
