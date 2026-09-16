type SectionWaveProps = {
  className?: string;
  flip?: boolean;
};

export function SectionWave({ className = "", flip = false }: SectionWaveProps) {
  return (
    <div className={`section-wave ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className={flip ? "rotate-180" : undefined}>
        <path
          fill="currentColor"
          d="M0,28 C180,64 360,8 540,36 C720,64 900,12 1080,40 C1260,68 1350,24 1440,44 L1440,72 L0,72 Z"
        />
      </svg>
    </div>
  );
}
