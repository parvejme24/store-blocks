# CLAUDE.md

Guidance for AI coding assistants (Claude Code and others) working in this repository. Human contributors should read it too.

## What this repo is

StoreBlocks is a CLI scaffolder (`npx create-storeblocks`). This repository contains the **generator** (`packages/cli`), shared tooling (`packages/module-kit`), and the **templates** it copies into generated projects (`templates/`). Code in `templates/` is not run directly from here; it is copied, then run inside a generated project.

Read before changing anything structural:

- `docs/architecture.md`: how modules, variants, and adapters fit together
- `docs/module-manifest.md`: the `module.json` format
- `docs/contracts.md`: repository, UnitOfWork, storage, and payment interfaces
- `docs/conventions.md`: naming, API format, errors, commits
- `docs/adr/`: decisions already made and why

## Commands

```bash
npm install                 # install workspace dependencies
npm run dev                 # watch-build the CLI
npm run build               # build all packages
npm run typecheck           # TypeScript across the repo
npm run lint                # ESLint + Prettier check
npm run test                # unit + integration tests (both databases need Docker running)
npm run test:generate       # generate projects from the CI matrix and build them
npm run validate:manifests  # validate every module.json
```

## Hard rules

1. **TypeScript everywhere.** No `any` without a comment explaining why.
2. **Layering is strict:** route → controller → service → repository interface → implementation. Controllers and services never import Mongoose models, Drizzle tables, or vendor SDKs.
3. **Every repository has two implementations:** `db/mongodb/` (Mongoose) and `db/postgresql/` (Drizzle). Never add one without the other. Both must pass the same contract tests.
4. **IDs are `string`** in shared types. Convert `_id` / `ObjectId` and `uuid` inside repositories only.
5. **Repositories return shared types** from `shared/`, never Mongoose documents or raw Drizzle rows.
6. **Transactions go through `UnitOfWork`**, never `mongoose.startSession()` or `db.transaction()` in a service.
7. **Storage and payments go through their adapters.** Never call Cloudinary, S3, SSLCommerz, or Stripe SDKs outside their adapter folder.
8. **No hard-coded config.** Anything a store owner might change goes in `.env`, `store.config.json`, or the settings module.
9. **New env variables** must be declared in the module's `module.json` and validated with Zod at startup.
10. **New dependencies** must be declared in `module.json` (per variant if variant-specific), with a major-pinned range (`^x`), or a tilde range (`~0.x`) for pre-1.0 packages. Justify any new dependency in the PR.
11. **Frontend:** SEO pages (home, listing, product, category) use Server Components with direct fetch. RTK Query is for cart, checkout, account, and admin. Each module adds endpoints with `baseApi.injectEndpoints`.
12. **Redux store** is created with `makeStore()` per request, never as a module-level singleton.
13. **Animations** use `motion/react` and respect `prefers-reduced-motion`.

## Do not

- Do not edit generated output; edit `templates/`.
- Do not add Prisma, another ORM, or a database other than MongoDB and PostgreSQL (see `docs/adr/0002`).
- Do not upload files through Express; use signed direct uploads (see `docs/adr/0003`).
- Do not trust client-side prices or totals.
- Do not log secrets, tokens, passwords, or full payment payloads.
- Do not change a contract in `docs/contracts.md` without an ADR.

## When adding a module

1. Run `pnpm new:module <name> --type feature`.
2. Fill in `module.json` (dependsOn, uses, env, variants).
3. Write shared Zod schemas in `shared/`.
4. Write the repository interface, then both implementations.
5. Write service, controller, routes.
6. Write frontend: API slice, components, admin pages.
7. Write contract tests and endpoint tests; run on both databases.
8. Add the module's `README.md` and a changeset.
