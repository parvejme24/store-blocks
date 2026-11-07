import Link from "next/link";
import { CloudUpload, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function StorageDocPage() {
  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Introduction
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Media Storage & Direct Uploads
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          StoreBlocks implements signed direct uploads so heavy image payloads never pass through your Node.js backend.
        </p>
      </div>

      {/* Direct Upload Diagram */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Direct Upload Workflow</h2>
        <div className="rounded-lg bg-code p-4 font-mono text-xs text-code-foreground border border-border space-y-2">
          <div>Browser/Admin UI ──(1) POST /api/storage/sign ────────▶ Express Backend</div>
          <div>                  ◀──(2) Signed URL + Storage Key ───  (Validates type & size)</div>
          <div>Browser/Admin UI ──(3) PUT / POST Direct Binary ────▶ Cloudinary / S3 / Local</div>
          <div>Browser/Admin UI ──(4) Save &#123; key, provider, alt &#125; ──▶ /api/products</div>
        </div>
      </section>

      {/* Adapters Reference */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div id="cloudinary" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">Cloudinary</h3>
          <p className="text-xs text-muted-foreground">
            Signed POST form uploads. Auto-resizing and modern format (WebP/AVIF) conversion via Cloudinary dynamic URL transformations.
          </p>
        </div>

        <div id="s3" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">AWS S3 & R2 / MinIO</h3>
          <p className="text-xs text-muted-foreground">
            Presigned PUT uploads. Works universally with AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, and Backblaze B2 by configuring <code>S3_ENDPOINT</code>.
          </p>
        </div>

        <div id="local" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">Local Disk</h3>
          <p className="text-xs text-muted-foreground">
            Stores files directly in the <code>uploads/</code> directory on the host server. Ideal for local offline development and single VPS setups.
          </p>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs/databases"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Databases Guide
        </Link>
        <Link
          href="/docs/payments"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Payments Guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

