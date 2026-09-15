import { categoryDisplayIcon, matchesCategoryFilter, type CategoryFilter } from "@/lib/categories";
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
      className="dream-reveal mx-auto max-w-6xl px-4 py-10 sm:px-6"
      aria-labelledby="creations-heading"
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-deep">Gallery</p>
        <h2 id="creations-heading" className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          All our crafts
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          Every piece is handmade, one of a kind, and shared here so you can enjoy looking — and message us if something makes you smile.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
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
            className="w-full rounded-full border border-petal/50 bg-white px-4 py-2.5 text-sm text-ink outline-none ring-pink-deep placeholder:text-ink-soft/70 focus:ring-2"
          />
        </label>
      </div>

      {loading ? (
        <p className="rounded-[1.7rem] bg-white px-6 py-12 text-center text-ink-soft">Loading creations…</p>
      ) : error ? (
        <p className="rounded-[1.7rem] bg-white px-6 py-12 text-center text-pink-deep">{error}</p>
      ) : products.length === 0 ? (
        <p className="rounded-[1.7rem] bg-white px-6 py-12 text-center text-lg font-semibold text-ink-soft">
          New creations are coming soon! 🎨❤️
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-[1.7rem] bg-white px-6 py-12 text-center text-lg font-semibold text-ink-soft">
          {query
            ? "No creations match that name yet. Try another word! ✨"
            : "No creations in this category yet. Check back soon! 🌈"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
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
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep ${
        selected
          ? "bg-pink-deep text-white"
          : "bg-white text-ink-soft hover:bg-petal/50"
      }`}
    >
      {label}
    </button>
  );
}
