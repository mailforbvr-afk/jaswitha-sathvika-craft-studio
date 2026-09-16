import { BRAND } from "@/lib/config";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Category, Product } from "@/lib/supabase/types";
import { getTheme } from "@/lib/themes";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { DreamDecor } from "@/components/site/DreamDecor";
import { HeroVisual } from "@/components/site/HeroVisual";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type HeroProps = {
  settings: PublicSiteSettings;
  products: Product[];
  categories: Category[];
};

export function Hero({ settings, products, categories }: HeroProps) {
  const theme = getTheme(settings.theme);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-petal via-lilac to-cloud"
    >
      <DreamDecor decorations={theme.decorations} />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-20">
        <div className="dream-reveal min-w-0 max-w-xl">
          <p className="mb-4 inline-flex rounded-full bg-white/85 px-4 py-1.5 text-sm font-bold text-pink-deep shadow-soft">
            {settings.hero_badge}
          </p>
          <p className="text-sm font-bold text-ink-soft">{settings.studio_name}</p>
          <h1 className="mt-2 font-display text-[2.15rem] leading-[1.12] text-ink sm:text-5xl lg:text-[3.35rem]">
            {settings.main_title}
          </h1>
          <p className="mt-4 text-base font-semibold leading-7 text-ink-soft sm:text-lg">{settings.tagline}</p>
          <p className="mt-4 max-w-lg whitespace-pre-wrap text-base leading-7 text-ink-soft sm:text-[1.05rem]">
            {settings.hero_description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#creations"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-pink-deep px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              {settings.hero_primary_button}
            </a>
            <WhatsAppButton href={contactWhatsAppUrl(settings.studio_name)} variant="soft" className="min-h-12">
              {settings.hero_secondary_button}
            </WhatsAppButton>
          </div>
        </div>
        <HeroVisual
          products={products}
          categories={categories}
          title={settings.hero_visual_title}
          caption={settings.hero_visual_caption}
          imageUrl={settings.hero_image_url}
          imageAlt={BRAND.heroImageAlt}
          decorations={theme.decorations}
        />
      </div>
    </section>
  );
}
