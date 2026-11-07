"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ThemeThumbnail } from "@/components/store/ThemeThumbnail";
import type { TokenName } from "@/templates/types";

/** Plain data only. Passing the template object would send a function to the client. */
export type ThemeCardData = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  cliLayout: string;
  thumbnail?: string;
  tokens: Record<TokenName, string>;
};

/** Store-type card: 16:10 thumbnail, category, theme name, flag and a demo button. */
export function ThemeCard({ theme }: { theme: ThemeCardData }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
    >
      <ThemeThumbnail name={theme.name} category={theme.category} tokens={theme.tokens} src={theme.thumbnail} />

      <div className="flex flex-1 flex-col gap-3 p-2 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{theme.category}</p>
          <h3 className="mt-1 text-lg font-semibold">{theme.name}</h3>
          <p className="text-xs text-muted-foreground">{theme.tagline}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{theme.description}</p>
        <code className="w-fit rounded-md bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
          --layout {theme.cliLayout}
        </code>
        <Link
          href={`/themes/${theme.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View demo of ${theme.name}, opens in a new tab`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          View demo
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
