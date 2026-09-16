"use client";

import { useRef } from "react";
import { filenameFromSiteImageUrl } from "@/lib/site-images";

type SiteImageFieldProps = {
  label: string;
  hint?: string;
  imageUrl: string | null;
  alt: string;
  busy: boolean;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
};

export function SiteImageField({
  label,
  hint,
  imageUrl,
  alt,
  busy,
  onSelectFile,
  onRemove,
}: SiteImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = imageUrl?.trim() ?? "";
  const filename = filenameFromSiteImageUrl(photo);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold">{label}</p>
        {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-lilac/40 bg-cream">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={alt} className="mx-auto max-h-56 w-full object-contain" />
        ) : (
          <div className="flex h-36 items-center justify-center px-4 text-center text-sm font-semibold text-ink-soft">
            No photo yet
          </div>
        )}
      </div>

      {filename ? <p className="truncate text-xs text-ink-soft">{filename}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelectFile(file);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-purple-deep px-4 py-2 text-sm font-bold text-white hover:bg-ink disabled:opacity-60"
        >
          {busy ? "Uploading…" : photo ? "Replace Photo" : "Upload Photo"}
        </button>
        {photo ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-cream disabled:opacity-60"
          >
            Remove Photo
          </button>
        ) : null}
      </div>
    </div>
  );
}
