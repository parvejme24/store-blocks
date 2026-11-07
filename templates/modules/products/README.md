# products

Product catalog: CRUD, variants, stock, images, search, filters, and sorting.

- **Type:** core (always installed)
- **Depends on:** —
- **Uses:** storage (exactly one adapter)
- **Database variants:** MongoDB (Mongoose), PostgreSQL (Drizzle)

## Environment Variables

None of its own. Requires the database connection from `backend-base` and the selected storage adapter's variables.

## Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List with pagination, filters, sorting |
| GET | `/api/products/slug/:slug` | Public | Get one product by slug |
| GET | `/api/products/:id` | Admin | Get one product by ID |
| POST | `/api/products` | Admin | Create |
| PATCH | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Delete (also deletes images from storage) |

### Query parameters for `GET /api/products`

| Param | Example | Notes |
|---|---|---|
| `page` | `2` | Starts at 1 |
| `limit` | `20` | Max 100 |
| `sort` | `-createdAt`, `priceMinor` | `-` for descending |
| `q` | `cotton shirt` | Text search on name and description |
| `category` | `shirts` | Category slug |
| `brand` | `aarong` | Requires the brands module |
| `minPrice`, `maxPrice` | `50000` | Minor units |
| `inStock` | `true` | |

## Error Codes

| Code | Status | When |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | No product with that ID or slug |
| `PRODUCT_CONFLICT` | 409 | Slug or SKU already exists |
| `OUT_OF_STOCK` | 422 | Not enough stock for the requested quantity |

## Data Model

| Field | Type | Notes |
|---|---|---|
| `id` | string | ObjectId (MongoDB) or uuid (PostgreSQL), always a string outside the repository |
| `name` | string | |
| `slug` | string | Unique |
| `description` | string | |
| `priceMinor` | integer | Price in minor units |
| `compareAtPriceMinor` | integer \| null | Original price for showing discounts |
| `currency` | string | ISO 4217, e.g. `BDT` |
| `sku` | string | Unique |
| `stock` | integer | Never negative |
| `images` | StoredFile[] | `{ key, provider, alt }` |
| `variants` | Variant[] | Size, color, own SKU, stock, and price override |
| `categoryIds` | string[] | |
| `isActive` | boolean | Hidden from the storefront when false |
| `createdAt`, `updatedAt` | Date | |

## Frontend

- **Storefront (Server Components):** product listing, product detail page
- **RTK Query slice:** `productsApi` (admin CRUD)
- **Admin:** Products list, create/edit form with the storage uploader
- **Components:** `ProductCard`, `ProductGallery`, `ProductFilters`, `VariantPicker`
