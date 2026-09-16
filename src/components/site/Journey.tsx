import { SitePhoto } from "@/components/site/SitePhoto";
import type { PublicSiteSettings } from "@/lib/site-settings";

type JourneyProps = {
  settings: PublicSiteSettings;
};

const STORY_CARD_MOTIFS = ["❤️", "✨", "🌸"];
const STORY_CARD_BACKGROUNDS = [
  "from-petal/70 to-lilac/50",
  "from-lilac/70 to-cloud/50",
  "from-mint/70 to-sun/40",
];

export function Journey({ settings }: JourneyProps) {
  const cards = [
    {
      title: settings.story_card_1_title,
      text: settings.story_card_1_text,
      imageUrl: settings.story_card_1_image_url,
    },
    {
      title: settings.story_card_2_title,
      text: settings.story_card_2_text,
      imageUrl: settings.story_card_2_image_url,
    },
    {
      title: settings.story_card_3_title,
      text: settings.story_card_3_text,
      imageUrl: settings.story_card_3_image_url,
    },
  ];

  return (
    <section className="dream-reveal mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="journey-heading">
      <div className="text-center">
        <h2 id="journey-heading" className="section-title mt-0">
          {settings.story_section_title}
        </h2>
        <p className="section-copy max-w-3xl whitespace-pre-wrap">{settings.story_section_text}</p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {cards.map((card, index) => (
          <article key={`${card.title}-${index}`} className="dream-card overflow-hidden p-2.5">
            <div className={`relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${STORY_CARD_BACKGROUNDS[index]}`}>
              <SitePhoto
                src={card.imageUrl}
                alt={card.title}
                sizes="(max-width: 640px) 100vw, 33vw"
                objectFit="cover"
                fallback={
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <span className="text-4xl" aria-hidden="true">
                      {STORY_CARD_MOTIFS[index]}
                    </span>
                  </div>
                }
              />
              <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow-soft" aria-hidden="true">
                {STORY_CARD_MOTIFS[index]}
              </span>
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-display text-xl leading-snug text-ink">{card.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
