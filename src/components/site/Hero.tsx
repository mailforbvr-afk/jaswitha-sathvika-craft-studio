import { BRAND, designedPublicText } from "@/lib/config";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { Category, Product } from "@/lib/supabase/types";
import { getTheme } from "@/lib/themes";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { DreamDecor } from "@/components/site/DreamDecor";
import { HeroVisual } from "@/components/site/HeroVisual";
import { SectionWave } from "@/components/site/SectionWave";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

type HeroProps = {
  settings: PublicSiteSettings;
  products: Product[];
  categories: Category[];
};

export function Hero({ settings, products, categories }: HeroProps) {
  const theme = getTheme(settings.theme);
  const title = designedPublicText(settings.main_title, BRAND.title);
  const titleLines = title.split("\n").map((line) => line.trim()).filter(Boolean);
  const headingLines = titleLines.length > 1 ? titleLines : BRAND.title.split("\n");
  const accentLine = headingLines[headingLines.length - 1];
  const leadLines = headingLines.slice(0, -1);

  return (
    <section id="home" className="hero-stage relative overflow-hidden">
      <DreamDecor decorations={theme.decorations} density="rich" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pb-4 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,28rem)] lg:gap-10 lg:pb-2 lg:pt-6">
        <div className="dream-reveal min-w-0 max-w-xl lg:pl-4">
          <p className="section-badge mb-4">{designedPublicText(settings.hero_badge, BRAND.heroBadge)}</p>
          <h1 className="font-display text-[2.2rem] leading-[1.1] sm:text-5xl lg:text-[3.45rem]">
            {leadLines.map((line) => (
              <span key={line} className="hero-title-lead block">
                {line}
              </span>
            ))}
            <span className="hero-title-accent block">{accentLine}</span>
          </h1>
          <p className="mt-4 max-w-md whitespace-pre-wrap text-base leading-7 text-ink-soft sm:text-lg">
            {designedPublicText(settings.hero_description, BRAND.supportingText)}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#creations"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-pink-deep px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-purple-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              {designedPublicText(settings.hero_primary_button, BRAND.heroPrimaryButton)}
            </a>
            <WhatsAppButton href={contactWhatsAppUrl(settings.studio_name)} variant="header" className="min-h-12">
              {designedPublicText(settings.hero_secondary_button, BRAND.heroSecondaryButton)}
            </WhatsAppButton>
          </div>
          <ul className="mt-7 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
            {BRAND.heroHighlights.map((item, index) => (
              <li key={item.title} className={`hero-sticker hero-sticker-${index + 1}`}>
                <p className="text-base leading-none" aria-hidden="true">
                  {item.icon}
                </p>
                <p className="mt-1 font-display text-[0.84rem] leading-tight text-purple-deep sm:text-[0.95rem]">{item.title}</p>
                <p className="text-[0.68rem] font-semibold text-ink-soft sm:text-xs">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual
          products={products}
          categories={categories}
          title={designedPublicText(settings.hero_visual_title, BRAND.heroVisualTitle)}
          caption={designedPublicText(settings.hero_visual_caption, BRAND.heroVisualCaption)}
          imageUrl={settings.hero_image_url}
          imageAlt={BRAND.heroImageAlt}
          decorations={theme.decorations}
        />
      </div>
      <SectionWave className="hero-wave" />
    </section>
  );
}
