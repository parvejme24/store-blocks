import { TxContext } from "../../../shared-base/src/index.js";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQuery
} from "../shared/categories.schemas.js";

export interface CategoryRepository {
  findMany(query?: CategoryQuery): Promise<Category[]>;
  findById(id: string, tx?: TxContext): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(input: CreateCategoryInput, tx?: TxContext): Promise<Category>;
  update(id: string, input: UpdateCategoryInput, tx?: TxContext): Promise<Category | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

