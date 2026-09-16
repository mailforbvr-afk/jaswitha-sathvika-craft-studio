import { DEMO_CATEGORIES } from "@/lib/demo-categories";
import type { Product } from "@/lib/supabase/types";

const now = "2026-01-01T00:00:00.000Z";

function demoCategory(slug: string) {
  const category = DEMO_CATEGORIES.find((item) => item.slug === slug);
  if (!category) {
    throw new Error(`Missing demo category: ${slug}`);
  }
  return category;
}

/**
 * Clearly marked sample items for local design preview only.
 * These are not real products or real prices. Remove by leaving
 * NEXT_PUBLIC_USE_DEMO_DATA unset once Supabase has real crafts.
 */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-bracelet",
    name: "Demo Beaded Bracelet (Sample)",
    description:
      "A sample gallery card showing how a handmade bracelet could appear. This is not a real product.",
    price: 0,
    category_id: demoCategory("bracelets").id,
    category: demoCategory("bracelets"),
    image_url: "/demo/bracelet.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-flower",
    name: "Demo Pipe-Cleaner Flower (Sample)",
    description:
      "A sample gallery card for a colourful pipe-cleaner flower. This is not a real product.",
    price: 0,
    category_id: demoCategory("flowers").id,
    category: demoCategory("flowers"),
    image_url: "/demo/flower.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-bouquet",
    name: "Demo Flower Bouquet (Sample)",
    description:
      "A sample gallery card for a handmade bouquet. This is not a real product.",
    price: 0,
    category_id: demoCategory("bouquets").id,
    category: demoCategory("bouquets"),
    image_url: "/demo/bouquet.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-keychain",
    name: "Demo Handmade Keychain (Sample)",
    description:
      "A sample gallery card for a handmade keychain. This is not a real product.",
    price: 0,
    category_id: demoCategory("keychains").id,
    category: demoCategory("keychains"),
    image_url: "/demo/keychain.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-magnet",
    name: "Demo Fridge Magnet (Sample)",
    description:
      "A sample gallery card for a fridge or photo magnet. This is not a real product.",
    price: 0,
    category_id: demoCategory("magnets").id,
    category: demoCategory("magnets"),
    image_url: "/demo/magnet.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-other",
    name: "Demo Mixed Craft (Sample)",
    description:
      "A sample gallery card for other handmade art. This is not a real product.",
    price: 0,
    category_id: demoCategory("other").id,
    category: demoCategory("other"),
    image_url: "/demo/other.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "AVAILABLE",
    featured: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "demo-sold",
    name: "Demo Sold Item (Should Stay Hidden)",
    description: "Used only to confirm sold items never appear in the public gallery.",
    price: 0,
    category_id: demoCategory("other").id,
    category: demoCategory("other"),
    image_url: "/demo/other.svg",
    catalogue_image_url: null,
    use_catalogue_image: false,
    status: "SOLD",
    featured: true,
    created_at: now,
    updated_at: now,
  },
];
