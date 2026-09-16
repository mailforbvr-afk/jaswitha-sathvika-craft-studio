import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Product } from "@/lib/supabase/types";
import { ProductCard } from "@/components/site/ProductCard";

type FeaturedCreationsProps = {
  products: Product[];
  settings: PublicSiteSettings;
};

export function FeaturedCreations({ products, settings }: FeaturedCreationsProps) {
  const featured = products.filter((product) => product.featured && product.status === "AVAILABLE");
  if (featured.length === 0) return null;

  return (
    <section
      id="favorites"
      className="dream-reveal mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-12"
      aria-labelledby="featured-heading"
    >
      <div className="mb-8 text-center">
        <p className="section-badge">{settings.featured_eyebrow}</p>
        <h2 id="featured-heading" className="section-title">
          {settings.featured_title}
        </h2>
        {settings.featured_description ? (
          <p className="section-copy whitespace-pre-wrap">{settings.featured_description}</p>
        ) : null}
        <p className="scrap-note scrap-note-center mt-3">Handmade Happiness ♡</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} featured studioName={settings.studio_name} />
        ))}
      </div>
    </section>
  );
}
