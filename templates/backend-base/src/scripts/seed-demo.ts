import { connectDatabase, disconnectDatabase } from "../db/connection.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

interface DemoCategory {
  name: string;
  slug: string;
  description: string;
  order: number;
}

interface DemoProduct {
  name: string;
  slug: string;
  description: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  currency: string;
  sku: string;
  stock: number;
  categorySlug: string;
}

const DEMO_CATEGORIES: DemoCategory[] = [
  {
    name: "Electronics & Gadgets",
    slug: "electronics",
    description: "Cutting-edge gadgets, audio devices, and smart hardware.",
    order: 1
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    description: "Modern apparel, minimal footwear, and versatile accessories.",
    order: 2
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Ceramics, home decor, and contemporary lifestyle accents.",
    order: 3
  },
  {
    name: "Beauty & Cosmetics",
    slug: "beauty",
    description: "Natural organic skincare, wellness serums, and botanical essentials.",
    order: 4
  }
];

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    description: "Studio-grade wireless over-ear headphones with active noise cancellation and 40h battery.",
    priceMinor: 1450000,
    compareAtPriceMinor: 1650000,
    currency: "BDT",
    sku: "ELEC-WNC-01",
    stock: 45,
    categorySlug: "electronics"
  },
  {
    name: "Minimalist Canvas Backpack",
    slug: "minimalist-canvas-backpack",
    description: "Weather-resistant waxed canvas backpack with padded 16-inch laptop compartment.",
    priceMinor: 320000,
    compareAtPriceMinor: 380000,
    currency: "BDT",
    sku: "FASH-MCB-02",
    stock: 80,
    categorySlug: "fashion"
  },
  {
    name: "Organic Cotton Casual T-Shirt",
    slug: "organic-cotton-casual-t-shirt",
    description: "100% GOTS certified organic combed ring-spun cotton everyday crewneck.",
    priceMinor: 125000,
    currency: "BDT",
    sku: "FASH-OCT-03",
    stock: 150,
    categorySlug: "fashion"
  },
  {
    name: "Smart Health Tracking Band",
    slug: "smart-health-tracking-band",
    description: "OLED touch display with 24/7 heart-rate, SpO2, sleep tracking, and 5ATM water resistance.",
    priceMinor: 480000,
    compareAtPriceMinor: 550000,
    currency: "BDT",
    sku: "ELEC-SHT-04",
    stock: 60,
    categorySlug: "electronics"
  },
  {
    name: "Ceramic Artisan Coffee Mug",
    slug: "ceramic-artisan-coffee-mug",
    description: "Handcrafted 350ml ceramic coffee mug with matte reactive glaze and heat-retaining clay.",
    priceMinor: 85000,
    currency: "BDT",
    sku: "HOME-CAC-05",
    stock: 120,
    categorySlug: "home-living"
  },
  {
    name: "Ergonomic Aluminium Laptop Stand",
    slug: "ergonomic-aluminium-laptop-stand",
    description: "Foldable precision-machined aluminium laptop riser with silicone ventilation pads.",
    priceMinor: 290000,
    currency: "BDT",
    sku: "ELEC-ALS-06",
    stock: 35,
    categorySlug: "electronics"
  },
  {
    name: "Botanical Moisturizing Facial Serum",
    slug: "botanical-moisturizing-facial-serum",
    description: "Hyaluronic acid and vitamin C concentrated plant serum for radiant barrier support.",
    priceMinor: 185000,
    compareAtPriceMinor: 220000,
    currency: "BDT",
    sku: "BEAU-BMF-07",
    stock: 95,
    categorySlug: "beauty"
  },
  {
    name: "Premium Scented Soy Candle",
    slug: "premium-scented-soy-candle",
    description: "Natural hand-poured soy wax candle infused with sandalwood, amber, and bergamot.",
    priceMinor: 110000,
    currency: "BDT",
    sku: "HOME-PSC-08",
    stock: 70,
    categorySlug: "home-living"
  }
];

async function seedMongo() {
  logger.info("Seeding MongoDB demo catalog and settings...");

  // Category Model
  const CategorySchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, default: "" },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
  );
  const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);

  // Product Model
  const ProductSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, default: "" },
      priceMinor: { type: Number, required: true },
      compareAtPriceMinor: { type: Number, default: null },
      currency: { type: String, default: "BDT" },
      sku: { type: String, required: true, unique: true },
      stock: { type: Number, default: 0 },
      categoryIds: { type: [String], default: [] },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
  );
  const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);

  // Settings Model
  const SettingsSchema = new mongoose.Schema(
    {
      storeName: { type: String, default: "StoreBlocks Demo Store" },
      storeDescription: { type: String, default: "Modular modern e-commerce storefront" },
      email: { type: String, default: "store@example.com" },
      phone: { type: String, default: "+8801700000000" },
      address: { type: String, default: "Dhaka, Bangladesh" },
      currency: { type: String, default: "BDT" },
      socialLinks: { type: Map, of: String, default: {} }
    },
    { timestamps: true }
  );
  const SettingsModel = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

  // 1. Seed Categories
  const categoryIdMap = new Map<string, string>();
  for (const cat of DEMO_CATEGORIES) {
    let existing = await CategoryModel.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await CategoryModel.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: true
      });
      logger.info({ name: cat.name, slug: cat.slug }, "Created category");
    }
    categoryIdMap.set(cat.slug, existing._id.toString());
  }

  // 2. Seed Products
  for (const prod of DEMO_PRODUCTS) {
    const existing = await ProductModel.findOne({ sku: prod.sku });
    if (!existing) {
      const catId = categoryIdMap.get(prod.categorySlug);
      await ProductModel.create({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        priceMinor: prod.priceMinor,
        compareAtPriceMinor: prod.compareAtPriceMinor || null,
        currency: prod.currency,
        sku: prod.sku,
        stock: prod.stock,
        categoryIds: catId ? [catId] : [],
        isActive: true
      });
      logger.info({ name: prod.name, sku: prod.sku }, "Created product");
    }
  }

  // 3. Seed Settings
  const settingsCount = await SettingsModel.countDocuments();
  if (settingsCount === 0) {
    await SettingsModel.create({
      storeName: "StoreBlocks Demo Store",
      storeDescription: "Modular modern e-commerce storefront",
      email: "support@storeblocks.dev",
      phone: "+8801700000000",
      address: "Gulshan-2, Dhaka 1212, Bangladesh",
      currency: "BDT",
      socialLinks: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com"
      }
    });
    logger.info("Created store settings");
  }
}

async function seedPostgres() {
  logger.info("Seeding PostgreSQL demo catalog and settings...");
  const { pool } = await import("../db/postgresql/connection.js");
  if (!pool) throw new Error("PostgreSQL pool connection not established.");

  // 1. Seed Categories
  const categoryIdMap = new Map<string, string>();
  for (const cat of DEMO_CATEGORIES) {
    const check = await pool.query("SELECT id FROM categories WHERE slug = $1", [cat.slug]);
    let id: string;
    if (check.rows.length === 0) {
      const inserted = await pool.query(
        `INSERT INTO categories (name, slug, description, "order", is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [cat.name, cat.slug, cat.description, cat.order, true]
      );
      id = inserted.rows[0].id;
      logger.info({ name: cat.name, slug: cat.slug }, "Created category");
    } else {
      id = check.rows[0].id;
    }
    categoryIdMap.set(cat.slug, id);
  }

  // 2. Seed Products
  for (const prod of DEMO_PRODUCTS) {
    const check = await pool.query("SELECT id FROM products WHERE sku = $1", [prod.sku]);
    if (check.rows.length === 0) {
      const catId = categoryIdMap.get(prod.categorySlug);
      const catIdsJson = JSON.stringify(catId ? [catId] : []);
      await pool.query(
        `INSERT INTO products (name, slug, description, price_minor, compare_at_price_minor, currency, sku, stock, category_ids, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
        [
          prod.name,
          prod.slug,
          prod.description,
          prod.priceMinor,
          prod.compareAtPriceMinor || null,
          prod.currency,
          prod.sku,
          prod.stock,
          catIdsJson,
          true
        ]
      );
      logger.info({ name: prod.name, sku: prod.sku }, "Created product");
    }
  }

  // 3. Seed Settings
  const checkSettings = await pool.query("SELECT id FROM settings WHERE id = 'default'");
  if (checkSettings.rows.length === 0) {
    await pool.query(
      `INSERT INTO settings (id, store_name, store_description, email, phone, address, currency, social_links)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        "StoreBlocks Demo Store",
        "Modular modern e-commerce storefront",
        "support@storeblocks.dev",
        "+8801700000000",
        "Gulshan-2, Dhaka 1212, Bangladesh",
        "BDT",
        JSON.stringify({ facebook: "https://facebook.com", instagram: "https://instagram.com" })
      ]
    );
    logger.info("Created store settings");
  }
}

async function main() {
  logger.info("Starting demo dataset seeding...");
  await connectDatabase();

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await seedMongo();
    } else {
      await seedPostgres();
    }

    console.log("\n==================================================");
    console.log(" Demo Catalog & Settings Seeded Successfully");
    console.log("==================================================");
    console.log(` Categories: ${DEMO_CATEGORIES.length} entries`);
    console.log(` Products:   ${DEMO_PRODUCTS.length} entries`);
    console.log(" Currency:   BDT (Bangladeshi Taka ৳)");
    console.log("==================================================\n");
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  logger.error({ err }, "Demo catalog seeding failed");
  process.exit(1);
});
