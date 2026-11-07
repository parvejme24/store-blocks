"use client";

import { Globe2, Sparkles } from "lucide-react";
import { formatKeywords, parseKeywords } from "../demo/schemas";
import type { Seo } from "../demo/dataset";
import { Field, INPUT, TEXTAREA, Toggle } from "./primitives";

export type SeoValues = { metaTitle: string; metaDescription: string; keywords: string; noindex: boolean };

export function seoToValues(seo: Seo): SeoValues {
  return { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, keywords: formatKeywords(seo.keywords), noindex: seo.noindex };
}

export function valuesToSeo(values: SeoValues): Seo {
  return {
    metaTitle: values.metaTitle.trim(),
    metaDescription: values.metaDescription.trim(),
    keywords: parseKeywords(values.keywords),
    noindex: values.noindex
  };
}

/** Search engine fields with live length guidance and a result preview. */
export function SeoFields({
  values,
  onChange,
  name,
  slug,
  path,
  storeName,
  errors
}: {
  values: SeoValues;
  onChange: (patch: Partial<SeoValues>) => void;
  /** Used to suggest a title and description when the fields are empty. */
  name: string;
  slug: string;
  /** Path shown in the preview, e.g. "products" or "category". */
  path: string;
  storeName: string;
  errors: Partial<Record<keyof SeoValues, string>>;
}) {
  const title = values.metaTitle || (name ? `${name} | ${storeName}` : storeName);
  const description = values.metaDescription || "Add a meta description to describe this page in search results.";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Search engine listing
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              metaTitle: name ? `${name} | ${storeName}`.slice(0, 60) : values.metaTitle,
              metaDescription: name ? `Shop ${name} at ${storeName}. Quality products and fast delivery.` : values.metaDescription
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Suggest from name
        </button>
      </div>

      <Field label="Meta title" error={errors.metaTitle} hint={`${values.metaTitle.length}/70 · aim for 50–60`}>
        <input
          value={values.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          maxLength={120}
          className={INPUT}
          aria-invalid={!!errors.metaTitle}
        />
      </Field>

      <Field label="Meta description" error={errors.metaDescription} hint={`${values.metaDescription.length}/160 · aim for 120–160`}>
        <textarea
          value={values.metaDescription}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          rows={3}
          maxLength={240}
          className={TEXTAREA}
          aria-invalid={!!errors.metaDescription}
        />
      </Field>

      <Field label="Keywords" hint="Comma separated">
        <input value={values.keywords} onChange={(e) => onChange({ keywords: e.target.value })} placeholder="cotton shirt, office wear" className={INPUT} />
      </Field>

      <Toggle
        checked={values.noindex}
        onChange={(noindex) => onChange({ noindex })}
        label="Hide from search engines"
        description="Adds a noindex tag, so the page does not appear in Google results."
      />

      {/* Result preview, styled after a typical search listing */}
      <div className="space-y-1.5 rounded-xl border border-border/80 bg-background/60 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
        <p className="truncate text-xs text-muted-foreground">
          {storeName.toLowerCase().replace(/\s+/g, "")}.example › {path}{slug ? `/${slug}` : ""}
        </p>
        <p className="truncate text-base font-medium text-primary">{title}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
