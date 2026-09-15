export function About() {
  return (
    <section
      id="about"
      className="dream-reveal mx-auto max-w-6xl px-4 py-12 sm:px-6"
      aria-labelledby="about-heading"
    >
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-card md:grid md:grid-cols-5">
        <div className="bg-gradient-to-br from-petal via-lilac to-cloud p-8 md:col-span-2">
          <p className="text-5xl" aria-hidden="true">
            💕🌸✨
          </p>
          <p className="mt-6 font-display text-2xl text-ink">Two sisters, one little studio.</p>
        </div>
        <div className="p-8 md:col-span-3">
          <h2 id="about-heading" className="font-display text-3xl text-ink sm:text-4xl">
            💕 Our Little Story
          </h2>
          <p className="mt-4 leading-7 text-ink-soft">
            Jaswitha & Sathvika love creating little things with their own hands. From colorful bracelets and
            flowers to keychains and magnets, every creation is made with imagination, patience and lots of love.
          </p>
          <p className="mt-4 leading-7 text-ink-soft">
            This little studio is a place for them to share their creativity with the world — handmade, playful,
            and never factory-made.
          </p>
        </div>
      </div>
    </section>
  );
}
