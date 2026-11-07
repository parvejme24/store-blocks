# Module Manifest (`module.json`)

Every module in `templates/modules/` has a `module.json`. The CLI reads it to decide what to copy, what to install, and which env variables to require. The schema lives in `packages/module-kit/src/manifest.schema.ts` and is validated in CI.

## Full Example

```json
{
  "$schema": "../../../packages/module-kit/manifest.schema.json",
  "name": "reviews",
  "label": "Product reviews (admin approval)",
  "description": "Customer ratings and reviews, visible after admin approval.",
  "type": "feature",
  "dependsOn": ["auth", "products"],
  "uses": [],
  "env": [],
  "dependencies": {},
  "devDependencies": {},
  "variants": {
    "db": {
      "mongodb": {
        "path": "backend/db/mongodb",
        "dependencies": { "mongoose": "^8" }
      },
      "postgresql": {
        "path": "backend/db/postgresql",
        "dependencies": { "drizzle-orm": "~0.x", "pg": "^8" },
        "devDependencies": { "drizzle-kit": "~0.x" }
      }
    }
  },
  "backend": {
    "basePath": "/api/reviews"
  },
  "frontend": {
    "apiSlice": "reviewsApi",
    "adminMenu": { "label": "Reviews", "icon": "MessageSquare", "href": "/admin/reviews" },
    "storefrontComponents": ["ProductReviews", "ReviewForm"]
  },
  "since": "0.7.0"
}
```

(`~0.x` is a placeholder in these docs; real manifests pin the tested minor, e.g. `~0.36`.)

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Unique, kebab-case. Used as folder name and in `store.config.json`. |
| `label` | string | yes | Shown in CLI prompts. |
| `description` | string | yes | One sentence, shown as a prompt hint. |
| `type` | `core` \| `feature` \| `payment` \| `storage` | yes | `core` is always installed. |
| `dependsOn` | string[] | no | Modules added automatically when this one is selected. |
| `uses` | string[] | no | Categories this module needs one of (e.g. `"storage"`). |
| `env` | string[] | no | Env variables this module requires (UPPER_SNAKE_CASE). |
| `optionalEnv` | string[] | no | Env variables with defaults; listed but commented in `.env.example`. |
| `dependencies` | record | no | npm packages needed regardless of variant. |
| `devDependencies` | record | no | Dev packages needed regardless of variant. |
| `variants` | object | no | Per-choice code and packages (see below). |
| `backend.basePath` | string | for modules with routes | Mount path for the router. |
| `frontend.apiSlice` | string | no | Name of the RTK Query slice file. |
| `frontend.adminMenu` | object | no | Admin navigation entry. |
| `frontend.storefrontComponents` | string[] | no | Components exported for layouts to place. |
| `frontend.imageHosts` | string[] | no | Storage adapters only: hosts added to `next.config.ts`. |
| `since` | semver | yes | First StoreBlocks version that shipped this module. |

## Variants

`variants` is keyed by **setup choice**, then by **option**:

```json
"variants": {
  "db": {
    "mongodb":    { "path": "...", "dependencies": {}, "devDependencies": {}, "env": [] },
    "postgresql": { "path": "...", "dependencies": {}, "devDependencies": {}, "env": [] }
  }
}
```

For each choice, the CLI:

1. Copies the files in `path` up into the module folder.
2. Merges that variant's `dependencies`, `devDependencies`, and `env` with the top-level ones.
3. Drops every other variant.

Rules:

- A module that stores data **must** define both `db.mongodb` and `db.postgresql`.
- Variant `path` folders may only contain files for that variant.
- Database connection env (`MONGODB_URI`, `DATABASE_URL`) comes from `backend-base`, not from modules.

## Adapter Modules

Storage and payment adapters are modules whose `type` is `storage` or `payment`. They need `variants.db` only if they persist data of their own (payment adapters do, for payment records).

```json
{
  "name": "storage-cloudinary",
  "label": "Cloudinary",
  "description": "Hosted images with on-the-fly resizing and format conversion.",
  "type": "storage",
  "dependencies": { "cloudinary": "^2" },
  "env": ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
  "frontend": { "imageHosts": ["res.cloudinary.com"] },
  "since": "0.3.0"
}
```

For S3, the image host comes from `S3_PUBLIC_URL` at build time.

## Version Ranges

- Major-pinned caret ranges: `"express": "^5"`.
- Pre-1.0 packages use tilde ranges pinned to the tested minor.
- Never `*`, `latest`, or an exact version unless an ADR explains why.

## Validation

`pnpm validate:manifests` checks:

- The manifest matches the Zod schema.
- `name` matches the folder name.
- Every `dependsOn` entry exists.
- Every `uses` category has at least one adapter.
- Data modules define both database variants, and both `path` folders exist.
- No two modules declare conflicting ranges for the same package.
- Env variable names are UPPER_SNAKE_CASE.
