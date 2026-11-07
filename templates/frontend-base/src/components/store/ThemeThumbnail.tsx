"use client";

import { useState } from "react";
import type { TokenName } from "@/templates/types";

type ThemeThumbnailProps = {
  name: string;
  category: string;
  tokens: Record<TokenName, string>;
  /** Optional preview image. Recommended size: 1600 x 1000 px (16:10), WebP or JPG. */
  src?: string;
};

/**
 * Theme preview frame with a fixed 16:10 ratio, so every card is the same size.
 * With an image: a shimmer skeleton shows until it loads.
 * Without one (or if it fails to load): a colour-token preview labelled with the category name.
 */
export function ThemeThumbnail({ name, category, tokens, src }: ThemeThumbnailProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const showImage = Boolean(src) && status !== "error";

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border"
      style={{ background: `hsl(${tokens.background})` }}
    >
      {showImage && status === "loading" && (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-muted">
          <div className="animate-shimmer absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        </div>
      )}

      {showImage && (
        <img
          src={src}
          alt={`${name} store preview`}
          width={1600}
          height={1000}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {!showImage && (
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex h-[60%] items-end gap-2">
            <span className="h-full w-1/4 rounded-md" style={{ background: `hsl(${tokens.card})` }} />
            <span className="h-[85%] w-1/4 rounded-md" style={{ background: `hsl(${tokens.primary})` }} />
            <span className="h-[45%] w-1/4 rounded-md" style={{ background: `hsl(${tokens.accent})` }} />
            <span className="h-[70%] w-1/4 rounded-md" style={{ background: `hsl(${tokens.muted})` }} />
          </div>
          <p
            className="self-start rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide"
            style={{ background: `hsl(${tokens.card})`, color: `hsl(${tokens.foreground})` }}
          >
            {category}
          </p>
        </div>
      )}
    </div>
  );
}
