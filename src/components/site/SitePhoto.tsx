"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

type SitePhotoProps = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  objectFit?: "cover" | "contain";
  fallback: ReactNode;
  onError?: () => void;
};

export function SitePhoto({
  src,
  alt,
  sizes,
  className = "",
  objectFit = "cover",
  fallback,
  onError,
}: SitePhotoProps) {
  const url = src?.trim() ?? "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) return <>{fallback}</>;

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      className={`${objectFit === "contain" ? "object-contain" : "object-cover object-center"} ${className}`}
      onError={() => {
        setFailed(true);
        onError?.();
      }}
    />
  );
}
