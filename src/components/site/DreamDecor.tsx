type DreamDecorProps = {
  decorations?: string[];
  density?: "soft" | "rich";
};

const DEFAULT_DECORATIONS = ["🎀", "✨", "🦋", "🌸", "💕", "⭐", "🌈", "🌿"];

export function DreamDecor({ decorations = DEFAULT_DECORATIONS, density = "soft" }: DreamDecorProps) {
  const items = decorations.length >= 6 ? decorations : DEFAULT_DECORATIONS;
  const rich = density === "rich";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-16 top-8 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--color-petal)_48%,white)] blur-3xl" />
      <div className="absolute -right-12 top-2 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-lilac)_42%,white)] blur-3xl" />
      <div className="absolute bottom-6 left-[28%] h-36 w-44 rounded-full bg-white/50 blur-3xl" />
      {rich ? (
        <>
          <div className="absolute right-[18%] top-[38%] h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--color-sun)_35%,transparent)] blur-2xl" />
          <div className="absolute left-[8%] bottom-[22%] h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-mint)_28%,transparent)] blur-2xl" />
        </>
      ) : null}

      <span className="dream-float absolute left-[4%] top-[14%] text-xl opacity-60 sm:text-2xl">{items[0]}</span>
      <span className="dream-twinkle absolute right-[6%] top-[10%] text-lg opacity-65 sm:text-xl">{items[1]}</span>
      <span className="dream-float absolute right-[5%] bottom-[18%] text-xl opacity-55" style={{ animationDelay: "1.2s" }}>
        {items[2]}
      </span>
      <span className="dream-twinkle absolute left-[8%] bottom-[12%] hidden text-lg opacity-60 sm:inline" style={{ animationDelay: "0.6s" }}>
        {items[3]}
      </span>
      <span className="dream-float absolute left-[48%] top-[6%] hidden text-base opacity-50 sm:inline" style={{ animationDelay: "2s" }}>
        {items[4]}
      </span>
      <span className="dream-twinkle absolute right-[22%] top-[42%] hidden text-base opacity-55 lg:inline" style={{ animationDelay: "1.6s" }}>
        {items[5]}
      </span>
      {rich ? (
        <>
          <span className="dream-float absolute left-[18%] top-[38%] hidden text-lg opacity-50 lg:inline" style={{ animationDelay: "0.9s" }}>
            {items[6] ?? "🌈"}
          </span>
          <span className="dream-twinkle absolute right-[38%] bottom-[10%] hidden text-base opacity-50 sm:inline" style={{ animationDelay: "2.2s" }}>
            {items[7] ?? "⭐"}
          </span>
          <span className="watercolor-dot left-[12%] top-[48%] hidden h-3 w-3 bg-petal/70 lg:block" />
          <span className="watercolor-dot right-[14%] top-[28%] hidden h-2.5 w-2.5 bg-lilac/80 lg:block" />
          <span className="watercolor-dot left-[40%] bottom-[16%] hidden h-2 w-2 bg-sun/80 sm:block" />
        </>
      ) : null}
    </div>
  );
}
