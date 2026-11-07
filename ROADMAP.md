# StoreBlocks Roadmap

> Scaffold a production-ready, full-stack e-commerce store in minutes. Choose your features, database, storage, and payment gateways. Add your `.env` and deploy. No code changes required.

```bash
npx create-storeblocks my-shop
```

This document describes where StoreBlocks is going, in what order, and how you can help. It is a living document: phases may shift as we learn from users and contributors. Have an idea? Open a **Roadmap proposal** issue.

---

## Table of Contents

- [Vision](#vision)
- [Guiding Principles](#guiding-principles)
- [Non-Goals](#non-goals)
- [Setup Choices](#setup-choices)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Tech Stack](#tech-stack)
- [Status Legend](#status-legend)
- [Phase 0 — Foundation](#phase-0--foundation)
- [Phase 1 — Modular Backend Core (v0.1)](#phase-1--modular-backend-core-v01)
- [Phase 2 — CLI MVP (v0.2)](#phase-2--cli-mvp-v02)
- [Phase 3 — Media Storage (v0.3)](#phase-3--media-storage-v03)
- [Phase 4 — Cart, Checkout and Payments (v0.4)](#phase-4--cart-checkout-and-payments-v04)
- [Phase 5 — PostgreSQL + Drizzle (v0.5)](#phase-5--postgresql--drizzle-v05)
- [Phase 6 — Storefront and Admin Dashboard (v0.6)](#phase-6--storefront-and-admin-dashboard-v06)
- [Phase 7 — Feature Modules (v0.7)](#phase-7--feature-modules-v07)
- [Phase 8 — Themes and Product Types (v0.8)](#phase-8--themes-and-product-types-v08)
- [Phase 9 — Zero-Code Setup and Deployment (v0.9)](#phase-9--zero-code-setup-and-deployment-v09)
- [Phase 10 — Open-Source Readiness (v0.10)](#phase-10--open-source-readiness-v010)
- [Phase 11 — Public Launch (v1.0)](#phase-11--public-launch-v10)
- [Phase 12 — Beyond 1.0](#phase-12--beyond-10)
- [Module Catalog](#module-catalog)
- [Dependency Policy](#dependency-policy)
- [Security Commitments](#security-commitments)
- [Success Metrics](#success-metrics)
- [Risks and Mitigations](#risks-and-mitigations)
- [How to Contribute to the Roadmap](#how-to-contribute-to-the-roadmap)

---

## Vision

Every small business that sells online needs the same foundation: authentication, products, categories, cart, checkout, orders, and payments. Developers and agencies rebuild this foundation for every client.

StoreBlocks ends that repetition. A single command generates a complete store (backend API, storefront, and admin dashboard). The person setting it up chooses the features, the database, the media storage, and the payment gateways. **Only the code for those choices is generated and only the packages they need are installed.** They fill in environment variables and deploy.

**Who it is for**

- Freelancers and agencies delivering e-commerce sites and product landing pages to clients
- Small businesses with a developer who wants a fast, clean starting point
- Developers learning how a real, modular e-commerce system is structured

---

## Guiding Principles

1. **Zero code edits for the end user.** Every customization happens through CLI prompts, `.env`, `store.config.json`, or the admin dashboard.
2. **Choose your stack, get only that code.** Every choice (feature, database, storage, payment) maps to code variants. The CLI copies the selected variant and installs only its packages. A MongoDB project contains no Drizzle code; a Cloudinary project contains no S3 SDK.
3. **One module = one folder.** A feature is added by including its folder and removed by leaving it out. Nothing else changes.
4. **Contracts over coupling.** Services talk to repository interfaces, never to a database directly. Modules talk to storage and payment interfaces, never to a vendor SDK directly.
5. **Fail loudly and clearly.** Missing configuration produces a human-readable error at startup, never a mysterious crash.
6. **Safe by default.** Payment, auth, upload, and dependency handling favor security over convenience.
7. **Local-market first, global-ready.** First-class support for Bangladeshi payments and shipping, with international gateways alongside.
8. **Contributor-friendly.** Typed contracts, manifests, generators, and tests let anyone add a module or variant without understanding the whole codebase.

---

## Non-Goals

To stay focused, StoreBlocks will **not** (at least before 1.0):

- Become a hosted SaaS store builder (that may come later as a separate product)
- Provide a drag-and-drop visual page builder
- Support marketplace / multi-vendor stores
- Replace full platforms such as Shopify or WooCommerce for large catalogs and complex B2B pricing
- Support databases other than MongoDB and PostgreSQL

---

## Setup Choices

What the CLI asks, and what each answer installs:

| Choice | Options | What gets installed |
|---|---|---|
| Features | auth, products, categories, brands, reviews, cart, coupons, social boost, wishlist, notifications, landing order form, ... | Only the selected modules (plus anything they depend on) |
| Database | **MongoDB** · **PostgreSQL** | MongoDB → Mongoose repositories · PostgreSQL → Drizzle schemas, repositories, and initial migration |
| Media storage | **Cloudinary** · **AWS S3** · **S3-compatible** (Cloudflare R2, DigitalOcean Spaces, Backblaze B2, MinIO) · **Local disk** | Only the selected storage adapter and its SDK |
| Payment methods | **Cash on Delivery** · **SSLCommerz** · **Stripe** (more later) | Only the selected gateway adapters |
| Product type | Fashion · Electronics · Grocery · Single-product landing | Matching storefront layout and product fields |
| Theme | Minimal · Bold · Elegant | Matching design tokens |
| Package manager | npm · pnpm · yarn | Install commands and lockfile for that manager |

The answers are saved in `store.config.json`, and `.env.example` lists only the variables those choices need.

Non-interactive mode for CI and power users:

```bash
npx create-storeblocks my-shop \
  --features auth,products,categories,cart,coupons \
  --db postgresql --storage s3 --payments cod,sslcommerz \
  --layout fashion --theme minimal --yes
```

---

## Architecture at a Glance

### Generator repository

```
create-storeblocks/                     pnpm workspaces + Turborepo
├── packages/
│   ├── cli/                            npx create-storeblocks
│   └── module-kit/                     manifest schema, contracts, test helpers
├── templates/
│   ├── backend-base/                   Express + TS shell, errors, env validation
│   │   └── db/{mongodb,postgresql}/    connection, UnitOfWork, drizzle.config.ts
│   ├── frontend-base/                  Next.js shell, Redux store, RTK Query baseApi
│   ├── shared-base/                    Zod schemas and types shared by both apps
│   ├── modules/
│   │   ├── products/
│   │   │   ├── module.json
│   │   │   ├── backend/
│   │   │   │   ├── products.routes.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.repository.ts        interface
│   │   │   │   └── db/
│   │   │   │       ├── mongodb/                  Mongoose model + repository
│   │   │   │       └── postgresql/               Drizzle schema + repository
│   │   │   ├── frontend/                         pages, components, API slice
│   │   │   └── shared/                           Zod schemas, types
│   │   ├── storage/
│   │   │   ├── core/                             StorageAdapter interface
│   │   │   ├── cloudinary/
│   │   │   ├── s3/                               AWS S3 and all S3-compatible services
│   │   │   └── local/
│   │   ├── payments/
│   │   │   ├── core/                             PaymentAdapter interface
│   │   │   ├── cod/
│   │   │   ├── sslcommerz/
│   │   │   └── stripe/
│   │   └── ...                                   auth, cart, orders, coupons, ...
│   ├── themes/                         design tokens (CSS variables)
│   └── layouts/                        fashion, electronics, grocery, landing
└── docs/                               documentation site
```

### Generated project

```
my-shop/
├── backend/            Express API (only selected modules and variants)
├── frontend/           Next.js storefront + /admin dashboard
├── shared/             Zod schemas and types used by both
├── store.config.json   every setup choice
├── .env.example        only the variables those choices need
├── docker-compose.yml
└── package.json        workspaces; `npm run dev` starts both apps
```

### Layers inside a backend module

```
Route → Controller → Service → Repository (interface) → Mongoose | Drizzle
```

Routes, controllers, services, and the whole frontend are identical for both databases. Only the repository implementation differs, and only one is copied into a generated project.

### Module manifest with variants

A module declares variants for any setup choice. The CLI copies the matching variant folder and merges its dependencies and env variables.

```json
{
  "name": "products",
  "label": "Products",
  "type": "core",
  "dependsOn": [],
  "uses": ["storage"],
  "variants": {
    "db": {
      "mongodb": {
        "path": "backend/db/mongodb",
        "dependencies": { "mongoose": "^8" }
      },
      "postgresql": {
        "path": "backend/db/postgresql",
        "dependencies": { "drizzle-orm": "~0.x", "pg": "^8" },
        "devDependencies": { "drizzle-kit": "~0.x", "@types/pg": "^8" }
      }
    }
  },
  "backend": { "route": "/api/products" },
  "frontend": { "adminMenu": "Products", "apiSlice": "productsApi" }
}
```

Adapter modules (storage, payments) are variants of a single choice:

```json
{
  "name": "storage-s3",
  "type": "storage",
  "dependencies": {
    "@aws-sdk/client-s3": "^3",
    "@aws-sdk/s3-request-presigner": "^3"
  },
  "env": ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_ENDPOINT", "S3_PUBLIC_URL"]
}
```

### Contracts

| Contract | Methods | Implementations |
|---|---|---|
| Repository (per module) | `findMany`, `findById`, `create`, `update`, `delete`, ... | Mongoose, Drizzle |
| `UnitOfWork` | `run(fn)` for transactions | `session.withTransaction()`, `db.transaction()` |
| `StorageAdapter` | `getUploadUrl`, `delete`, `getPublicUrl` | Cloudinary, S3, Local |
| `PaymentAdapter` | `initiate`, `verify`, `handleWebhook` | COD, SSLCommerz, Stripe |

---

## Tech Stack

### Generator

| Purpose | Tool |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| CLI prompts | `@clack/prompts` |
| File and process handling | `fs-extra`, `execa` |
| CLI build | `tsup` |
| Versioning and changelog | Changesets |
| CI/CD | GitHub Actions |

### Generated backend

| Purpose | Tool |
|---|---|
| Runtime and language | Node.js LTS + TypeScript |
| Framework | Express 5 |
| Database (user's choice) | MongoDB + **Mongoose** · PostgreSQL + **Drizzle ORM** |
| Validation and env checks | Zod |
| Auth | JWT (access + refresh) in httpOnly cookies, bcrypt |
| Security | helmet, cors, express-rate-limit |
| Logging | Pino |
| Media storage (user's choice) | Cloudinary · AWS S3 · S3-compatible · Local disk |
| Email | Nodemailer (SMTP) |
| Testing | Vitest, Supertest, mongodb-memory-server, PostgreSQL service container |

### Generated frontend

| Purpose | Tool |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Animation | Motion (formerly Framer Motion), imported from `motion/react` |
| Client state | Redux Toolkit (cart, UI state) |
| Server data | RTK Query (cart, checkout, account, admin) |
| SEO-critical pages | Server Components with direct fetch (home, product listing, product detail) |
| Forms | React Hook Form + Zod |
| E2E testing | Playwright |

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🚧 | In progress |
| 📋 | Planned |
| 💡 | Idea / under discussion |

---

## Phase 0 — Foundation

**Goal:** Lock in the name, accounts, stack decisions, and repository basics.

- [x] ✅ Choose project name: **StoreBlocks**
- [x] ✅ Verify `storeblocks` and `create-storeblocks` are free on npm
- [x] ✅ Decide stack: TypeScript everywhere; Next.js, Tailwind, shadcn/ui, Motion, Redux Toolkit, RTK Query; Express; MongoDB (Mongoose) or PostgreSQL (Drizzle); pluggable storage and payments
- [ ] 📋 Check `storeblocks.dev` domain and trademark databases (WIPO, USPTO)
- [ ] 📋 Create npm organization `@storeblocks` (reserve the scope)
- [ ] 📋 Create GitHub organization `storeblocks` and main repository
- [ ] 📋 Publish placeholder `create-storeblocks@0.0.1` with README linking to the repo
- [ ] 📋 Enable 2FA on npm and GitHub accounts
- [ ] 📋 Add `LICENSE` (MIT), initial `README.md`, and this `ROADMAP.md`
- [ ] 📋 Set up pnpm workspaces, Turborepo, TypeScript project references, ESLint, Prettier, EditorConfig

**Done when:** names are secured and the empty monorepo builds, type-checks, and lints in CI.

---

## Phase 1 — Modular Backend Core (v0.1)

**Goal:** Port the existing e-commerce API to TypeScript as self-contained modules behind repository interfaces. MongoDB implementations come first; every interface is designed for PostgreSQL from day one.

### Backend base

- [ ] 📋 Express + TypeScript shell with helmet, CORS, rate limiting, compression
- [ ] 📋 Central error handler and consistent API response format
- [ ] 📋 Request validation middleware using shared Zod schemas
- [ ] 📋 Env validation with Zod at startup
- [ ] 📋 Pino structured logging
- [ ] 📋 Health check endpoint: `GET /api/health`
- [ ] 📋 **Dynamic module loader** that reads `store.config.json` and mounts each module's router
- [ ] 📋 Database layer: MongoDB connection with retry and graceful shutdown
- [ ] 📋 `UnitOfWork` interface + MongoDB implementation

### Shared package

- [ ] 📋 `shared/` with Zod schemas and inferred types for every entity
- [ ] 📋 IDs are always `string` in shared types (`ObjectId` and `uuid` stay inside repositories)
- [ ] 📋 Common types: `Paginated<T>`, query/filter DTOs, API error shape

### Core modules (always included)

- [ ] 📋 **auth**: register, login, logout, refresh token, forgot / reset password, email verification
- [ ] 📋 **users**: profile, addresses, roles (customer, admin), admin user list
- [ ] 📋 **products**: CRUD, images, variants (size / color), SKU, stock, slug, search, filter, sort, pagination
- [ ] 📋 **categories**: CRUD, nested categories, slug
- [ ] 📋 **orders**: create, status flow (pending → confirmed → processing → shipped → delivered / cancelled / returned), history, admin management
- [ ] 📋 **settings**: store name, logo, contact info, social links, currency (stored in DB, managed from admin)

### Module contract

- [ ] 📋 Every module: routes → controller → service → repository interface → `db/mongodb/` implementation
- [ ] 📋 Every module exports `{ basePath, router }` and optional `{ seed }`
- [ ] 📋 `module.json` for each core module, with `variants.db`
- [ ] 📋 `module-kit`: Zod schema for manifests and a validation script

### Testing

- [ ] 📋 Repository contract tests (one suite per repository, written to run against any implementation)
- [ ] 📋 Integration tests for every core endpoint (Vitest + Supertest + mongodb-memory-server)

**Done when:** removing any non-core module folder and its config entry leaves a working API, and every repository passes its contract suite on MongoDB.

---

## Phase 2 — CLI MVP (v0.2)

**Goal:** `npx create-storeblocks my-shop` generates a working backend from the user's choices.

- [ ] 📋 Interactive prompts: project name, features, database, storage, payments, package manager
- [ ] 📋 Database prompt shows PostgreSQL as "coming in v0.5" until Phase 5 ships
- [ ] 📋 Non-interactive mode with flags and `--yes`
- [ ] 📋 Dependency resolution from `dependsOn` and `uses` (selecting Reviews adds Auth and Products)
- [ ] 📋 **Variant resolution**: for each module, copy only the folder matching the chosen database; drop all other variants
- [ ] 📋 Copy base templates and the selected database base (`backend-base/db/<choice>`)
- [ ] 📋 Generate `store.config.json`
- [ ] 📋 Generate `.env.example` with only the variables the chosen modules and variants need, with comments
- [ ] 📋 Merge `package.json` dependencies from all selected modules and variants
- [ ] 📋 Install dependencies following the [Dependency Policy](#dependency-policy)
- [ ] 📋 Initialize a git repository with a first commit
- [ ] 📋 Friendly "next steps" message tailored to the choices
- [ ] 📋 Validate project name; refuse to overwrite a non-empty folder
- [ ] 📋 CLI tests: generate several combinations, assert no unselected variant code or package is present, and assert the output builds

**Done when:** a developer can generate, configure, and run a backend in under five minutes, and the generated project contains only the chosen code.

---

## Phase 3 — Media Storage (v0.3)

**Goal:** Pluggable storage for product images, category and brand images, logo, favicon, and banners.

### Storage core

- [ ] 📋 `StorageAdapter` interface: `getUploadUrl`, `delete`, `getPublicUrl`
- [ ] 📋 **Direct browser uploads** via signed URLs (the file never passes through Express)
- [ ] 📋 Upload rules enforced before signing: admin only, allowed types (jpg, png, webp, svg), max size
- [ ] 📋 Store `{ key, provider, alt }` in the database, never a hard-coded URL, so providers and CDN domains can change
- [ ] 📋 Delete files from storage when a product or image is removed
- [ ] 📋 Admin upload component with drag-and-drop, preview, progress, and reordering

### Adapters

- [ ] 📋 **Cloudinary**: signed uploads; `getPublicUrl` builds transformation URLs (resize, WebP/AVIF)
- [ ] 📋 **S3**: one adapter for AWS S3 and every S3-compatible service (Cloudflare R2, DigitalOcean Spaces, Backblaze B2, MinIO), switched by `S3_ENDPOINT`; presigned PUT uploads
- [ ] 📋 **Local disk**: for development and single-server VPS; CLI warns it does not work on Vercel, Render, or Railway

### Frontend integration

- [ ] 📋 CLI writes `images.remotePatterns` in `next.config.ts` for the chosen provider
- [ ] 📋 S3 and local images optimized by Next.js `<Image>`; Cloudinary images use Cloudinary transformations
- [ ] 📋 UI icons come from `lucide-react` in code, not from storage

### Testing

- [ ] 📋 Adapter contract tests for all three adapters (S3 tested against MinIO in CI)

**Done when:** an admin can upload, display, and delete product images with each storage option.

---

## Phase 4 — Cart, Checkout and Payments (v0.4)

**Goal:** A complete purchase flow with local and international payment methods.

### Cart and shipping

- [ ] 📋 **cart**: add, update quantity, remove, clear; guest cart merged into user cart on login
- [ ] 📋 **shipping**: flat rate, inside / outside Dhaka rates, free-shipping threshold
- [ ] 📋 Checkout: address, shipping method, payment method, order summary
- [ ] 📋 Order creation, stock decrement, and coupon use in one `UnitOfWork` transaction
- [ ] 📋 Stock release on payment failure or timeout

### Payment core

- [ ] 📋 `PaymentAdapter` interface: `initiate(order)`, `verify(req)`, `handleWebhook(req)`
- [ ] 📋 `GET /api/payments/methods` returns only enabled methods
- [ ] 📋 Payment records with transaction ID, amount, status, gateway, raw response
- [ ] 📋 Idempotent webhook handling
- [ ] 📋 Server-side amount verification (never trust client totals)
- [ ] 📋 Success, failure, and cancel redirect handling
- [ ] 📋 Contract test suite every gateway must pass

### Gateways

- [ ] 📋 **Cash on Delivery**: order marked pending, no redirect
- [ ] 📋 **SSLCommerz**: sandbox and live modes, IPN validation
- [ ] 📋 **Stripe**: Checkout Session, webhook signature verification

**Done when:** a test order completes end to end with COD, SSLCommerz sandbox, and Stripe test mode.

---

## Phase 5 — PostgreSQL + Drizzle (v0.5)

**Goal:** Full parity between MongoDB and PostgreSQL. Users choose either; everything else stays identical.

- [ ] 📋 PostgreSQL base: `pg` connection pool, Drizzle client, graceful shutdown
- [ ] 📋 `UnitOfWork` PostgreSQL implementation (`db.transaction()`)
- [ ] 📋 Drizzle schema file per module (`*.schema.ts`), discovered by a glob in `drizzle.config.ts`
- [ ] 📋 Drizzle repository for every module built so far (core, storage records, cart, orders, payments, shipping)
- [ ] 📋 Relational modeling where MongoDB embeds (e.g. `order_items` table vs embedded order items); repositories return the same shared types
- [ ] 📋 `uuid` primary keys; IDs exposed as `string`
- [ ] 📋 CLI runs `drizzle-kit generate` after copying modules so the project ships with its initial migration
- [ ] 📋 Scripts: `db:migrate`, `db:studio`; optional auto-migrate on first start
- [ ] 📋 Enable PostgreSQL in the CLI database prompt
- [ ] 📋 **CI matrix**: every repository contract suite and endpoint test runs on both `mongodb` and `postgresql`

**Rule from here on:** every new module ships both repository implementations, or CI fails.

**Done when:** the full test suite passes on both databases and a PostgreSQL store completes an order end to end.

---

## Phase 6 — Storefront and Admin Dashboard (v0.6)

**Goal:** Full-stack generation: backend + storefront + admin dashboard.

### Frontend base

- [ ] 📋 Next.js App Router + TypeScript, Tailwind CSS, shadcn/ui, lucide-react
- [ ] 📋 Redux store created per request with `makeStore()` inside a client Provider (no shared server state)
- [ ] 📋 RTK Query `baseApi`; each module adds endpoints with `injectEndpoints`, so unselected modules add nothing
- [ ] 📋 Token refresh handling in the RTK Query base query
- [ ] 📋 Server Components with direct fetch for SEO pages (home, listings, product detail, category pages)
- [ ] 📋 Config-driven navigation and admin menu (only selected features appear)
- [ ] 📋 Motion animations: page transitions, add-to-cart feedback, hover states; respects `prefers-reduced-motion`
- [ ] 📋 SEO basics: metadata, Open Graph tags, sitemap, robots.txt, structured data for products
- [ ] 📋 Responsive, mobile-first layouts; accessibility pass

### Storefront pages

- [ ] 📋 Home, product listing with filters, product details, category pages
- [ ] 📋 Cart (Redux slice persisted to localStorage, synced on login), checkout, order success / failure
- [ ] 📋 Login, register, forgot password
- [ ] 📋 Customer account: profile, addresses, order history, order tracking

### Admin dashboard (`/admin` in the same Next.js app)

- [ ] 📋 Overview: sales, orders, low stock
- [ ] 📋 Products (with storage uploader), categories, orders, customers
- [ ] 📋 Store settings: name, logo, contact, social links, currency, shipping rates
- [ ] 📋 Config-driven admin menu

### CLI

- [ ] 📋 Generates `frontend/` and `shared/` alongside `backend/`
- [ ] 📋 One default theme and one default layout to start

**Done when:** a generated project gives a store owner a working storefront and admin panel with no code edits, on either database and any storage option.

---

## Phase 7 — Feature Modules (v0.7)

**Goal:** Complete the optional feature set. Each module ships its manifest, both database repositories, frontend components, admin pages, API slice, and tests.

- [ ] 📋 **brands**: CRUD, brand pages, brand filter
- [ ] 📋 **reviews**: ratings and reviews; hidden until **admin approval**; verified-purchase badge; moderation queue
- [ ] 📋 **coupons**: percentage and fixed discounts, minimum order, expiry, usage limits (total and per user), product / category restrictions
- [ ] 📋 **social-boost**: promote products on social media
  - Share buttons (Facebook, WhatsApp, Messenger, X, LinkedIn)
  - Rich Open Graph previews per product
  - Facebook / Instagram product catalog feed
  - Meta Pixel and Google Analytics events (view, add-to-cart, purchase)
  - Admin "boost" toggle to feature products on the home page
- [ ] 📋 **wishlist**: save products for later
- [ ] 📋 **notifications**: order confirmation and status-change emails; optional SMS hook
- [ ] 📋 **landing-order**: single-page inline order form for product landing pages (name, phone, address, quantity), common for COD sales

**Done when:** every module marked v0.7 in the [Module Catalog](#module-catalog) can be selected independently and passes CI on both databases.

---

## Phase 8 — Themes and Product Types (v0.8)

**Goal:** Let users choose how their store looks and how products are presented.

### Themes (visual style)

- [ ] 📋 Design tokens as CSS variables (colors, fonts, radius, spacing, shadows), compatible with shadcn/ui
- [ ] 📋 Light and dark mode for every theme
- [ ] 📋 Themes: **Minimal**, **Bold**, **Elegant**, each with its own Motion presets (subtle to expressive)
- [ ] 📋 Runtime theme switching from the admin dashboard (theme name stored in DB)
- [ ] 📋 Brand color override from admin settings

### Product types (layout and fields)

- [ ] 📋 **Fashion**: size / color variants, size guide, lookbook grid
- [ ] 📋 **Electronics**: spec tables, product comparison, warranty info
- [ ] 📋 **Grocery**: weight / unit pricing, quick-add, delivery slots
- [ ] 📋 **Single-product landing**: hero, benefits, testimonials, FAQ, inline order form

### Contributor support

- [ ] 📋 Generators: `pnpm new:theme`, `pnpm new:layout`
- [ ] 📋 Visual regression tests (Playwright screenshots)

**Done when:** every theme works with every product type.

---

## Phase 9 — Zero-Code Setup and Deployment (v0.9)

**Goal:** Deliver on the promise: fill in `.env`, run, deploy.

- [ ] 📋 Startup env validation with clear messages for every choice
      (e.g. "Storage is `s3` but `S3_BUCKET` is missing", "SSLCommerz is enabled but `SSLC_STORE_ID` is missing")
- [ ] 📋 First-run seed: create admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- [ ] 📋 Optional demo data seed (`npm run seed:demo`), with demo images uploaded to the chosen storage
- [ ] 📋 Single command to run both apps locally: `npm run dev`
- [ ] 📋 `docker-compose.yml` generated for the chosen database (MongoDB or PostgreSQL) and, for local storage, a volume; MinIO service optional
- [ ] 📋 Deployment configs and guides:
  - Vercel (frontend)
  - Render / Railway (backend)
  - MongoDB Atlas, Neon, Supabase (databases)
  - VPS with Docker and Nginx
- [ ] 📋 Storage setup guides: Cloudinary account, S3 bucket + IAM + CORS, Cloudflare R2
- [ ] 📋 Generated project README tailored to the selected features, database, storage, and payments
- [ ] 📋 Production checklist (HTTPS, secrets, backups, live payment keys, storage CORS)
- [ ] 📋 `npx create-storeblocks doctor`: checks env, database connection, storage access, and gateway credentials

**Done when:** a non-developer following the generated README can deploy a store without touching code.

---

## Phase 10 — Open-Source Readiness (v0.10)

**Goal:** Make the project safe and easy for others to contribute to.

### Documentation

- [ ] 📋 `README.md` with demo GIF, quick start, and feature list
- [ ] 📋 `CONTRIBUTING.md`: local setup, how to add a module, a database variant, a storage adapter, a payment gateway, a theme, or a layout; commit conventions
- [ ] 📋 `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [ ] 📋 `SECURITY.md` with private vulnerability reporting
- [ ] 📋 Documentation site (Nextra or Docusaurus) on `storeblocks.dev`
- [ ] 📋 Architecture docs: module manifest, variants, repository contract, storage and payment interfaces

### Contributor tooling

- [ ] 📋 Generators: `pnpm new:module <name> --type feature|payment|storage` (scaffolds both database variants and tests)
- [ ] 📋 Issue templates: bug report, feature request, new module proposal, roadmap proposal
- [ ] 📋 Pull request template with checklist
- [ ] 📋 Labels: `good first issue`, `help wanted`, `module`, `payment`, `storage`, `database`, `theme`, `docs`

### CI on every pull request

- [ ] 📋 Lint, format, and type-check
- [ ] 📋 Manifest validation (schema, `dependsOn` and `uses` references, every `db` variant present)
- [ ] 📋 Unit and integration tests on **both databases**
- [ ] 📋 Generation matrix: minimal and full feature sets × MongoDB / PostgreSQL × each storage adapter × each payment gateway; each must build and pass tests
- [ ] 📋 Storage and payment adapter contract tests
- [ ] 📋 `npm audit` and Dependabot alerts

### Governance and protection

- [ ] 📋 Branch protection on `main`: required reviews and passing CI
- [ ] 📋 `CODEOWNERS` for `payments/`, `storage/`, `auth/`, and `packages/cli/`
- [ ] 📋 Review policy for any new third-party dependency
- [ ] 📋 Changesets for versioning and automatic CHANGELOG
- [ ] 📋 npm publishing only from CI with provenance

**Done when:** an outside contributor can add a module or adapter by following the docs, and CI catches mistakes without manual testing.

---

## Phase 11 — Public Launch (v1.0)

**Goal:** A stable, documented release.

### Release criteria

- [ ] 📋 All core and v0.7 modules stable on both databases, with test coverage on critical paths (auth, cart, checkout, payments, uploads)
- [ ] 📋 Three storage adapters, three payment gateways, three themes, four product types
- [ ] 📋 Deployment guides verified on every listed platform
- [ ] 📋 Security review of auth, upload, and payment modules
- [ ] 📋 At least one real store running in production on StoreBlocks
- [ ] 📋 Manifest format and contracts declared stable (breaking changes require a major version)

### Launch

- [ ] 📋 Live demo store and read-only demo admin
- [ ] 📋 Launch post and walkthrough video
- [ ] 📋 Share on LinkedIn, dev.to, Reddit, Hacker News, Product Hunt, and Bangladeshi developer communities
- [ ] 📋 Seed 10+ `good first issue` items (bKash, Nagad, new themes, translations)

---

## Phase 12 — Beyond 1.0

Ideas being considered after the stable release. Priorities will follow community demand.

### More payment gateways

- [ ] 💡 bKash
- [ ] 💡 Nagad
- [ ] 💡 PayPal
- [ ] 💡 Razorpay
- [ ] 💡 Paddle / Lemon Squeezy (digital products)

### More storage options

- [ ] 💡 Google Cloud Storage
- [ ] 💡 Azure Blob Storage
- [ ] 💡 ImageKit
- [ ] 💡 Uploadthing

### Database and ORM

- [ ] 💡 MySQL via Drizzle
- [ ] 💡 Prisma as an alternative ORM for PostgreSQL (revisit once Prisma 7 supports MongoDB; adds a third repository implementation per module)

### CLI power features

- [ ] 💡 `npx create-storeblocks add <module>` to add a feature to an existing project
- [ ] 💡 `npx create-storeblocks upgrade` to pull module updates safely
- [ ] 💡 `npx create-storeblocks switch storage <provider>` with a file migration script

### Store features

- [ ] 💡 Multi-language storefront (English, Bangla, more)
- [ ] 💡 Multi-currency
- [ ] 💡 Inventory alerts and purchase orders
- [ ] 💡 Courier integrations (Pathao, Steadfast, RedX)
- [ ] 💡 Abandoned cart recovery
- [ ] 💡 Customer loyalty points
- [ ] 💡 Blog / content pages
- [ ] 💡 Digital product downloads
- [ ] 💡 Runtime feature flags (enable / disable modules from admin)

### Ecosystem

- [ ] 💡 Community module registry (third-party modules installable by name)
- [ ] 💡 Premium themes marketplace
- [ ] 💡 Hosted, multi-tenant version of StoreBlocks

---

## Module Catalog

| Module | Type | Depends on | Variants | Target |
|---|---|---|---|---|
| auth | core | — | db | v0.1 |
| users | core | auth | db | v0.1 |
| products | core | — (uses storage) | db | v0.1 |
| categories | core | products | db | v0.1 |
| orders | core | auth, products | db | v0.1 |
| settings | core | auth | db | v0.1 |
| storage-cloudinary | storage | — | — | v0.3 |
| storage-s3 | storage | — | — | v0.3 |
| storage-local | storage | — | — | v0.3 |
| cart | feature | products | db | v0.4 |
| shipping | feature | orders | db | v0.4 |
| payment-cod | payment | orders | db | v0.4 |
| payment-sslcommerz | payment | orders | db | v0.4 |
| payment-stripe | payment | orders | db | v0.4 |
| brands | feature | products | db | v0.7 |
| reviews | feature | auth, products | db | v0.7 |
| coupons | feature | cart, orders | db | v0.7 |
| social-boost | feature | products | db | v0.7 |
| wishlist | feature | auth, products | db | v0.7 |
| notifications | feature | orders | — | v0.7 |
| landing-order | feature | orders | — | v0.7 |

Exactly one storage adapter is selected per project. Any number of payment gateways can be selected (at least one).

---

## Dependency Policy

Generated projects install up-to-date packages without breaking:

1. **Only what was chosen.** Packages come from the selected modules and variants only. A MongoDB project never installs Drizzle; a Cloudinary project never installs the AWS SDK.
2. **Major versions are pinned** in each manifest (e.g. `"express": "^5"`). Users get the newest minor and patch releases within that major.
3. **Pre-1.0 packages are pinned tighter.** Packages below 1.0 (such as `drizzle-orm` and `drizzle-kit`) use a tilde range (`~0.x`), since their minor releases may contain breaking changes.
4. **Brand-new releases are avoided.** The CLI installs only versions published at least 14 days earlier (`npm install --before=<date>`), reducing exposure to compromised releases.
5. **Opt-in bleeding edge.** `--latest` installs every package at `@latest`, with a warning.
6. **Lockfiles are kept.** Each generated project commits its lockfile so deployments are reproducible.
7. **Weekly compatibility check.** A scheduled CI job generates full projects for every database and storage combination with `--latest`, runs the test suites, and opens a pull request to raise versions when everything passes.

---

## Security Commitments

- Passwords hashed with bcrypt; JWT secrets required at startup; tokens in httpOnly cookies
- Rate limiting on authentication, upload-signing, and checkout endpoints
- Payment amounts always verified server-side
- Webhook signatures verified for every gateway that supports them
- Upload URLs signed only for admins, with type and size limits and short expiry
- No secrets in generated code; everything comes from `.env`
- Admin routes protected by role checks and covered by tests
- Private vulnerability reporting through GitHub Security Advisories
- Maintainer review required for changes to `auth`, `payments`, `storage`, and the CLI

---

## Success Metrics

| Metric | Target by v1.0 |
|---|---|
| Time from `npx` to running store locally | Under 5 minutes |
| Time to first production deploy (following docs) | Under 30 minutes |
| Generated combinations passing the CI matrix | 100% |
| Generated projects containing unselected code or packages | 0 |
| Production stores built with StoreBlocks | 10+ |
| External contributors | 10+ |
| Community-contributed modules, adapters, or themes | 3+ |
| GitHub stars | 500+ |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Two databases double the work per module | Shared contracts, contract test suites, generators that scaffold both variants, CI failing when one is missing |
| Database behavior differs (IDs, relations, transactions) | IDs as strings in shared types, `UnitOfWork` abstraction, repositories return identical shared types |
| Combination explosion (features × databases × storage × payments) | Strict module isolation, typed contracts, generation matrix in CI |
| Dependency updates break generated projects | Major pinning, tilde for pre-1.0, 14-day release delay, weekly compatibility CI |
| Malicious code through contributions or dependencies | CODEOWNERS, required reviews, dependency review, provenance publishing |
| Payment or upload bugs harm store owners | Contract tests, server-side verification, signed uploads, sandbox testing required before merge |
| Local storage used on ephemeral hosts and files lost | CLI warning, `doctor` check, deployment docs |
| Maintainer burnout | Clear guides, generators, co-maintainers per area (payments, storage, databases, themes) |
| Scope creep | Non-goals list; roadmap proposals discussed before work starts |

---

## How to Contribute to the Roadmap

1. **Pick something up.** Look for items marked 📋 with an open issue labeled `help wanted` or `good first issue`.
2. **Propose something new.** Open a **Roadmap proposal** issue describing the problem, who it helps, and a rough approach.
3. **Discuss before building.** For new modules, gateways, storage adapters, or themes, comment on the issue first so effort is not wasted.
4. **Follow the contracts.** Use `pnpm new:module`, implement both database variants, and make sure CI passes.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and guidelines.

---

*Last updated: October 2026*
