"use client";

import { useEffect, useState } from "react";
import { fetchPublicCategories, type CategoryFilter } from "@/lib/categories";
import { shouldUseDemoData } from "@/lib/config";
import { DEMO_CATEGORIES } from "@/lib/demo-categories";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { fetchPublicProducts } from "@/lib/products";
import type { Category, Product } from "@/lib/supabase/types";
import { About } from "@/components/site/About";
import { Categories } from "@/components/site/Categories";
import { Contact } from "@/components/site/Contact";
import { DemoBanner } from "@/components/site/DemoBanner";
import { FeaturedCreations } from "@/components/site/FeaturedCreations";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Journey } from "@/components/site/Journey";
import { ProductGrid } from "@/components/site/ProductGrid";

function initialPublicProducts(): Product[] {
  if (!shouldUseDemoData()) return [];
  return DEMO_PRODUCTS.filter((product) => product.status === "AVAILABLE");
}

function initialPublicCategories(): Category[] {
  if (!shouldUseDemoData()) return [];
  return DEMO_CATEGORIES.filter((category) => category.active);
}

export function HomePage() {
  const demoMode = shouldUseDemoData();
  const [products, setProducts] = useState<Product[]>(initialPublicProducts);
  const [categories, setCategories] = useState<Category[]>(initialPublicCategories);
  const [filter, setFilter] = useState<CategoryFilter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productRows, categoryRows] = await Promise.all([
          fetchPublicProducts(),
          fetchPublicCategories(),
        ]);
        if (!cancelled) {
          setProducts(productRows);
          setCategories(categoryRows);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCategories([]);
          setError("Unable to load creations right now. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  function selectCategory(next: CategoryFilter) {
    setFilter(next);
    document.getElementById("creations")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="dream-page min-h-screen">
      <a href="#creations" className="skip-link">
        Skip to creations
      </a>
      {demoMode ? <DemoBanner /> : null}
      <Header />
      <main>
        <Hero />
        <Categories categories={categories} onSelect={selectCategory} />
        <FeaturedCreations products={products} />
        <ProductGrid
          products={products}
          categories={categories}
          filter={filter}
          search={search}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          loading={loading}
          error={error}
        />
        <About />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
