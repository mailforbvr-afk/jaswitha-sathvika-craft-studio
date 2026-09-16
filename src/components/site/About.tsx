import type { PublicSiteSettings } from "@/lib/site-settings";

type AboutProps = {
  settings: PublicSiteSettings;
  decorations?: string[];
};

export function About({ settings, decorations }: AboutProps) {
  const motifs = decorations && decorations.length > 0 ? decorations.slice(0, 4) : ["💕", "🌸", "✨", "🎀"];

  return (
    <section className="dream-reveal mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="about-heading">
      <div className="relative overflow-hidden rounded-[2.2rem] bg-[var(--color-card)] shadow-card md:grid md:grid-cols-5">
        <span className="pointer-events-none absolute right-6 top-5 text-xl opacity-70" aria-hidden="true">
          {motifs[1]}
        </span>
        <div className="relative bg-gradient-to-br from-petal via-lilac to-cloud p-8 md:col-span-2 md:p-10">
          <p className="section-badge bg-white/80">{settings.about_eyebrow}</p>
          <p className="mt-8 font-display text-2xl leading-snug text-ink sm:text-3xl">{settings.about_highlight}</p>
          <div className="mt-6 flex gap-2 text-2xl" aria-hidden="true">
            {motifs.map((motif, index) => (
              <span key={`${motif}-${index}`}>{motif}</span>
            ))}
          </div>
        </div>
        <div className="p-8 md:col-span-3 md:p-10">
          <h2 id="about-heading" className="section-title mt-0">
            {settings.about_title}
          </h2>
          <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-ink-soft">{settings.about_text}</p>
        </div>
      </div>
    </section>
  );
}
