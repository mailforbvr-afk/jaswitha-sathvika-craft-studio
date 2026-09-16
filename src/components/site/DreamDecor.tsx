type DreamDecorProps = {
  decorations?: string[];
};

const DEFAULT_DECORATIONS = ["🎀", "✨", "🦋", "🌸", "💕", "⭐"];

export function DreamDecor({ decorations = DEFAULT_DECORATIONS }: DreamDecorProps) {
  const items = decorations.length >= 6 ? decorations : DEFAULT_DECORATIONS;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="dream-float absolute left-[5%] top-[16%] text-xl opacity-55 sm:text-2xl">
        {items[0]}
      </span>
      <span className="dream-twinkle absolute right-[7%] top-[12%] text-lg opacity-60 sm:text-xl">{items[1]}</span>
      <span className="dream-float absolute right-[6%] bottom-[16%] text-xl opacity-50" style={{ animationDelay: "1.2s" }}>
        {items[2]}
      </span>
      <span className="dream-twinkle absolute left-[9%] bottom-[14%] hidden text-lg opacity-55 sm:inline" style={{ animationDelay: "0.6s" }}>
        {items[3]}
      </span>
      <span className="dream-float absolute left-[46%] top-[7%] hidden text-base opacity-45 sm:inline" style={{ animationDelay: "2s" }}>
        {items[4]}
      </span>
      <span className="dream-twinkle absolute right-[24%] top-[44%] hidden text-base opacity-50 lg:inline" style={{ animationDelay: "1.6s" }}>
        {items[5]}
      </span>
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute -right-10 bottom-6 h-48 w-48 rounded-full bg-[var(--color-lilac)]/35 blur-2xl" />
    </div>
  );
}
