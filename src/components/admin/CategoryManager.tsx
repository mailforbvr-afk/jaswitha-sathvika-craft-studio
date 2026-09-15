"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  nextCategoryDisplayOrder,
  slugifyCategoryName,
  updateCategory,
} from "@/lib/categories";
import type { Category } from "@/lib/supabase/types";

type CategoryManagerProps = {
  categories: Category[];
  onChange: (categories: Category[]) => void;
};

type FormState = {
  name: string;
  icon: string;
  display_order: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  icon: "",
  display_order: "",
  active: true,
};

export function CategoryManager({ categories, onChange }: CategoryManagerProps) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [values, setValues] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)),
    [categories],
  );

  function startNew() {
    setEditing("new");
    setValues({
      ...emptyForm,
      display_order: String(nextCategoryDisplayOrder(categories)),
    });
    setError(null);
  }

  function startEdit(category: Category) {
    setEditing(category);
    setValues({
      name: category.name,
      icon: category.icon ?? "",
      display_order: String(category.display_order),
      active: category.active,
    });
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    const displayOrder = Number(values.display_order);
    if (!Number.isInteger(displayOrder)) {
      setError("Please enter a whole number for display order.");
      return;
    }

    const payload = {
      name,
      slug: slugifyCategoryName(name),
      icon: values.icon.trim() || null,
      display_order: displayOrder,
      active: values.active,
    };

    setBusyId(editing === "new" ? "new" : editing?.id ?? null);
    setError(null);
    try {
      if (editing && editing !== "new") {
        const saved = await updateCategory(editing.id, payload);
        onChange(categories.map((category) => (category.id === saved.id ? saved : category)));
      } else {
        const saved = await createCategory(payload);
        onChange([...categories, saved]);
      }
      setEditing(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the category.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(category: Category) {
    setBusyId(category.id);
    setError(null);
    try {
      const saved = await updateCategory(category.id, { active: !category.active });
      onChange(categories.map((item) => (item.id === saved.id ? saved : item)));
    } catch {
      setError("Unable to save the category.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(category: Category, direction: -1 | 1) {
    const index = sorted.findIndex((item) => item.id === category.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;

    setBusyId(category.id);
    setError(null);
    try {
      const first = await updateCategory(category.id, { display_order: swapWith.display_order });
      const second = await updateCategory(swapWith.id, { display_order: category.display_order });
      onChange(
        categories.map((item) => {
          if (item.id === first.id) return first;
          if (item.id === second.id) return second;
          return item;
        }),
      );
    } catch {
      setError("Unable to change the display order.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(category: Category) {
    const confirmed = window.confirm(`Delete “${category.name}”?`);
    if (!confirmed) return;

    setBusyId(category.id);
    setError(null);
    try {
      await deleteCategory(category.id);
      onChange(categories.filter((item) => item.id !== category.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the category. Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="studio-card mb-6 rounded-[2rem] bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl">Categories</h2>
        <button
          type="button"
          onClick={startNew}
          className="rounded-full bg-purple-deep px-4 py-2 text-sm font-bold text-white"
        >
          + Add category
        </button>
      </div>

      {error ? <p className="mb-4 font-semibold text-pink-deep">{error}</p> : null}

      {editing ? (
        <form onSubmit={onSubmit} className="mb-5 grid gap-3 rounded-3xl bg-cream p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-bold">Name</span>
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-lilac/40 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
              placeholder="Hair Accessories"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Icon (optional)</span>
            <input
              value={values.icon}
              onChange={(event) => setValues((current) => ({ ...current, icon: event.target.value }))}
              className="w-full rounded-2xl border border-lilac/40 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
              placeholder="🎀"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Display order</span>
            <input
              inputMode="numeric"
              value={values.display_order}
              onChange={(event) =>
                setValues((current) => ({ ...current, display_order: event.target.value }))
              }
              className="w-full rounded-2xl border border-lilac/40 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
            />
          </label>
          <label className="inline-flex items-center gap-2 font-bold sm:col-span-2">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) =>
                setValues((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Active on the public website
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={Boolean(busyId)}
              className="rounded-full bg-purple-deep px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Save category
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {sorted.length === 0 ? (
        <p className="text-ink-soft">No categories yet. Add Bracelets, Flowers, or a new collection.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((category, index) => (
            <li
              key={category.id}
              className="flex flex-col gap-3 rounded-3xl bg-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold">
                  <span aria-hidden="true">{category.icon ? `${category.icon} ` : ""}</span>
                  {category.name}
                </p>
                <p className="text-sm text-ink-soft">
                  {category.active ? "Active" : "Inactive"} · Order {category.display_order}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-bold"
                  onClick={() => void move(category, -1)}
                  disabled={Boolean(busyId) || index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-bold"
                  onClick={() => void move(category, 1)}
                  disabled={Boolean(busyId) || index === sorted.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-bold"
                  onClick={() => startEdit(category)}
                  disabled={Boolean(busyId)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-bold"
                  onClick={() => void toggleActive(category)}
                  disabled={busyId === category.id}
                >
                  {category.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-petal px-3 py-1.5 text-sm font-bold"
                  onClick={() => void onDelete(category)}
                  disabled={busyId === category.id}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
