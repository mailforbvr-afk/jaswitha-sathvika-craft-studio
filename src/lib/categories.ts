import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Category, CategoryInput } from "@/lib/supabase/types";

export type CategoryFilter = "ALL" | string;

export const CATEGORY_ACCENTS = [
  "from-[#fde3ee] to-[#f7cfe0]",
  "from-[#f3e7fb] to-[#ddd0f3]",
  "from-[#e4f4fc] to-[#cfe8f7]",
  "from-[#e7f8ef] to-[#cfeee0]",
  "from-[#fff4d6] to-[#ffe9a8]",
  "from-[#fde8f3] to-[#f3e7fb]",
];

export function categoryAccent(index: number): string {
  return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
}

export function categoryDisplayIcon(category: {
  name: string;
  slug: string;
  icon: string | null;
}): string {
  const stored = category.icon?.trim();
  if (stored) return stored;

  const haystack = `${category.slug} ${category.name}`.toLowerCase();
  if (haystack.includes("bracelet")) return "🎀";
  if (haystack.includes("bouquet")) return "💐";
  if (haystack.includes("flower")) return "🌸";
  if (haystack.includes("key")) return "🔑";
  if (haystack.includes("magnet")) return "💖";
  if (haystack.includes("hair")) return "🎀";
  return "✨";
}

export function categoryLabel(category: Category | null | undefined): string {
  return category?.name ?? "Uncategorised";
}

export function categoryFilterLabel(category: Category): string {
  return `${categoryDisplayIcon(category)} ${category.name}`;
}

export function slugifyCategoryName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "category";
}

export function matchesCategoryFilter(categoryId: string, filter: CategoryFilter): boolean {
  return filter === "ALL" || categoryId === filter;
}

function friendlyError(fallback: string): Error {
  return new Error(fallback);
}

export async function fetchPublicCategories(): Promise<Category[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw friendlyError("Unable to load categories right now. Please try again.");
  }

  return data ?? [];
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw friendlyError("Unable to load categories. Please try again.");
  }

  return data ?? [];
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase.from("categories").insert(input).select("*").single();
  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("A category with this name or web address already exists.");
    }
    throw friendlyError("Unable to save the category.");
  }
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("A category with this name or web address already exists.");
    }
    throw friendlyError("Unable to save the category.");
  }
  return data;
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) {
    throw friendlyError("Unable to check this category.");
  }

  return count ?? 0;
}

export async function deleteCategory(id: string): Promise<void> {
  const usedCount = await countProductsInCategory(id);
  if (usedCount > 0) {
    throw new Error(
      "This category still has products. Please move those products to another category first.",
    );
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "This category still has products. Please move those products to another category first.",
      );
    }
    throw friendlyError("Unable to delete the category. Please try again.");
  }
}

export function nextCategoryDisplayOrder(categories: Category[]): number {
  if (categories.length === 0) return 10;
  return Math.max(...categories.map((category) => category.display_order)) + 10;
}
