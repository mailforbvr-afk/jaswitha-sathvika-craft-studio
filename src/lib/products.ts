import { shouldUseDemoData } from "@/lib/config";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Category, Product, ProductInput } from "@/lib/supabase/types";

const PRODUCT_SELECT =
  "id, name, description, price, category_id, image_url, status, featured, created_at, updated_at, category:categories(*)";

type ProductRow = Omit<Product, "category"> & {
  category: Category | Category[] | null;
};

function friendlyError(fallback: string): Error {
  return new Error(fallback);
}

function normalizeProduct(row: ProductRow): Product {
  const category = Array.isArray(row.category) ? (row.category[0] ?? null) : row.category;
  return { ...row, category };
}

export async function fetchPublicProducts(): Promise<Product[]> {
  if (shouldUseDemoData()) {
    return DEMO_PRODUCTS.filter((product) => product.status === "AVAILABLE");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return DEMO_PRODUCTS.filter((product) => product.status === "AVAILABLE");
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: false });

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

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

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
