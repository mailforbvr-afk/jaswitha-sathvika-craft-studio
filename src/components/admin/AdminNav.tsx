"use client";

import Link from "next/link";
import { BRAND } from "@/lib/config";

type AdminNavProps = {
  current: "products" | "settings";
  onSignOut: () => void;
};

const NAV_ITEMS = [
  { href: "/admin", id: "products" as const, label: "Products" },
  { href: "/admin/settings", id: "settings" as const, label: "Site Settings" },
];

export function AdminNav({ current, onSignOut }: AdminNavProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-purple-deep">{BRAND.names}</p>
        <h1 className="font-display text-3xl text-ink">Little Craft Studio Admin</h1>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Admin">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              current === item.id ? "bg-purple-deep text-white" : "bg-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm font-bold">
          View website
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold"
        >
          Sign out
        </button>
      </nav>
    </div>
  );
}
