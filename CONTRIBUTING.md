# Contributing to StoreBlocks

Thanks for helping! This guide covers local setup, the kinds of contributions we welcome, and how to get a pull request merged.

## Ways to Contribute

- Fix bugs and improve docs
- Add a **feature module** (e.g. wishlist, loyalty points)
- Add a **payment gateway** (e.g. bKash, Nagad, PayPal)
- Add a **storage adapter** (e.g. Google Cloud Storage)
- Add a **theme** or a **product-type layout**
- Add translations

Before starting anything larger than a small fix, **open an issue first** (use the *New module proposal* or *Feature request* template) so we can agree on the approach.

## Local Setup

Requirements: Node.js LTS, pnpm, Docker (for MongoDB, PostgreSQL, and MinIO in tests).

```bash
git clone https://github.com/storeblocks/storeblocks.git
cd storeblocks
pnpm install
docker compose -f docker-compose.dev.yml up -d   # MongoDB, PostgreSQL, MinIO
pnpm build
pnpm test
```

Try the CLI locally:

```bash
pnpm --filter create-storeblocks dev
node packages/cli/dist/index.js ../my-test-shop
```

## Project Structure

See [docs/architecture.md](./docs/architecture.md). In short:

- `packages/cli`: the generator
- `packages/module-kit`: manifest schema, contracts, test helpers
- `templates/`: everything copied into generated projects

## Adding a Feature Module

```bash
pnpm new:module wishlist --type feature
```

This scaffolds `templates/modules/wishlist/` with a manifest, both database variants, tests, and a README. Then:

1. Complete `module.json` ([docs/module-manifest.md](./docs/module-manifest.md)).
2. Add Zod schemas and types in the module's `shared/` folder.
3. Implement the repository interface **twice**: `db/mongodb/` and `db/postgresql/`.
4. Implement service, controller, and routes.
5. Add frontend pieces: RTK Query slice (`injectEndpoints`), components, admin pages.
6. Write tests. The repository contract suite must pass on both databases.
7. Document env variables and endpoints in the module `README.md`.

## Adding a Payment Gateway

```bash
pnpm new:module bkash --type payment
```

Implement `PaymentAdapter` ([docs/contracts.md](./docs/contracts.md)) and make the payment contract suite pass. Requirements:

- Verify amounts and payment status **server-side**
- Verify webhook / IPN signatures where the gateway supports them
- Handle webhooks idempotently
- Support sandbox mode, and document how to get sandbox credentials

## Adding a Storage Adapter

```bash
pnpm new:module gcs --type storage
```

Implement `StorageAdapter`. Uploads must use **signed direct uploads**, never streaming through Express. If the provider speaks the S3 API, extend the existing `s3` adapter docs instead of adding a new adapter.

## Adding a Theme or Layout

```bash
pnpm new:theme <name>
pnpm new:layout <name>
```

Themes are CSS variable tokens (light and dark). Layouts must work with every theme. Visual regression screenshots are generated in CI.

## Coding Standards

Read [docs/conventions.md](./docs/conventions.md). Key points:

- TypeScript, strict mode
- Strict layering: controllers and services never touch database models or vendor SDKs
- Zod for all validation
- No secrets or store-specific values in code

## Commits and Branches

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(coupons): add per-user usage limit
fix(sslcommerz): validate IPN amount
docs(storage): add Cloudflare R2 guide
```

Branch names: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.

## Changesets

Every user-facing change needs a changeset:

```bash
pnpm changeset
```

Pick the bump: `patch` for fixes, `minor` for new modules or features, `major` for breaking changes to manifests or contracts.

## Pull Request Checklist

- [ ] Linked issue
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass locally
- [ ] Both database variants implemented and tested (if the module touches data)
- [ ] New env variables declared in `module.json` and documented
- [ ] New dependencies justified in the PR description
- [ ] Changeset added
- [ ] Docs updated

## Review Process

- CI must pass.
- At least one maintainer approval is required.
- Changes to `payments/`, `storage/`, `auth/`, or `packages/cli/` need approval from a code owner.
- We may ask for changes. That is normal and not a rejection.

## Code of Conduct

By participating, you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
