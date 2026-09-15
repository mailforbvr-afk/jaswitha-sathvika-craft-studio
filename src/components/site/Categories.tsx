import { categoryAccent, categoryDisplayIcon } from "@/lib/categories";
import type { Category } from "@/lib/supabase/types";

type CategoriesProps = {
  categories: Category[];
  onSelect: (categoryId: string) => void;
};

export function Categories({ categories, onSelect }: CategoriesProps) {
  return (
    <section
      id="categories"
      className="dream-reveal mx-auto max-w-6xl px-4 py-10 sm:px-6"
      aria-labelledby="categories-heading"
    >
      <div className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-deep">Collections</p>
        <h2 id="categories-heading" className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Little categories, lots of colour
        </h2>
      </div>
      {categories.length === 0 ? null : (
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
          {categories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`min-w-[9.5rem] shrink-0 rounded-[1.6rem] bg-gradient-to-br p-4 text-left shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep sm:min-w-0 ${categoryAccent(index)}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {categoryDisplayIcon(category)}
              </span>
              <span className="mt-3 block font-display text-base text-ink">{category.name}</span>
              <span className="mt-1 block text-xs text-ink-soft">Tap to view</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
