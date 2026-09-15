"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { parsePrice } from "@/lib/format";
import { deleteProductImage, uploadProductImage, validateImageFile } from "@/lib/image";
import type { Category, Product, ProductStatus } from "@/lib/supabase/types";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  status: ProductStatus;
  featured: boolean;
};

type ProductFormProps = {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product) => void;
  saveProduct: (
    values: ProductFormValues,
    imageUrl: string | null,
  ) => Promise<Product>;
};

export function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
  saveProduct,
}: ProductFormProps) {
  const options = useMemo(() => {
    const active = categories.filter((category) => category.active);
    if (product?.category_id && !active.some((category) => category.id === product.category_id)) {
      const current = categories.find((category) => category.id === product.category_id);
      return current ? [current, ...active] : active;
    }
    return active;
  }, [categories, product]);

  const defaultCategoryId = product?.category_id || options[0]?.id || "";
  const [values, setValues] = useState<ProductFormValues>({
    name: "",
    description: "",
    price: "",
    category_id: defaultCategoryId,
    status: "AVAILABLE",
    featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextDefault = product?.category_id || options[0]?.id || "";
    if (product) {
      setValues({
        name: product.name,
        description: product.description,
        price: String(product.price),
        category_id: product.category_id,
        status: product.status,
        featured: product.featured,
      });
      setPreviewUrl(product.image_url);
    } else {
      setValues({
        name: "",
        description: "",
        price: "",
        category_id: nextDefault,
        status: "AVAILABLE",
        featured: false,
      });
      setPreviewUrl(null);
    }
    setImageFile(null);
    setError(null);
  }, [product, options]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function onFileChange(file: File | null) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setImageFile(file);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = values.name.trim();
    if (!name) {
      setError("Please enter a product name.");
      return;
    }

    const price = parsePrice(values.price);
    if (price === null) {
      setError("Please enter a valid price.");
      return;
    }

    if (!values.category_id) {
      setError("Please choose a category.");
      return;
    }

    if (!product && !imageFile) {
      setError("Please choose a product photo.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = product?.image_url ?? null;
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile);
          if (product?.image_url && product.image_url !== imageUrl) {
            await deleteProductImage(product.image_url);
          }
        } catch (uploadError) {
          setError(
            uploadError instanceof Error
              ? uploadError.message
              : "Unable to upload the image. Please try again.",
          );
          return;
        }
      }

      const saved = await saveProduct(
        {
          ...values,
          name,
          price: String(price),
        },
        imageUrl,
      );
      onSaved(saved);
    } catch {
      setError("Unable to save the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Product photo</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-lilac/40 bg-white px-3 py-2 text-sm"
        />
      </label>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Product preview" className="h-48 w-full rounded-3xl object-cover" />
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-bold">Product name</span>
        <input
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">Description</span>
        <textarea
          rows={4}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">Price (INR, numbers only)</span>
        <input
          inputMode="decimal"
          value={values.price}
          onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
          placeholder="150"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">Category</span>
        <select
          value={values.category_id}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              category_id: event.target.value,
            }))
          }
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
        >
          {options.length === 0 ? (
            <option value="">Add a category first</option>
          ) : (
            options.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
                {category.active ? "" : " (inactive)"}
              </option>
            ))
          )}
        </select>
      </label>

      <fieldset>
        <legend className="mb-1 text-sm font-bold">Status</legend>
        <div className="flex gap-3">
          {(["AVAILABLE", "SOLD"] as ProductStatus[]).map((status) => (
            <label key={status} className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2">
              <input
                type="radio"
                name="status"
                checked={values.status === status}
                onChange={() => setValues((current) => ({ ...current, status }))}
              />
              {status === "AVAILABLE" ? "Available" : "Sold"}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="inline-flex items-center gap-2 font-bold">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(event) =>
            setValues((current) => ({ ...current, featured: event.target.checked }))
          }
        />
        Featured
      </label>

      {error ? <p className="text-sm font-semibold text-pink-deep">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-purple-deep px-5 py-3 font-bold text-white hover:bg-ink disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white px-5 py-3 font-bold text-ink hover:bg-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
