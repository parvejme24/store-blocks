# Conventions

Shared rules so every module looks and behaves the same, whoever wrote it.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Module folder | kebab-case | `social-boost` |
| Backend files | `<module>.<role>.ts` | `products.service.ts` |
| React components | PascalCase | `ProductCard.tsx` |
| Hooks | `use` + camelCase | `useCartTotals.ts` |
| RTK Query slice | `<module>Api` | `couponsApi.ts` |
| Types | PascalCase | `CreateProductInput` |
| Zod schemas | camelCase + `Schema` | `createProductSchema` |
| Env variables | UPPER_SNAKE_CASE, prefixed by provider | `SSLC_STORE_ID`, `S3_BUCKET` |
| MongoDB collections | plural, camelCase | `orderItems` |
| PostgreSQL tables and columns | plural, snake_case | `order_items.created_at` |
| API routes | plural, kebab-case | `/api/product-reviews` |

## API Design

- REST, JSON, prefix `/api`.
- Plural resources: `GET /api/products`, `GET /api/products/:id`.
- Slugs for public lookups: `GET /api/products/slug/:slug`.
- Admin-only actions under the same resource, protected by role: `PATCH /api/reviews/:id/approve`.

### Response format

Success:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": null
  }
}
```

`meta` appears only on paginated responses. `details` holds Zod field errors on validation failures.

### Status codes

| Status | When |
|---|---|
| 200 | Read or update succeeded |
| 201 | Created |
| 204 | Deleted, no body |
| 400 | Validation failed (`VALIDATION_ERROR`) |
| 401 | Not authenticated (`UNAUTHENTICATED`) |
| 403 | Authenticated but not allowed (`FORBIDDEN`) |
| 404 | Not found (`<RESOURCE>_NOT_FOUND`) |
| 409 | Conflict, e.g. duplicate slug (`<RESOURCE>_CONFLICT`) |
| 422 | Business rule failed, e.g. `COUPON_EXPIRED`, `OUT_OF_STOCK` |
| 429 | Rate limited |
| 500 | Unexpected error (`INTERNAL_ERROR`); details never exposed |

### Error codes

UPPER_SNAKE_CASE, stable once released (the frontend relies on them). Each module documents its codes in its README.

### Pagination, sorting, filtering

```
GET /api/products?page=2&limit=20&sort=-createdAt&category=shirts&minPrice=50000
```

- `page` starts at 1; `limit` defaults to 20, max 100.
- `sort`: field name, `-` prefix for descending.
- Prices in query strings use minor units.

## Money

- Store integer minor units (`priceMinor: 125000` = ৳1,250.00) plus `currency`.
- Format only in the UI.

## Validation

- Every request body, query, and params object is validated with Zod in the route.
- Schemas live in `shared/` so the frontend validates forms with the same rules.

## Errors and Logging

- Throw `AppError(code, message, status)` from services; the central handler formats it.
- Log with Pino; include a request ID.
- Never log passwords, tokens, secrets, full payment payloads, or full addresses.

## Frontend

- Server Components by default; add `"use client"` only where needed.
- SEO pages fetch on the server; interactive areas use RTK Query.
- Use shadcn/ui primitives before writing custom components.
- Colors, radius, and fonts come from theme tokens; no hard-coded hex values in components.
- Animations use `motion/react` and respect `prefers-reduced-motion`.
- All user-visible strings go through the i18n helper (prepares for multi-language).

## Testing

- Test files sit next to the code: `products.service.test.ts`.
- Repository contract tests run on both databases.
- Name tests by behavior: `it("rejects a coupon past its expiry date")`.

## Git

### Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>

feat(cart): merge guest cart on login
fix(storage-s3): use path-style URLs for MinIO
docs(contracts): clarify idempotent webhooks
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`. Scope = module or package name.

### Branches

`feat/<name>`, `fix/<name>`, `docs/<name>`, `chore/<name>`.

### Versioning

Semantic Versioning via Changesets. Breaking changes to manifests, contracts, or generated project structure are major.
