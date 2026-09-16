import { shouldUseDemoData } from "@/lib/config";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Category, Product, ProductInput } from "@/lib/supabase/types";

const PRODUCT_SELECT =
  "id, name, description, price, category_id, image_url, catalogue_image_url, use_catalogue_image, status, featured, created_at, updated_at, category:categories(*)";

const PRODUCT_SELECT_LEGACY =
  "id, name, description, price, category_id, image_url, status, featured, created_at, updated_at, category:categories(*)";

type ProductRow = Omit<Product, "category"> & {
  category: Category | Category[] | null;
};

function friendlyError(fallback: string): Error {
  return new Error(fallback);
}

function missingCatalogueColumns(message: string | undefined): boolean {
  const text = message?.toLowerCase() ?? "";
  return text.includes("catalogue_image_url") || text.includes("use_catalogue_image");
}

function normalizeProduct(row: ProductRow): Product {
  const category = Array.isArray(row.category) ? (row.category[0] ?? null) : row.category;
  return {
    ...row,
    catalogue_image_url: row.catalogue_image_url ?? null,
    use_catalogue_image: Boolean(row.use_catalogue_image),
    category,
  };
}

export function productDisplayImage(
  product: Pick<Product, "image_url" | "catalogue_image_url" | "use_catalogue_image">,
): string | null {
  if (product.use_catalogue_image && product.catalogue_image_url) {
    return product.catalogue_image_url;
  }
  return product.image_url;
}

export async function fetchPublicProducts(): Promise<Product[]> {
  if (shouldUseDemoData()) {
    return DEMO_PRODUCTS.filter((product) => product.status === "AVAILABLE");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return DEMO_PRODUCTS.filter((product) => product.status === "AVAILABLE");
  }

  let { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false });

  if (error && missingCatalogueColumns(error.message)) {
    const retry = await supabase
      .from("products")
      .select(PRODUCT_SELECT_LEGACY)
      .eq("status", "AVAILABLE")
      .order("created_at", { ascending: false });
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error) {
    throw friendlyError("Unable to load creations right now. Please try again.");
  }

  return ((data ?? []) as ProductRow[]).map(normalizeProduct);
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  let { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error && missingCatalogueColumns(error.message)) {
    const retry = await supabase
      .from("products")
      .select(PRODUCT_SELECT_LEGACY)
      .order("created_at", { ascending: false });
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error) {
    throw friendlyError("Unable to load products. Please try again.");
  }

  return ((data ?? []) as ProductRow[]).map(normalizeProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select(PRODUCT_SELECT)
    .single();

  if (error || !data) {
    throw friendlyError("Unable to save the product.");
  }

  return normalizeProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();

  if (error || !data) {
    throw friendlyError("Unable to save the product.");
  }

  return normalizeProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw friendlyError("Unable to delete the product. Please try again.");
  }
}

export function productStats(products: Product[]) {
  return {
    total: products.length,
    available: products.filter((product) => product.status === "AVAILABLE").length,
    sold: products.filter((product) => product.status === "SOLD").length,
    featured: products.filter((product) => product.featured).length,
  };
}
