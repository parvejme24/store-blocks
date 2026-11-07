# StoreBlocks

> Scaffold a production-ready, full-stack e-commerce store in minutes. Choose your features, database, storage, and payment gateways. Add your `.env` and deploy. No code changes required.

```bash
npx create-storeblocks my-shop
```

> **Status:** under active development. Not ready for production yet. Follow the [Roadmap](./ROADMAP.md) to see what is coming.

---

## Why StoreBlocks?

Every online store needs the same foundation: authentication, products, categories, cart, checkout, orders, and payments. Developers rebuild it for every client.

StoreBlocks generates that foundation for you, with **only the code you chose**:

- Pick the **features** you need (reviews, coupons, brands, wishlist, social boost, ...)
- Pick your **database**: MongoDB (Mongoose) or PostgreSQL (Drizzle ORM)
- Pick your **media storage**: Cloudinary, AWS S3, S3-compatible (Cloudflare R2, DigitalOcean Spaces, ...), or local disk
- Pick your **payment methods**: Cash on Delivery, SSLCommerz, Stripe
- Pick a **product type** and a **theme** for the storefront

You get a backend API, a storefront, and an admin dashboard. Fill in `.env`, run, deploy.

## Quick Start

```bash
npx create-storeblocks my-shop
cd my-shop
cp .env.example .env    # fill in your values
npm run dev
```

Non-interactive:

```bash
npx create-storeblocks my-shop \
  --features auth,products,categories,cart,coupons \
  --db postgresql --storage s3 --payments cod,sslcommerz \
  --layout fashion --theme minimal --yes
```

## What You Get

| Part | Stack |
|---|---|
| Backend | Node.js, Express, TypeScript, Zod |
| Database | MongoDB + Mongoose **or** PostgreSQL + Drizzle ORM |
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui, Motion |
| State and data | Redux Toolkit, RTK Query |
| Storage | Cloudinary, S3, S3-compatible, or local |
| Payments | Cash on Delivery, SSLCommerz, Stripe |

## Features

| Feature | Description |
|---|---|
| Auth | Register, login, refresh tokens, password reset, email verification |
| Products | Variants, stock, SKU, images, search, filters |
| Categories and brands | Nested categories, brand pages |
| Reviews | Customer reviews shown only after admin approval |
| Cart and checkout | Guest cart, shipping rates (inside / outside Dhaka) |
| Orders | Full status flow, history, admin management |
| Coupons | Percentage or fixed, limits, expiry, restrictions |
| Social boost | Share buttons, Open Graph, catalog feed, Meta Pixel |
| Admin dashboard | Manage everything without touching code |

## Documentation

- [Roadmap](./ROADMAP.md)
- [Architecture](./docs/architecture.md)
- [Module manifest](./docs/module-manifest.md)
- [Contracts](./docs/contracts.md)
- [Conventions](./docs/conventions.md)
- [Architecture decisions](./docs/adr/)

## Contributing

Contributions are welcome: new modules, payment gateways, storage adapters, themes, layouts, docs, and fixes. Read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started, and look for issues labeled `good first issue`.

## Security

Please do not report security issues in public issues. See [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)
