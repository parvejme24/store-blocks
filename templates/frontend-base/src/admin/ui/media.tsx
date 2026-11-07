"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { newId } from "../demo/schemas";
import type { MediaImage } from "../demo/dataset";
import { BUTTON } from "./primitives";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Reads an image file into a data URL. In production this becomes a signed direct
 * upload to object storage (see docs/adr/0003); the demo keeps it in this session.
 */
function readImage(file: File): Promise<MediaImage> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED.includes(file.type)) return reject(new Error("Use a PNG, JPG or WebP image."));
    if (file.size > MAX_BYTES) return reject(new Error("Images must be 2 MB or smaller."));
    const reader = new FileReader();
    reader.onload = () => resolve({ id: newId("img"), url: String(reader.result), alt: file.name.replace(/\.[^.]+$/, "") });
    reader.onerror = () => reject(new Error("The image could not be read. Try another file."));
    reader.readAsDataURL(file);
  });
}

function useFileDrop(onFiles: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false);
  return {
    dragging,
    handlers: {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        setDragging(true);
      },
      onDragLeave: () => setDragging(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
      }
    }
  };
}

/** One image, such as a logo or category picture. */
export function ImageUploader({
  label,
  value,
  onChange,
  aspect = "aspect-square",
  hint = "PNG, JPG or WebP, up to 2 MB."
}: {
  label: string;
  value: MediaImage | null;
  onChange: (image: MediaImage | null) => void;
  aspect?: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: File[]) {
    const file = files[0];
    if (!file) return;
    try {
      onChange(await readImage(file));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  const drop = useFileDrop(handle);

  return (
    <div className="space-y-2">
      <span className="flex items-baseline justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="font-normal text-muted-foreground/80">{hint}</span>
      </span>
      <div
        {...drop.handlers}
        className={`group relative overflow-hidden rounded-xl border border-dashed transition-colors ${
          drop.dragging ? "border-primary bg-primary/5" : "border-border bg-background/40"
        } ${value ? "border-solid" : ""}`}
      >
        {value ? (
          <div className={`relative ${aspect} w-full max-w-[14rem] overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.url} alt={value.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-background/90 to-transparent p-3 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <button type="button" onClick={() => input.current?.click()} className={`${BUTTON.secondary} h-8 px-3 text-xs`}>
                Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className={`${BUTTON.danger} h-8 px-3 text-xs`}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 px-6 py-8 text-center"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Drop an image or click to upload</span>
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-label={label}
          onChange={(e) => {
            void handle(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** A product gallery. The first image is the primary image shown in listings. */
export function GalleryUploader({ value, onChange, max = 6 }: { value: MediaImage[]; onChange: (images: MediaImage[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: File[]) {
    const room = max - value.length;
    if (room <= 0) return setError(`A product can have up to ${max} images.`);
    const settled = await Promise.allSettled(files.slice(0, room).map(readImage));
    const added = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = settled.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (added.length) onChange([...value, ...added]);
    setError(failed ? (failed.reason instanceof Error ? failed.reason.message : "Some images could not be added.") : null);
  }

  const drop = useFileDrop(handle);

  return (
    <div className="space-y-3">
      <div
        {...drop.handlers}
        className={`rounded-xl border border-dashed p-4 transition-colors ${drop.dragging ? "border-primary bg-primary/5" : "border-border bg-background/40"}`}
      >
        {value.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No images yet. Add up to {max} product photos.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {value.map((image, i) => (
              <li key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Primary</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-background/90 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  {i !== 0 && (
                    <button
                      type="button"
                      aria-label={`Make ${image.alt} the primary image`}
                      onClick={() => onChange([image, ...value.filter((x) => x.id !== image.id)])}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 hover:text-primary"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${image.alt}`}
                    onClick={() => onChange(value.filter((x) => x.id !== image.id))}
                    className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => input.current?.click()} disabled={value.length >= max} className={BUTTON.secondary}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Add images
          </button>
          <span className="text-xs text-muted-foreground">{value.length} of {max} · PNG, JPG or WebP, 2 MB each</span>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-label="Add product images"
          onChange={(e) => {
            void handle(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Demo: images stay in this browser session. Production uploads go straight to storage through signed URLs.</p>
    </div>
  );
}
