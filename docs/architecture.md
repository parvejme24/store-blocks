# Architecture

This document explains how StoreBlocks is built: how the generator works, how a generated project is structured, and how modules, variants, and adapters fit together.

## Two Codebases in One Repo

| | Generator (this repo) | Generated project (user's store) |
|---|---|---|
| Who runs it | The person setting up a store, once | The store, in production |
| Lives in | `packages/cli`, `packages/module-kit` | Created from `templates/` |
| Contains | Prompts, resolution, copying, installing | Backend, frontend, shared code |

Code in `templates/` is never executed in this repo except by tests that first generate a project.

## Repository Layout

```
storeblocks/
├── packages/
│   ├── cli/                    create-storeblocks (published to npm)
│   └── module-kit/             manifest schema, contract types, test suites
├── templates/
│   ├── backend-base/           Express shell; db/{mongodb,postgresql} bases
│   ├── frontend-base/          Next.js shell; Redux store; RTK Query baseApi
│   ├── shared-base/            common Zod schemas and types
│   ├── modules/                one folder per module
│   ├── themes/                 design tokens
│   └── layouts/                product-type storefront layouts
└── docs/
```

## Generation Pipeline

```
1. Prompt        features, db, storage, payments, layout, theme, package manager
2. Resolve       add dependsOn/uses modules; reject invalid combinations
3. Plan          for each module, pick the variant folder for each choice
4. Copy          base templates + db base + selected modules + chosen variants
5. Configure     write store.config.json, .env.example, next.config.ts image hosts
6. Merge deps    collect dependencies from modules and chosen variants
7. Migrate       PostgreSQL only: run drizzle-kit generate for the initial migration
8. Install       per the Dependency Policy (major-pinned, 14-day release delay)
9. Git           init and first commit
10. Report       next steps tailored to the choices
```

Steps 2 and 3 are pure functions over manifests and answers, so they are unit-tested without touching the file system.

### Resolution rules

- `dependsOn` modules are added automatically, recursively.
- `uses: ["storage"]` requires exactly one storage adapter to be selected.
- At least one payment adapter is required when `orders` is selected.
- A module missing a variant for the chosen database is an error (CI prevents this from shipping).

## Generated Project Layout

```
my-shop/
├── backend/
│   └── src/
│       ├── app.ts              loads modules from store.config.json
│       ├── server.ts
│       ├── config/env.ts       Zod-validated env
│       ├── db/                 connection + UnitOfWork for the chosen database
│       └── modules/
│           ├── products/
│           ├── storage/        core + the one chosen adapter
│           └── payments/       core + the chosen gateways
├── frontend/
│   └── src/
│       ├── app/                storefront routes + (admin)/admin routes
│       ├── store/              makeStore(), baseApi
│       └── modules/            per-module slices, components, pages
├── shared/                     Zod schemas and types
├── store.config.json
└── .env.example
```

## Backend Module Anatomy

```
modules/products/
├── products.routes.ts          Express router, validation middleware
├── products.controller.ts      HTTP in/out only
├── products.service.ts         business rules; depends on the repository interface
├── products.repository.ts      interface (same for both databases)
├── products.repository.impl.ts the chosen implementation (copied from a variant)
├── products.model.ts           MongoDB only: Mongoose schema
├── products.schema.ts          PostgreSQL only: Drizzle table
└── index.ts                    exports { basePath, router, seed? }
```

Layering:

```
route → controller → service → repository interface → Mongoose | Drizzle
```

- Controllers know HTTP. Services know business rules. Repositories know the database.
- Services receive shared types and return shared types.
- Cross-module calls go through the other module's **service**, never its repository.

## Dynamic Module Loading

```ts
// backend/src/app.ts
import config from "../../store.config.json";

for (const name of config.modules) {
  const mod = await import(`./modules/${name}/index.js`);
  if (mod.router) app.use(mod.basePath, mod.router);
}
```

Adding or removing a module needs no change to `app.ts`.

## Variants

A module can vary by any setup choice. Today only the database creates variants inside feature modules:

```
templates/modules/products/backend/db/
├── mongodb/       products.model.ts, products.repository.impl.ts
└── postgresql/    products.schema.ts, products.repository.impl.ts
```

The CLI copies the chosen variant's files up into the module folder and drops the `db/` folder. The generated project contains only one implementation.

## Adapters

Storage and payments are **choices of implementation** behind one interface:

| Category | Interface | Implementations | Selection |
|---|---|---|---|
| Storage | `StorageAdapter` | cloudinary, s3, local | exactly one |
| Payments | `PaymentAdapter` | cod, sslcommerz, stripe | one or more |

Adapters live in `modules/storage/<name>` and `modules/payments/<name>`. The core folder exposes a registry built from `store.config.json`.

## Data Flow Examples

### Image upload

```
Admin UI ──(1) request upload URL──▶ backend /api/storage/sign
          ◀─(2) signed URL + key────  (admin check, type and size limits)
Admin UI ──(3) PUT file───────────▶ Cloudinary / S3 / local endpoint
Admin UI ──(4) save { key, alt }──▶ backend /api/products/:id
```

### Checkout

```
Cart (Redux) → POST /api/orders
  UnitOfWork.run:
    validate prices server-side
    decrement stock
    apply coupon
    create order (pending)
  PaymentAdapter.initiate(order) → redirect URL or COD pending
Gateway → webhook → PaymentAdapter.handleWebhook → order confirmed (idempotent)
```

## Frontend Architecture

- **Server Components** fetch directly for SEO pages: home, listings, product detail, categories.
- **RTK Query** handles cart, checkout, account, and admin. Each module adds endpoints with `baseApi.injectEndpoints`, so unselected modules add nothing.
- **Redux store** is created per request with `makeStore()` inside a client Provider.
- **Cart** lives in a Redux slice persisted to localStorage and merged into the server cart on login.
- **Themes** are CSS variables; shadcn/ui components read them.
- **Admin** lives in the same Next.js app under `/admin`.

## Configuration Sources

| Source | Holds | Changed by |
|---|---|---|
| `store.config.json` | Selected modules, db, storage, payments, layout, theme | CLI (at generation) |
| `.env` | Secrets and connection strings | Store owner / deployer |
| Settings in the database | Store name, logo, contact, currency, shipping rates, active theme | Admin dashboard |

## Testing Strategy

| Level | What | Where |
|---|---|---|
| Unit | Resolution, planning, pure services | `packages/*`, module services |
| Contract | Every repository, storage adapter, payment adapter | `module-kit` suites, run per implementation |
| Integration | Endpoints with a real database | Both MongoDB and PostgreSQL in CI |
| Generation | Generate combinations, install, build, test | CI matrix |
| E2E | Storefront and admin flows | Playwright on generated projects |
