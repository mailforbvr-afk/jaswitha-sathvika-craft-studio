"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel, fetchAdminCategories } from "@/lib/categories";
import { isSupabaseConfigured } from "@/lib/config";
import { formatPriceInr, parsePrice, statusLabel } from "@/lib/format";
import { deleteProductImage } from "@/lib/image";
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  productStats,
  updateProduct,
} from "@/lib/products";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/supabase/types";
import { AdminNav } from "@/components/admin/AdminNav";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { ProductPreview } from "@/components/admin/ProductPreview";

export function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [preview, setPreview] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    async function boot() {
      if (!isSupabaseConfigured() || !supabase) {
        router.replace("/admin/login");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      if (!cancelled) setCheckingAuth(false);
      await loadData();
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [rows, categoryRows] = await Promise.all([
          fetchAdminProducts(),
          fetchAdminCategories(),
        ]);
        if (!cancelled) {
          setProducts(rows);
          setCategories(categoryRows);
        }
      } catch {
        if (!cancelled) setError("Unable to load products. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveProduct(values: ProductFormValues, imageUrl: string | null): Promise<Product> {
    const price = parsePrice(values.price);
    if (price === null) {
      throw new Error("Please enter a valid price.");
    }

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price,
      category_id: values.category_id,
      image_url: imageUrl,
      status: values.status,
      featured: values.featured,
    };

    if (editing && editing !== "new") {
      return updateProduct(editing.id, payload);
    }
    return createProduct(payload);
  }

  function onSaved(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) => (item.id === product.id ? product : item));
      }
      return [product, ...current];
    });
    setEditing(null);
  }

  async function toggleStatus(product: Product) {
    setBusyId(product.id);
    try {
      const nextStatus = product.status === "AVAILABLE" ? "SOLD" : "AVAILABLE";
      const updated = await updateProduct(product.id, { status: nextStatus });
      setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("Unable to save the product.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeatured(product: Product) {
    setBusyId(product.id);
    try {
      const updated = await updateProduct(product.id, { featured: !product.featured });
      setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("Unable to save the product.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(product: Product) {
    const confirmed = window.confirm(`Delete “${product.name}”? This cannot be undone.`);
    if (!confirmed) return;

    setBusyId(product.id);
    try {
      await deleteProduct(product.id);
      await deleteProductImage(product.image_url);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch {
      setError("Unable to delete the product. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/admin/login");
  }

  if (checkingAuth) {
    return <p className="p-8 text-center text-ink-soft">Checking sign-in…</p>;
  }

  const stats = productStats(products);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <AdminNav current="products" onSignOut={() => void signOut()} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total", stats.total],
          ["Available", stats.available],
          ["Sold", stats.sold],
          ["Featured", stats.featured],
        ].map(([label, value]) => (
          <div key={label} className="studio-card rounded-3xl bg-white p-4">
            <p className="text-sm font-bold text-ink-soft">{label}</p>
            <p className="font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="mb-4 font-semibold text-pink-deep">{error}</p> : null}

      <CategoryManager categories={categories} onChange={setCategories} />

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded-full bg-purple-deep px-5 py-3 font-bold text-white"
        >
          + Add New Creation
        </button>
      </div>

      {editing ? (
        <section className="studio-card mb-6 rounded-[2rem] bg-white p-5">
          <h2 className="mb-4 font-display text-2xl">
            {editing === "new" ? "Add Product" : "Edit Product"}
          </h2>
          <ProductForm
            product={editing === "new" ? null : editing}
            categories={categories}
            onClose={() => setEditing(null)}
            onSaved={onSaved}
            saveProduct={saveProduct}
          />
        </section>
      ) : null}

      {loading ? (
        <p className="rounded-3xl bg-white p-8 text-center">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-ink-soft">
          No products yet. Add your first creation!
        </p>
      ) : (
        <div className="space-y-4">
          <div className="hidden overflow-hidden rounded-[2rem] bg-white shadow-soft lg:block">
            <table className="w-full text-left">
              <thead className="bg-cream-dark text-sm">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-cream-dark">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url || "/demo/other.svg"}
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                        <span className="font-bold">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPriceInr(product.price)}</td>
                    <td className="px-4 py-3">{categoryLabel(product.category)}</td>
                    <td className="px-4 py-3">
                      {product.status === "AVAILABLE" ? "🟢" : "🔴"} {statusLabel(product.status)}
                    </td>
                    <td className="px-4 py-3">{product.featured ? "⭐" : "—"}</td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        product={product}
                        busy={busyId === product.id}
                        onEdit={() => setEditing(product)}
                        onPreview={() => setPreview(product)}
                        onToggleStatus={() => void toggleStatus(product)}
                        onToggleFeatured={() => void toggleFeatured(product)}
                        onDelete={() => void onDelete(product)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {products.map((product) => (
              <article key={product.id} className="studio-card rounded-3xl bg-white p-4">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url || "/demo/other.svg"}
                    alt=""
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div>
                    <h2 className="font-display text-xl">{product.name}</h2>
                    <p>{formatPriceInr(product.price)}</p>
                    <p className="text-sm text-ink-soft">
                      {categoryLabel(product.category)} · {statusLabel(product.status)}
                      {product.featured ? " · ⭐ Featured" : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <ActionButtons
                    product={product}
                    busy={busyId === product.id}
                    onEdit={() => setEditing(product)}
                    onPreview={() => setPreview(product)}
                    onToggleStatus={() => void toggleStatus(product)}
                    onToggleFeatured={() => void toggleFeatured(product)}
                    onDelete={() => void onDelete(product)}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {preview ? <ProductPreview product={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}

function ActionButtons({
  product,
  busy,
  onEdit,
  onPreview,
  onToggleStatus,
  onToggleFeatured,
  onDelete,
}: {
  product: Product;
  busy: boolean;
  onEdit: () => void;
  onPreview: () => void;
  onToggleStatus: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold" onClick={onEdit} disabled={busy}>
        Edit
      </button>
      <button type="button" className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold" onClick={onPreview} disabled={busy}>
        Preview
      </button>
      <button
        type="button"
        className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold"
        onClick={onToggleStatus}
        disabled={busy}
      >
        {product.status === "AVAILABLE" ? "Mark sold" : "Mark available"}
      </button>
      <button
        type="button"
        className="rounded-full bg-cream px-3 py-1.5 text-sm font-bold"
        onClick={onToggleFeatured}
        disabled={busy}
      >
        {product.featured ? "Unfeature" : "Feature"}
      </button>
      <button
        type="button"
        className="rounded-full bg-petal px-3 py-1.5 text-sm font-bold text-ink"
        onClick={onDelete}
        disabled={busy}
      >
        Delete
      </button>
    </div>
  );
}
