# ADR 0003: Pluggable Storage with Signed Direct Uploads

- **Status:** Accepted
- **Date:** 2026-10-18

## Context

Stores need product images, category and brand images, logos, favicons, and banners. Store owners have different preferences and budgets: some want a simple hosted service, some already use AWS, some want low egress cost, some self-host.

## Decision

- Storage is a setup choice with one `StorageAdapter` interface and three adapters: **Cloudinary**, **S3**, and **Local**.
- The **S3 adapter covers every S3-compatible service** (AWS S3, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, MinIO) through `S3_ENDPOINT`, instead of one adapter per vendor.
- Uploads go **directly from the browser to storage** using short-lived signed URLs issued only to admins after type and size checks.
- The database stores `{ key, provider, alt }`, never full URLs. URLs are built by `getPublicUrl`.
- Cloudinary images use Cloudinary transformations; S3 and local images use Next.js image optimization.
- UI icons come from `lucide-react` in code, not from storage.

## Alternatives Considered

| Option | Why not |
|---|---|
| Upload through Express (multer) | Uses server memory and bandwidth; serverless hosts limit request size. |
| Cloudinary only | Forces one vendor and its pricing on every store. |
| One adapter per S3-compatible vendor | Duplicate code for the same API. |
| Store full URLs in the database | Changing provider or CDN domain would require rewriting every record. |

## Consequences

- Exactly one storage adapter per project; only its SDK is installed.
- The CLI writes the storage host into `next.config.ts` image settings.
- Local storage does not work on hosts with ephemeral file systems (Vercel, Render, Railway); the CLI warns and `doctor` checks for it.
- Switching providers later needs a file migration script (planned after 1.0).
