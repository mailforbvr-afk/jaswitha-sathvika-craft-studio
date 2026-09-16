import type { PublicSiteSettings } from "@/lib/site-settings";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type ContactProps = {
  settings: PublicSiteSettings;
};

export function Contact({ settings }: ContactProps) {
  return (
    <section
      id="contact"
      className="dream-reveal mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="contact-heading"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-petal via-lilac to-mint px-6 py-14 text-center shadow-card sm:px-10">
        <span className="pointer-events-none absolute left-6 top-6 text-xl opacity-70" aria-hidden="true">
          💌
        </span>
        <span className="pointer-events-none absolute right-8 top-8 text-lg opacity-70" aria-hidden="true">
          ✨
        </span>
        <span className="pointer-events-none absolute bottom-6 left-10 text-lg opacity-70" aria-hidden="true">
          🌸
        </span>
        <p className="section-kicker">{settings.contact_eyebrow}</p>
        <h2 id="contact-heading" className="section-title">
          {settings.contact_heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl whitespace-pre-wrap text-base leading-7 text-ink-soft sm:text-lg">
          {settings.contact_message}
        </p>
        <div className="mt-8 flex justify-center">
          <WhatsAppButton
            href={contactWhatsAppUrl(settings.studio_name)}
            className="min-h-12 px-8 py-3.5 text-base"
          >
            {settings.contact_button_text}
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}
