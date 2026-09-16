"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { generateCatalogueImage, replaceCatalogueImage } from "@/lib/catalogue-image";
import { formatPriceInr, parsePrice } from "@/lib/format";
import { deleteProductImage, uploadProductImage, validateImageFile } from "@/lib/image";
import { updateProduct } from "@/lib/products";
import type { Category, Product, ProductStatus } from "@/lib/supabase/types";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  status: ProductStatus;
  featured: boolean;
};

export type ProductImageSave = {
  imageUrl: string | null;
  catalogueImageUrl: string | null;
  useCatalogueImage: boolean;
};

type ProductFormProps = {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product) => void;
  saveProduct: (values: ProductFormValues, images: ProductImageSave) => Promise<Product>;
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
  const [originalPreview, setOriginalPreview] = useState<string | null>(product?.image_url ?? null);
  const [cataloguePreview, setCataloguePreview] = useState<string | null>(product?.catalogue_image_url ?? null);
  const [catalogueBlob, setCatalogueBlob] = useState<Blob | null>(null);
  const [useCatalogueImage, setUseCatalogueImage] = useState(Boolean(product?.use_catalogue_image));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      setOriginalPreview(product.image_url);
      setCataloguePreview(product.catalogue_image_url);
      setUseCatalogueImage(Boolean(product.use_catalogue_image));
    } else {
      setValues({
        name: "",
        description: "",
        price: "",
        category_id: nextDefault,
        status: "AVAILABLE",
        featured: false,
      });
      setOriginalPreview(null);
      setCataloguePreview(null);
      setUseCatalogueImage(false);
    }
    setImageFile(null);
    setCatalogueBlob(null);
    setError(null);
  }, [product, options]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setOriginalPreview(url);
    setCataloguePreview(null);
    setCatalogueBlob(null);
    setUseCatalogueImage(false);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!catalogueBlob) return;
    const url = URL.createObjectURL(catalogueBlob);
    setCataloguePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [catalogueBlob]);

  const selectedCategory = options.find((category) => category.id === values.category_id);
  const originalSource = imageFile ?? originalPreview ?? product?.image_url ?? null;

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

  async function onGenerateCatalogue() {
    if (!originalSource) {
      setError("Please upload a product photo first.");
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const price = parsePrice(values.price);
      const blob = await generateCatalogueImage({
        source: originalSource,
        productName: values.name.trim(),
        priceLabel: price === null ? null : formatPriceInr(price),
        categorySlug: selectedCategory?.slug,
        categoryName: selectedCategory?.name,
      });
      setCatalogueBlob(blob);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to create the catalogue image. Your original photo is unchanged.",
      );
    } finally {
      setGenerating(false);
    }
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

      const catalogueImageUrl = imageFile && !catalogueBlob ? null : (product?.catalogue_image_url ?? null);
      if (imageFile && !catalogueBlob && product?.catalogue_image_url) {
        await deleteProductImage(product.catalogue_image_url);
      }

      const saved = await saveProduct(
        {
          ...values,
          name,
          price: String(price),
        },
        {
          imageUrl,
          catalogueImageUrl,
          useCatalogueImage: Boolean(
            useCatalogueImage && (catalogueBlob || (!imageFile && product?.catalogue_image_url)),
          ),
        },
      );

      let next = saved;
      if (catalogueBlob) {
        try {
          const catalogueUrl = await replaceCatalogueImage(
            catalogueBlob,
            saved.id,
            saved.catalogue_image_url,
          );
          next = await updateProduct(saved.id, {
            catalogue_image_url: catalogueUrl,
            use_catalogue_image: useCatalogueImage,
          });
        } catch (catalogueError) {
          setError(
            catalogueError instanceof Error
              ? catalogueError.message
              : "The product was saved, but the catalogue image could not be stored. Please try generating it again.",
          );
          onSaved(saved);
          return;
        }
      }

      onSaved(next);
    } catch {
      setError("Unable to save the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3 rounded-[1.6rem] bg-cream px-4 py-4">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Product Image</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-lilac/40 bg-white px-3 py-2 text-sm"
          />
        </label>
        {originalPreview ? (
          <div>
            <p className="mb-2 text-xs font-bold text-ink-soft">Original Image Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalPreview} alt="Original product photo" className="h-48 w-full rounded-3xl object-contain bg-white" />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void onGenerateCatalogue()}
          disabled={generating || !originalSource}
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-pink-deep hover:bg-petal/40 disabled:opacity-60 sm:w-auto"
        >
          {generating ? "Creating catalogue image…" : "✨ Generate Catalogue Image"}
        </button>
        <p className="text-xs text-ink-soft">
          This makes a separate square catalogue picture. The original photo is never replaced.
          Fill in the name and price first if you want them on the catalogue picture. You can
          generate before saving — the picture is stored when you click Save.
        </p>

        {cataloguePreview ? (
          <div className="space-y-3">
            <p className="text-sm font-bold">Catalogue Image</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cataloguePreview} alt="Generated catalogue preview" className="mx-auto aspect-square w-full max-w-xl rounded-3xl object-contain bg-white shadow-soft" />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setUseCatalogueImage(true)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  useCatalogueImage ? "bg-pink-deep text-white" : "bg-white text-ink hover:bg-petal/40"
                }`}
              >
                Use Catalogue Image
              </button>
              <button
                type="button"
                onClick={() => void onGenerateCatalogue()}
                disabled={generating}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-petal/40 disabled:opacity-60"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => setUseCatalogueImage(false)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  !useCatalogueImage ? "bg-purple-deep text-white" : "bg-white text-ink hover:bg-petal/40"
                }`}
              >
                Keep Original
              </button>
            </div>
            <p className="text-xs font-semibold text-ink-soft">
              {useCatalogueImage
                ? "The website will show the catalogue image after you save."
                : "The website will keep showing the original photo after you save."}
            </p>
          </div>
        ) : null}
      </div>

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
          disabled={saving || generating}
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
