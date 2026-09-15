import Image from "next/image";
import { categoryDisplayIcon, categoryLabel } from "@/lib/categories";
import { formatPriceInr, statusLabel } from "@/lib/format";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/supabase/types";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type ProductCardProps = {
  product: Product;
  featured?: boolean;
};

export function ProductCard({ product, featured = false }: ProductCardProps) {
  return (
    <article className="dream-card flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-white">
      <div className={`relative bg-cream-dark ${featured ? "aspect-[4/5] sm:aspect-square" : "aspect-square"}`}>
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
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="inline-flex w-fit items-center rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-pink-deep">
          <span aria-hidden="true" className="mr-1">
            {product.category ? categoryDisplayIcon(product.category) : "✨"}
          </span>
          {categoryLabel(product.category)}
        </p>
        <h3 className="font-display text-base leading-snug text-ink sm:text-xl">{product.name}</h3>
        <p className="mt-auto pt-1 font-display text-xl text-pink-deep sm:text-2xl">
          {formatPriceInr(product.price)}
        </p>
        <p className="inline-flex items-center gap-2 text-xs font-bold text-mint-deep sm:text-sm">
          <span aria-hidden="true">🟢</span>
          <span>{statusLabel(product.status)}</span>
        </p>
        <WhatsAppButton href={productWhatsAppUrl(product)} className="mt-1 w-full px-3 py-2 text-xs sm:text-sm">
          💬 I&apos;m Interested
        </WhatsAppButton>
      </div>
    </article>
  );
}
