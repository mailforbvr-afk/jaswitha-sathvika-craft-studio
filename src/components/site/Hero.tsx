import { BRAND } from "@/lib/config";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { DreamDecor } from "@/components/site/DreamDecor";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-petal via-[#f4e8fb] to-cloud"
    >
      <DreamDecor />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="dream-reveal max-w-xl">
          <p className="mb-3 inline-flex rounded-full bg-white/80 px-4 py-1 text-sm font-bold text-pink-deep shadow-soft">
            Handmade with little hands
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            {BRAND.names}
          </h1>
          <p className="mt-2 font-display text-2xl text-pink-deep sm:text-3xl">{BRAND.studio}</p>
          <p className="mt-4 text-base font-semibold text-ink-soft sm:text-lg">{BRAND.tagline}</p>
          <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft sm:text-lg">
            {BRAND.supportingText}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#creations"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-pink-deep px-6 py-3 text-sm font-bold text-white hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-deep"
            >
              ✨ Explore Our Crafts
            </a>
            <WhatsAppButton href={contactWhatsAppUrl()} variant="soft">
              💬 Chat on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
        <div className="dream-reveal relative mx-auto w-full max-w-md" style={{ animationDelay: "0.12s" }}>
          <div className="rounded-[2.2rem] border border-white/80 bg-white/70 p-5 shadow-soft backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-3">
              {["🎀", "🌸", "🦋", "✨"].map((item) => (
                <div
                  key={item}
                  className="flex aspect-square items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-cream to-lilac/50 text-4xl"
                >
                  <span aria-hidden="true">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center font-display text-lg text-ink">A little world of handmade joy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
