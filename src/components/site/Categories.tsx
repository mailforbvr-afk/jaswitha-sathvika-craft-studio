import Image from "next/image";
import { categoryAccent, categoryDisplayIcon } from "@/lib/categories";
import { BRAND, designedPublicText } from "@/lib/config";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Category, Product } from "@/lib/supabase/types";
import { DreamDecor } from "@/components/site/DreamDecor";

type CategoriesProps = {
  categories: Category[];
  products?: Product[];
  settings: PublicSiteSettings;
  onSelect: (categoryId: string) => void;
  decorations?: string[];
};

function previewForCategory(category: Category, products: Product[]): string | null {
  const match = products.find((product) => product.category_id === category.id && product.image_url);
  return match?.image_url ?? null;
}

export function Categories({ categories, products = [], settings, onSelect, decorations }: CategoriesProps) {
  return (
    <section
      id="categories"
      className="relative scroll-mt-24 px-4 py-10 sm:px-6 sm:py-12"
      aria-labelledby="categories-heading"
    >
      <DreamDecor decorations={decorations} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="section-badge">{designedPublicText(settings.collections_eyebrow, BRAND.collectionsEyebrow)}</p>
          <h2 id="categories-heading" className="section-title">
            {designedPublicText(settings.collections_title, BRAND.collectionsTitle)}
          </h2>
          {settings.collections_description ? (
            <p className="section-copy whitespace-pre-wrap">
              {designedPublicText(settings.collections_description, BRAND.collectionsDescription)}
            </p>
          ) : null}
          <p className="scrap-note scrap-note-center mt-4">Small Crafts ♥ Big Happiness</p>
        </div>
        {categories.length === 0 ? null : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
            {categories.map((category, index) => {
              const preview = previewForCategory(category, products);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelect(category.id)}
                  className={`collection-card bg-gradient-to-br p-3 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep sm:p-4 ${categoryAccent(index)}`}
                >
                  <span className="relative mb-3 block aspect-square overflow-hidden rounded-[1.45rem] bg-white/60">
                    {preview ? (
                      <Image
                        src={preview}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 180px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-4xl" aria-hidden="true">
                        {categoryDisplayIcon(category)}
                      </span>
                    )}
                  </span>
                  <span className="flex items-end justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-display text-base leading-snug text-ink">{category.name}</span>
                      <span className="mt-1 block text-xs font-semibold text-ink-soft">Handmade {category.name.toLowerCase()}</span>
                    </span>
                    <span className="arrow-chip" aria-hidden="true">
                      →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
