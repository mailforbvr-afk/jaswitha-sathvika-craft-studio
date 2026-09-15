export function Journey() {
  return (
    <section className="dream-reveal mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="journey-heading">
      <div className="rounded-[2rem] border border-dashed border-petal/70 bg-white/80 p-6 sm:p-8">
        <h2 id="journey-heading" className="font-display text-3xl text-ink">
          Every creation has a story ✨
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-ink-soft">
          This website is about creativity, learning and enjoying the process of making things. Some days it is
          a bracelet. Some days it is a tiny flower. The joy is in trying, practising and making something with
          their own hands.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {["Photographs coming soon", "Craft table moments later", "Optional studio photos later"].map(
            (label) => (
              <div
                key={label}
                className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-cream to-lilac/40 text-center text-sm font-bold text-ink-soft"
              >
                {label} 📷
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
