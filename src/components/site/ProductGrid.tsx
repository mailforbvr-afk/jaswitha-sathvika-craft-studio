import { categoryDisplayIcon, matchesCategoryFilter, type CategoryFilter } from "@/lib/categories";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Category, Product } from "@/lib/supabase/types";
import { ProductCard } from "@/components/site/ProductCard";

type ProductGridProps = {
  products: Product[];
  categories: Category[];
  filter: CategoryFilter;
  search: string;
  onFilterChange: (filter: CategoryFilter) => void;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  settings: PublicSiteSettings;
};

export function ProductGrid({
  products,
  categories,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  loading,
  error,
  settings,
}: ProductGridProps) {
  const query = search.trim().toLowerCase();
  const visible = products.filter((product) => {
    const matchesCategory = matchesCategoryFilter(product.category_id, filter);
    const matchesSearch = query.length === 0 || product.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="creations"
      className="dream-reveal mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="creations-heading"
    >
      <div className="mb-8 text-center">
        <p className="section-badge">{settings.gallery_eyebrow}</p>
        <h2 id="creations-heading" className="section-title">
          {settings.gallery_title}
        </h2>
        <p className="section-copy whitespace-pre-wrap">{settings.gallery_description}</p>
      </div>

      <div className="mb-7 flex flex-col gap-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by category">
          <FilterButton selected={filter === "ALL"} onClick={() => onFilterChange("ALL")} label="All" />
          {categories.map((category) => (
            <FilterButton
              key={category.id}
              selected={filter === category.id}
              onClick={() => onFilterChange(category.id)}
              label={`${categoryDisplayIcon(category)} ${category.name}`}
            />
          ))}
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search by product name</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name"
            className="min-h-11 w-full rounded-full border border-[var(--color-card-border)] bg-white px-4 py-2.5 text-sm text-ink outline-none ring-pink-deep placeholder:text-ink-soft/70 focus:ring-2"
          />
        </label>
      </div>

      {loading ? (
        <p className="rounded-[1.7rem] bg-[var(--color-card)] px-6 py-12 text-center text-ink-soft">Loading creations…</p>
      ) : error ? (
        <p className="rounded-[1.7rem] bg-[var(--color-card)] px-6 py-12 text-center text-pink-deep">{error}</p>
      ) : products.length === 0 ? (
        <p className="rounded-[1.7rem] bg-[var(--color-card)] px-6 py-12 text-center text-lg font-semibold text-ink-soft">
          New creations are coming soon! 🎨❤️
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-[1.7rem] bg-[var(--color-card)] px-6 py-12 text-center text-lg font-semibold text-ink-soft">
          {query
            ? "No creations match that name yet. Try another word! ✨"
            : "No creations in this category yet. Check back soon! 🌈"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} studioName={settings.studio_name} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-soft transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep ${
        selected
          ? "bg-pink-deep text-white"
          : "bg-white text-ink-soft hover:bg-petal/50"
      }`}
    >
      {label}
    </button>
  );
}
