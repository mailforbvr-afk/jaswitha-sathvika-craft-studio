export function DreamDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="dream-float absolute left-[4%] top-[18%] text-2xl opacity-70 sm:text-3xl">🎀</span>
      <span className="dream-twinkle absolute right-[8%] top-[14%] text-xl sm:text-2xl">✨</span>
      <span className="dream-float absolute right-[6%] bottom-[18%] text-2xl opacity-70" style={{ animationDelay: "1.2s" }}>
        🦋
      </span>
      <span className="dream-twinkle absolute left-[10%] bottom-[16%] text-xl" style={{ animationDelay: "0.6s" }}>
        🌸
      </span>
      <span className="dream-float absolute left-[46%] top-[8%] text-lg opacity-60" style={{ animationDelay: "2s" }}>
        💕
      </span>
      <span className="dream-twinkle absolute right-[22%] top-[42%] hidden text-lg sm:inline" style={{ animationDelay: "1.6s" }}>
        ⭐
      </span>
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute -right-10 bottom-6 h-48 w-48 rounded-full bg-lilac/40 blur-2xl" />
    </div>
  );
}
