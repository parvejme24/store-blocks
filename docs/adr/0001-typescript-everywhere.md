# ADR 0001: TypeScript Everywhere

- **Status:** Accepted
- **Date:** 2026-10-18

## Context

StoreBlocks is open source and modular. Outside contributors will add modules, database variants, storage adapters, and payment gateways. The original e-commerce backend this project grew from was written in JavaScript.

## Decision

The CLI, the module kit, and every template (backend, frontend, shared) are written in TypeScript with `strict` mode. There is no JavaScript variant of the templates.

## Alternatives Considered

| Option | Why not |
|---|---|
| JavaScript only | No compile-time check that adapters and repositories implement their contracts; mistakes surface only in review or production. |
| JavaScript first, TypeScript later | Two template sets means every module and fix twice; migration later is harder than starting typed. |
| Both JS and TS templates | Doubles maintenance permanently for little user value, since end users do not edit code. |

## Consequences

- Contracts (`docs/contracts.md`) are enforced by the compiler.
- Frontend and backend share Zod schemas and inferred types from `shared/`.
- Contributors need basic TypeScript; generators and examples lower that barrier.
- The existing JavaScript logic must be ported, which is mostly mechanical.
