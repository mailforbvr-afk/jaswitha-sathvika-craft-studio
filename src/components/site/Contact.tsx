import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export function Contact() {
  return (
    <section
      id="contact"
      className="dream-reveal mx-auto max-w-6xl px-4 py-12 sm:px-6"
      aria-labelledby="contact-heading"
    >
      <div className="rounded-[2rem] bg-gradient-to-br from-petal via-lilac to-mint px-6 py-12 text-center shadow-soft sm:px-10">
        <h2 id="contact-heading" className="font-display text-3xl text-ink sm:text-4xl">
          💬 Like something?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
          Send us a message on WhatsApp and ask about availability. A parent or guardian will reply.
        </p>
        <div className="mt-8 flex justify-center">
          <WhatsAppButton href={contactWhatsAppUrl()} className="min-h-12 px-8 py-3.5 text-base">
            Chat on WhatsApp 💚
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}
