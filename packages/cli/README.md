# create-storeblocks

> Scaffold a production-ready, full-stack modular e-commerce store in minutes.

[![npm version](https://img.shields.io/npm/v/create-storeblocks.svg?style=flat-square)](https://www.npmjs.com/package/create-storeblocks)
[![license](https://img.shields.io/npm/l/create-storeblocks.svg?style=flat-square)](https://github.com/parvejme24/store-blocks/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/github-store--blocks-blue?style=flat-square&logo=github)](https://github.com/parvejme24/store-blocks)

StoreBlocks generates a complete, clean, modular e-commerce solution tailored exactly to your requirements—**with only the code you select**:
- **Next.js 15 App Router** storefront with Tailwind CSS & Framer Motion
- **Full-featured Admin Dashboard** with responsive shells and management views
- **Modular Express backend** with clean Architecture (Domain, Service, Repository, Controller)
- Zero bloated code—only the modules, databases, storage adapters, and payment gateways you choose are bundled.

---

## 🚀 Quick Start

Run the interactive scaffolder directly via `npx`:

```bash
npx create-storeblocks@latest my-store
```

Or pass flags to skip prompts:

```bash
npx create-storeblocks@latest my-store \
  --db mongodb \
  --storage cloudinary \
  --payments cod,stripe \
  --layout fashion \
  --theme minimal \
  --yes
```

---

## ✨ Features & Architecture

### 🗄️ Database Options
- **MongoDB** (with Mongoose models & schemas)
- **PostgreSQL** (with Drizzle ORM & type-safe schemas)

### ☁️ Media Storage Adapters
- **Cloudinary**
- **Amazon S3 / S3-compatible** (Cloudflare R2, DigitalOcean Spaces, MinIO)
- **Local Disk Storage** (zero external dependencies)

### 💳 Payment Gateways
- **Cash on Delivery (COD)**
- **Stripe**
- **SSLCommerz**

### 🎨 Store Types & Layouts
- **Fashion**
- **Electronics**
- **Grocery**
- **Cosmetics**
- **Medicine / Pharmacy**
- **Organic**
- **General Store**
- **Landing Page**

### 💅 Design Themes
- **Minimal** (clean, airy typography)
- **Bold** (strong contrast, dynamic accent colors)
- **Elegant** (refined palettes, subtle curves)

### 🧩 Modular Extensions
- **Auth**: JWT access & refresh tokens, password hashing, role-based access
- **Products & Catalog**: Variants, attributes, SKU tracking
- **Categories & Brands**: Hierarchical taxonomies
- **Cart & Wishlist**: Persistent cart and customer wishlists
- **Coupons & Discounts**: Percentage, fixed discount, and minimum spend rules
- **Customer Reviews & Ratings**: Product feedback and moderation
- **Shipping & Rates**: Flexible shipping methods and tiered zones
- **Social Boost**: Meta Pixel, Google Analytics, social share hooks
- **Notifications**: System and transactional event alerts

---

## 🩺 System Doctor

Run the built-in doctor command to verify your local development environment, database connections, environment variables, and pre-flight dependencies:

```bash
npx create-storeblocks doctor
```

---

## 🛠️ CLI Options

| Flag | Description | Values / Examples |
| :--- | :--- | :--- |
| `--db` | Choose primary database | `mongodb`, `postgresql` |
| `--storage` | Choose media storage adapter | `local`, `cloudinary`, `s3` |
| `--payments` | Comma-separated payment methods | `cod`, `stripe`, `sslcommerz` |
| `--layout` | Store industry layout | `fashion`, `electronics`, `grocery`, `cosmetics`, `medicine`, `organic`, `general`, `landing` |
| `--theme` | Visual styling theme | `minimal`, `bold`, `elegant` |
| `--features` | Comma-separated optional modules | `reviews,coupons,wishlist,brands,social-boost` |
| `-y, --yes` | Accept defaults / flags non-interactively | Flag |
| `-h, --help` | Show CLI help text | Flag |

---

## 📦 Monorepo & Development

This package is part of the [StoreBlocks Monorepo](https://github.com/parvejme24/store-blocks):

- `packages/cli`: Scaffolder CLI engine (`create-storeblocks`)
- `packages/module-kit`: Module manifest validator and dependency resolver
- `templates/`: Clean production-tested templates for backend, frontend, modules, and themes

---

## 📄 License

MIT © [Md Parvej](https://github.com/parvejme24)
