import { AppError, ErrorCodes, Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery
} from "../shared/products.schemas.js";
import { ProductRepository } from "./products.repository.js";

export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getProducts(query: ProductQuery): Promise<Paginated<Product>> {
    return this.productRepo.findMany(query);
  }

  async getProductById(id: string, tx?: TxContext): Promise<Product> {
    const product = await this.productRepo.findById(id, tx);
    if (!product) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Product not found with id: ${id}`, 404);
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Product not found with slug: ${slug}`, 404);
    }
    return product;
  }

  async createProduct(input: CreateProductInput, tx?: TxContext): Promise<Product> {
    const [existingSlug, existingSku] = await Promise.all([
      this.productRepo.findBySlug(input.slug),
      this.productRepo.findBySku(input.sku)
    ]);

    if (existingSlug) {
      throw new AppError(
        ErrorCodes.PRODUCT_CONFLICT,
        `A product with slug '${input.slug}' already exists`,
        409
      );
    }

    if (existingSku) {
      throw new AppError(
        ErrorCodes.PRODUCT_CONFLICT,
        `A product with SKU '${input.sku}' already exists`,
        409
      );
    }

    return this.productRepo.create(input, tx);
  }

  async updateProduct(id: string, input: UpdateProductInput, tx?: TxContext): Promise<Product> {
    const existing = await this.productRepo.findById(id, tx);
    if (!existing) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Product not found with id: ${id}`, 404);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.productRepo.findBySlug(input.slug);
      if (slugConflict && slugConflict.id !== id) {
        throw new AppError(
          ErrorCodes.PRODUCT_CONFLICT,
          `A product with slug '${input.slug}' already exists`,
          409
        );
      }
    }

    if (input.sku && input.sku !== existing.sku) {
      const skuConflict = await this.productRepo.findBySku(input.sku);
      if (skuConflict && skuConflict.id !== id) {
        throw new AppError(
          ErrorCodes.PRODUCT_CONFLICT,
          `A product with SKU '${input.sku}' already exists`,
          409
        );
      }
    }

    const updated = await this.productRepo.update(id, input, tx);
    if (!updated) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Product not found with id: ${id}`, 404);
    }
    return updated;
  }

  async deleteProduct(id: string, tx?: TxContext): Promise<void> {
    const existing = await this.productRepo.findById(id, tx);
    if (!existing) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Product not found with id: ${id}`, 404);
    }

    const deleted = await this.productRepo.delete(id, tx);
    if (!deleted) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, `Could not delete product with id: ${id}`, 404);
    }
  }

  async decrementStock(id: string, qty: number, tx?: TxContext): Promise<void> {
    const success = await this.productRepo.decrementStock(id, qty, tx);
    if (!success) {
      throw new AppError(
        ErrorCodes.OUT_OF_STOCK,
        `Insufficient stock for product id '${id}'`,
        422
      );
    }
  }
}

