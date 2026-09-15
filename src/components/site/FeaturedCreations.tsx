import type { Product } from "@/lib/supabase/types";
import { ProductCard } from "@/components/site/ProductCard";

type FeaturedCreationsProps = {
  products: Product[];
};

export function FeaturedCreations({ products }: FeaturedCreationsProps) {
  const featured = products.filter((product) => product.featured && product.status === "AVAILABLE");
  if (featured.length === 0) return null;

  return (
    <section
      id="favorites"
      className="dream-reveal mx-auto max-w-6xl px-4 py-8 sm:px-6"
      aria-labelledby="featured-heading"
    >
      <div className="mb-6 text-center">
        <h2 id="featured-heading" className="font-display text-3xl text-ink sm:text-4xl">
          ✨ Little Favorites
        </h2>
        <p className="mt-2 text-ink-soft">A few handmade pieces we are especially happy to share.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} featured />
        ))}
      </div>
    </section>
  );
}
