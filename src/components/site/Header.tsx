"use client";

import { useState } from "react";
import { BRAND } from "@/lib/config";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#creations", label: "Crafts" },
  { href: "#categories", label: "Categories" },
  { href: "#about", label: "Our Story" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const whatsappHref = contactWhatsAppUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-petal/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <a href="#home" className="min-w-0">
          <p className="font-display text-[0.95rem] leading-tight text-pink-deep sm:text-lg">
            {BRAND.names}
          </p>
          <p className="text-[0.7rem] font-bold tracking-wide text-ink-soft sm:text-xs">
            {BRAND.studio}
          </p>
        </a>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-ink-soft hover:text-pink-deep"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton href={whatsappHref} variant="header" className="hidden px-4 py-2 text-xs sm:inline-flex">
            Chat on WhatsApp
          </WhatsAppButton>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-petal/80 bg-white text-ink lg:hidden"
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
        <div id="mobile-nav" className="border-t border-petal/40 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-3 py-2.5 text-base font-bold text-ink hover:bg-cream"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <WhatsAppButton href={whatsappHref} className="mt-2 w-full">
              Chat on WhatsApp
            </WhatsAppButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
