import { AppError, ErrorCodes, TxContext } from "../../../shared-base/src/index.js";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQuery
} from "../shared/categories.schemas.js";
import { CategoryRepository } from "./categories.repository.js";

export class CategoryService {
  constructor(private readonly repo: CategoryRepository) {}

  async getCategories(query?: CategoryQuery): Promise<Category[]> {
    return this.repo.findMany(query);
  }

  async getCategoryById(id: string, tx?: TxContext): Promise<Category> {
    const category = await this.repo.findById(id, tx);
    if (!category) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Category not found with id: ${id}`, 404);
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findBySlug(slug);
    if (!category) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Category not found with slug: ${slug}`, 404);
    }
    return category;
  }

  async createCategory(input: CreateCategoryInput, tx?: TxContext): Promise<Category> {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw new AppError(ErrorCodes.CONFLICT, `A category with slug '${input.slug}' already exists`, 409);
    }

    if (input.parentId) {
      const parent = await this.repo.findById(input.parentId, tx);
      if (!parent) {
        throw new AppError(ErrorCodes.NOT_FOUND, `Parent category '${input.parentId}' not found`, 404);
      }
    }

    return this.repo.create(input, tx);
  }

  async updateCategory(id: string, input: UpdateCategoryInput, tx?: TxContext): Promise<Category> {
    const existing = await this.repo.findById(id, tx);
    if (!existing) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Category not found with id: ${id}`, 404);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.repo.findBySlug(input.slug);
      if (slugConflict && slugConflict.id !== id) {
        throw new AppError(ErrorCodes.CONFLICT, `A category with slug '${input.slug}' already exists`, 409);
      }
    }

    if (input.parentId) {
      if (input.parentId === id) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, "A category cannot be its own parent", 400);
      }
      const parent = await this.repo.findById(input.parentId, tx);
      if (!parent) {
        throw new AppError(ErrorCodes.NOT_FOUND, `Parent category '${input.parentId}' not found`, 404);
      }
    }

    const updated = await this.repo.update(id, input, tx);
    if (!updated) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Category not found with id: ${id}`, 404);
    }
    return updated;
  }

  async deleteCategory(id: string, tx?: TxContext): Promise<void> {
    const existing = await this.repo.findById(id, tx);
    if (!existing) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Category not found with id: ${id}`, 404);
    }

    const deleted = await this.repo.delete(id, tx);
    if (!deleted) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Could not delete category with id: ${id}`, 404);
    }
  }
}

