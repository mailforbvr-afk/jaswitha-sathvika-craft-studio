"use client";

import { useState } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#creations", label: "Crafts" },
  { href: "#categories", label: "Categories" },
  { href: "#about", label: "Our Story" },
  { href: "#contact", label: "Contact" },
];

export function Header({ settings }: { settings: PublicSiteSettings }) {
  const [open, setOpen] = useState(false);
  const whatsappHref = contactWhatsAppUrl(settings.studio_name);

  return (
    <header className="header-bar sticky top-0 z-40 border-b border-[var(--color-card-border)] backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.1fr)]">
        <a href="#home" className="min-w-0 max-w-[70%] justify-self-start lg:max-w-none">
          <p className="font-display text-[0.95rem] leading-tight text-pink-deep sm:text-[1.05rem]">
            {settings.header_studio_name}
          </p>
          {settings.header_tagline ? (
            <p className="truncate text-[0.68rem] font-bold text-ink-soft sm:text-xs">
              {settings.header_tagline}
            </p>
          ) : null}
        </a>

        <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft hover:bg-cream hover:text-pink-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <WhatsAppButton href={whatsappHref} variant="header" className="hidden min-h-10 px-4 py-2 text-xs sm:inline-flex">
            {settings.contact_button_text}
          </WhatsAppButton>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] text-ink lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="text-lg">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-3 py-2.5 text-base font-bold text-ink hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <WhatsAppButton href={whatsappHref} className="mt-2 min-h-12 w-full">
              {settings.contact_button_text}
            </WhatsAppButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
