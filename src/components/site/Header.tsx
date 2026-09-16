"use client";

import { useEffect, useState } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { BrandMark } from "@/components/site/BrandMark";
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
  const [active, setActive] = useState("#home");
  const whatsappHref = contactWhatsAppUrl(settings.studio_name);

  useEffect(() => {
    function syncHash() {
      setActive(window.location.hash || "#home");
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="nav-shell mx-auto max-w-6xl rounded-[1.9rem] border border-[var(--color-card-border)] px-3 py-2.5 backdrop-blur-md sm:rounded-full sm:px-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <a href="#home" className="flex min-w-0 items-center justify-self-start">
            <BrandMark logoUrl={settings.logo_url} compact />
          </a>

          <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep ${
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--color-petal)_78%,white)] text-pink-deep"
                      : "text-ink-soft hover:bg-cream hover:text-pink-deep"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
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
          <div id="mobile-nav" className="mt-2 border-t border-[var(--color-card-border)] px-1 py-3 lg:hidden">
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
              <WhatsAppButton href={whatsappHref} variant="header" className="mt-2 min-h-12 w-full">
                {settings.contact_button_text}
              </WhatsAppButton>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
