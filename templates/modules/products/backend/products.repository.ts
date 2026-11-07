import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery
} from "../shared/products.schemas.js";

export interface ProductRepository {
  findMany(query: ProductQuery): Promise<Paginated<Product>>;
  findById(id: string, tx?: TxContext): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(input: CreateProductInput, tx?: TxContext): Promise<Product>;
  update(id: string, input: UpdateProductInput, tx?: TxContext): Promise<Product | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
  decrementStock(id: string, qty: number, tx?: TxContext): Promise<boolean>;
}

