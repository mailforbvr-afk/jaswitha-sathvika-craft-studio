import { BRAND } from "@/lib/config";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export function Footer() {
  return (
    <footer className="border-t border-petal/40 bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-pink-deep">{BRAND.names}</p>
          <p className="font-bold text-ink">{BRAND.studio}</p>
          <p className="mt-2 text-sm text-ink-soft">Made with little hands and a lot of love ❤️</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <WhatsAppButton href={contactWhatsAppUrl()} variant="soft">
            Chat on WhatsApp
          </WhatsAppButton>
          <p className="text-sm text-ink-soft/80">Instagram and more can be added when ready.</p>
        </div>
      </div>
    </footer>
  );
}
