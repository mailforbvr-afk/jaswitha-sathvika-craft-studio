import { categoryAccent, categoryDisplayIcon } from "@/lib/categories";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Category } from "@/lib/supabase/types";

type CategoriesProps = {
  categories: Category[];
  settings: PublicSiteSettings;
  onSelect: (categoryId: string) => void;
};

export function Categories({ categories, settings, onSelect }: CategoriesProps) {
  return (
    <section
      id="categories"
      className="dream-reveal mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="categories-heading"
    >
      <div className="mb-8 text-center">
        <p className="section-kicker">{settings.collections_eyebrow}</p>
        <h2 id="categories-heading" className="section-title">
          {settings.collections_title}
        </h2>
        {settings.collections_description ? (
          <p className="section-copy whitespace-pre-wrap">{settings.collections_description}</p>
        ) : null}
      </div>
      {categories.length === 0 ? null : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`rounded-[1.5rem] bg-gradient-to-br p-4 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep ${categoryAccent(index)}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-xl" aria-hidden="true">
                {categoryDisplayIcon(category)}
              </span>
              <span className="mt-3 block font-display text-base leading-snug text-ink">{category.name}</span>
              <span className="mt-1 block text-xs font-semibold text-ink-soft">Tap to view</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
