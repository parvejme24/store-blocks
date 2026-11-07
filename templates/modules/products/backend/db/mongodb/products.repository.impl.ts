import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery
} from "../../../shared/products.schemas.js";
import { ProductRepository } from "../../products.repository.js";
import { ProductModel, IProductDocument } from "./products.model.js";

function toProduct(doc: IProductDocument): Product {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    name: obj.name,
    slug: obj.slug,
    description: obj.description || "",
    priceMinor: obj.priceMinor,
    compareAtPriceMinor: obj.compareAtPriceMinor ?? null,
    currency: obj.currency,
    sku: obj.sku,
    stock: obj.stock,
    images: (obj.images || []).map((img: any) => ({
      key: img.key,
      provider: img.provider,
      alt: img.alt
    })),
    variants: (obj.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceMinor: v.priceMinor,
      stock: v.stock,
      attributes: v.attributes ? Object.fromEntries(v.attributes) : undefined
    })),
    categoryIds: (obj.categoryIds || []).map((c: any) => c.toString()),
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoProductRepository implements ProductRepository {
  async findMany(query: ProductQuery): Promise<Paginated<Product>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IProductDocument> = {};

    if (query.q) {
      filter.$text = { $search: query.q };
    }
    if (query.category) {
      filter.categoryIds = query.category;
    }
    if (query.inStock) {
      filter.stock = { $gt: 0 };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.priceMinor = {};
      if (query.minPrice !== undefined) filter.priceMinor.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.priceMinor.$lte = query.maxPrice;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort) {
      const isDesc = query.sort.startsWith("-");
      const field = isDesc ? query.sort.slice(1) : query.sort;
      sortOption = { [field]: isDesc ? -1 : 1 };
    }

    const [docs, total] = await Promise.all([
      ProductModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toProduct(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Product | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ProductModel.findById(id).session(session || null);
    if (!doc) return null;
    return toProduct(doc);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const doc = await ProductModel.findOne({ slug });
    if (!doc) return null;
    return toProduct(doc);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const doc = await ProductModel.findOne({ sku });
    if (!doc) return null;
    return toProduct(doc);
  }

  async create(input: CreateProductInput, tx?: TxContext): Promise<Product> {
    const session = tx as ClientSession | undefined;
    const [doc] = await ProductModel.create([input], { session: session || undefined });
    return toProduct(doc!);
  }

  async update(id: string, input: UpdateProductInput, tx?: TxContext): Promise<Product | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toProduct(doc);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const result = await ProductModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(result);
  }

  async decrementStock(id: string, qty: number, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const result = await ProductModel.updateOne(
      { _id: id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { session: session || null }
    );
    return result.modifiedCount > 0;
  }
}

export const productRepository = new MongoProductRepository();

