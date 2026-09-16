"use client";

import Image from "next/image";
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

function captionLines(caption: string): string[] {
  const trimmed = caption.trim();
  if (trimmed.includes("\n")) {
    return trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  }
  const match = trimmed.match(/^(Made by)\s+(.+)$/i);
  if (match) return [match[1], match[2]];
  return [trimmed];
}

export function HeroVisual({
  products,
  categories,
  title,
  caption,
  imageUrl,
  imageAlt,
  decorations = ["🎀", "✨", "🦋", "🌸"],
}: HeroVisualProps) {
  const photo = imageUrl?.trim() ?? "";
  const [photoFailed, setPhotoFailed] = useState(false);
  const motifs = decorations.length >= 4 ? decorations : ["🎀", "✨", "🦋", "🌸", "💕", "🌿"];

  useEffect(() => {
    setPhotoFailed(false);
  }, [photo]);

  const showKidsPhoto = photo.length > 0 && !photoFailed;
  const note = captionLines(caption);

  return (
    <div className="dream-reveal relative mx-auto w-full min-w-0 max-w-[24rem] px-1 sm:max-w-[26.5rem] lg:max-w-[28.5rem]" style={{ animationDelay: "0.12s" }}>
      {showKidsPhoto ? (
        <div className="hero-frame">
          <span className="hero-bow" aria-hidden="true">
            <span className="hero-bow-loop hero-bow-loop-l" />
            <span className="hero-bow-loop hero-bow-loop-r" />
            <span className="hero-bow-knot" />
            <span className="hero-bow-tail hero-bow-tail-l" />
            <span className="hero-bow-tail hero-bow-tail-r" />
          </span>

          <span className="hero-wreath" aria-hidden="true">
            <span className="hero-bloom hero-bloom-a" />
            <span className="hero-bloom hero-bloom-b" />
            <span className="hero-bloom hero-bloom-c" />
            <span className="hero-bloom hero-bloom-d" />
            <span className="hero-bloom hero-bloom-e" />
            <span className="hero-bloom hero-bloom-f" />
            <span className="hero-bloom hero-bloom-g" />
            <span className="hero-bloom hero-bloom-h" />
            <span className="hero-leaf hero-leaf-a" />
            <span className="hero-leaf hero-leaf-b" />
            <span className="hero-leaf hero-leaf-c" />
          </span>

          <span className="hero-motif left-[2%] top-[14%] text-lg sm:text-xl" aria-hidden="true">🦋</span>
          <span className="hero-motif hero-flower left-[1%] top-[24%] text-xl sm:text-2xl" aria-hidden="true">🌸</span>
          <span className="hero-motif hero-flower left-[-0.15rem] top-[40%] text-lg sm:text-xl" aria-hidden="true">🌷</span>
          <span className="hero-motif hero-flower left-[2%] top-[56%] text-xl sm:text-2xl" aria-hidden="true">🌸</span>
          <span className="hero-motif left-[8%] bottom-[18%] text-base sm:text-lg" aria-hidden="true">🌿</span>
          <span className="hero-motif hero-flower bottom-[8%] left-[16%] text-xl sm:text-2xl" aria-hidden="true">🌸</span>
          <span className="hero-motif bottom-[6%] left-[38%] text-sm sm:text-base" aria-hidden="true">💗</span>
          <span className="hero-motif hero-flower bottom-[10%] right-[30%] text-lg sm:text-xl" aria-hidden="true">🌷</span>
          <span className="hero-motif hero-flower right-[12%] bottom-[20%] text-xl sm:text-2xl" aria-hidden="true">🌸</span>
          <span className="hero-motif right-[6%] top-[8%] text-lg" aria-hidden="true">💗</span>
          <span className="hero-motif right-[4%] top-[36%] text-base" aria-hidden="true">💕</span>
          <span className="watercolor-dot left-[16%] top-[10%] h-2.5 w-2.5 bg-petal/80" aria-hidden="true" />
          <span className="watercolor-dot right-[36%] top-[6%] h-2 w-2 bg-lilac/80" aria-hidden="true" />
          <span className="watercolor-dot left-[8%] bottom-[30%] h-3 w-3 bg-sun/70" aria-hidden="true" />
          <span className="watercolor-dot right-[18%] top-[48%] h-2 w-2 bg-petal/70" aria-hidden="true" />

          <figure className="hero-blob">
            <div className="hero-blob-inner">
              <Image
                src={photo}
                alt={imageAlt || "Jaswitha and Sathvika"}
                fill
                sizes="(max-width: 1024px) 90vw, 460px"
                className="hero-blob-photo"
                onError={() => setPhotoFailed(true)}
              />
            </div>
          </figure>

          <p className="hero-hand-note">
            {note.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <p className="hero-create-note">
            Create
            <br />
            Play
            <br />
            Imagine
            <br />
            Repeat
            <span className="mt-0.5 block text-pink-deep">♡</span>
          </p>

          <span className="hero-rainbow" aria-hidden="true">
            <span className="hero-rainbow-arcs" />
            <span className="hero-cloud hero-cloud-l">☁️</span>
            <span className="hero-cloud hero-cloud-r">☁️</span>
          </span>
        </div>
      ) : (
        <div className="hero-photo-mat">
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <p className="font-display text-lg leading-tight text-ink sm:text-xl">{title}</p>
            <span className="text-base opacity-80" aria-hidden="true">
              {motifs[1]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {heroVisualSlots(products, categories).map((slot, index) => (
              <HeroVisualTile key={`${slot.type}-${index}`} slot={slot} />
            ))}
          </div>
          <p className="mt-3 px-1 text-center text-sm font-semibold text-ink-soft">{caption}</p>
        </div>
      )}
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
