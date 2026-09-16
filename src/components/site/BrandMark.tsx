"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/config";

type BrandMarkProps = {
  logoUrl?: string | null;
  compact?: boolean;
};

export function BrandMark({ logoUrl, compact = false }: BrandMarkProps) {
  const logo = logoUrl?.trim() ?? "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);

  if (logo && !failed) {
    return (
      <span
        className={`relative block ${
          compact
            ? "h-[3.9rem] w-[13.4rem] sm:h-[5rem] sm:w-[17.6rem]"
            : "h-14 w-52"
        }`}
      >
        <Image
          src={logo}
          alt={BRAND.logoAlt}
          fill
          sizes="290px"
          className="object-contain object-left"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="min-w-0">
      <span className="block font-display text-[1.35rem] leading-none text-pink-deep sm:text-2xl">
        {BRAND.studioName}
      </span>
      <span className="mt-0.5 block truncate text-[0.68rem] font-bold tracking-wide text-ink-soft">
        {BRAND.names}
      </span>
    </span>
  );
}
