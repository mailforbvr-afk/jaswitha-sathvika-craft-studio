import Image from "next/image";
import { categoryDisplayIcon, categoryLabel } from "@/lib/categories";
import { BRAND } from "@/lib/config";
import { formatPriceInr, statusLabel } from "@/lib/format";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/supabase/types";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type ProductCardProps = {
  product: Product;
  featured?: boolean;
  studioName?: string;
};

export function ProductCard({ product, featured = false, studioName = BRAND.studioName }: ProductCardProps) {
  return (
    <article className="dream-card flex h-full flex-col overflow-hidden p-2.5 sm:p-3">
      <div className={`relative overflow-hidden rounded-[1.4rem] bg-cream-dark ${featured ? "aspect-[4/5] sm:aspect-[5/6]" : "aspect-square"}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-petal/70 via-lilac/60 to-cloud/70 px-3 text-center">
            <span className="text-4xl" aria-hidden="true">
              {product.category ? categoryDisplayIcon(product.category) : "🌸"}
            </span>
            <span className="sr-only">No photo yet for {product.name}</span>
          </div>
        )}
        <p className="absolute left-2 top-2 inline-flex max-w-[calc(100%-1rem)] items-center rounded-full bg-white/92 px-2.5 py-1 text-[0.68rem] font-bold text-pink-deep shadow-soft">
          <span aria-hidden="true" className="mr-1">
            {product.category ? categoryDisplayIcon(product.category) : "✨"}
          </span>
          <span className="truncate">{categoryLabel(product.category)}</span>
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:p-3">
        <h3 className="font-display text-[0.98rem] leading-snug text-ink sm:text-lg">{product.name}</h3>
        {featured && product.description ? (
          <p className="line-clamp-2 text-sm leading-5 text-ink-soft">{product.description}</p>
        ) : null}
        <p className="font-display text-lg text-pink-deep sm:text-xl">{formatPriceInr(product.price)}</p>
        <p className="inline-flex items-center gap-2 text-xs font-bold text-mint-deep">
          <span aria-hidden="true">🟢</span>
          <span>{statusLabel(product.status)}</span>
        </p>
        <WhatsAppButton href={productWhatsAppUrl(product, studioName)} className="mt-auto min-h-10 w-full px-3 py-2 text-xs sm:text-sm">
          💬 I&apos;m Interested
        </WhatsAppButton>
      </div>
    </article>
  );
}
