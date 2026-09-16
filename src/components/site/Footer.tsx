import type { PublicSiteSettings } from "@/lib/site-settings";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type FooterProps = {
  settings: PublicSiteSettings;
};

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-card-border)] bg-[color-mix(in_srgb,var(--color-card)_88%,transparent)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="font-display text-lg text-pink-deep">{settings.studio_name}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{settings.footer_description}</p>
          <p className="mt-3 text-xs font-semibold text-ink-soft/80">{settings.footer_copyright}</p>
        </div>
        <div className="flex flex-col items-start gap-2.5 md:items-end">
          <WhatsAppButton href={contactWhatsAppUrl(settings.studio_name)} variant="soft" className="min-h-10 px-4 py-2 text-xs">
            {settings.contact_button_text}
          </WhatsAppButton>
          {settings.instagram_url ? (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-pink-deep hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              Instagram
            </a>
          ) : null}
          {settings.email ? (
            <a
              href={`mailto:${settings.email}`}
              className="break-all text-sm font-bold text-pink-deep hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              {settings.email}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
