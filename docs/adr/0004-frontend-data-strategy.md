# ADR 0004: Server Components for SEO Pages, RTK Query for Interactive Areas

- **Status:** Accepted
- **Date:** 2026-10-18

## Context

The storefront must rank in search engines and load fast, while the cart, checkout, account, and admin dashboard are highly interactive. The chosen client stack is Redux Toolkit with RTK Query. Next.js App Router renders on the server by default.

## Decision

- **Server Components with direct fetch** for SEO-critical pages: home, product listings, product detail, category and brand pages.
- **RTK Query** for cart, checkout, customer account, and the entire admin dashboard.
- Each module adds its endpoints with `baseApi.injectEndpoints`, so unselected modules contribute nothing to the bundle.
- The Redux store is created per request with `makeStore()` inside a client Provider; no module-level singleton.
- The guest cart lives in a Redux slice persisted to localStorage and is merged into the server cart on login.
- Animations use Motion (`motion/react`), respecting `prefers-reduced-motion`.

## Alternatives Considered

| Option | Why not |
|---|---|
| RTK Query for every page | Product pages would render on the client; worse SEO and slower first paint. |
| Server Components only | Admin and checkout need rich client state, caching, and invalidation. |
| A global Redux store singleton | Risks sharing one user's state with another during server rendering. |
| TanStack Query | A good option, but the project standardizes on Redux Toolkit for client state; RTK Query keeps one toolset. |

## Consequences

- Two data paths to document: server fetch helpers and RTK Query slices.
- Shared Zod schemas validate both server responses and client forms.
- Admin can be fully client-side without affecting storefront SEO.
