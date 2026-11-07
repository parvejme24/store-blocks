import { ClientSession } from "mongoose";
import { TxContext } from "../../../../../shared-base/src/index.js";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQuery
} from "../../../shared/categories.schemas.js";
import { CategoryRepository } from "../../categories.repository.js";
import { CategoryModel, ICategoryDocument } from "./categories.model.js";

function toCategory(doc: ICategoryDocument): Category {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    name: obj.name,
    slug: obj.slug,
    description: obj.description || "",
    parentId: obj.parentId ?? null,
    image: obj.image
      ? {
          key: obj.image.key,
          provider: obj.image.provider,
          alt: obj.image.alt
        }
      : null,
    order: obj.order || 0,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoCategoryRepository implements CategoryRepository {
  async findMany(query?: CategoryQuery): Promise<Category[]> {
    const filter: Record<string, any> = {};
    if (query?.parentId !== undefined) {
      filter.parentId = query.parentId;
    }
    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const docs = await CategoryModel.find(filter).sort({ order: 1, name: 1 }).lean();
    return docs.map((d: any) => toCategory(d));
  }

  async findById(id: string, tx?: TxContext): Promise<Category | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CategoryModel.findById(id).session(session || null);
    if (!doc) return null;
    return toCategory(doc);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const doc = await CategoryModel.findOne({ slug });
    if (!doc) return null;
    return toCategory(doc);
  }

  async create(input: CreateCategoryInput, tx?: TxContext): Promise<Category> {
    const session = tx as ClientSession | undefined;
    const [doc] = await CategoryModel.create([input], { session: session || undefined });
    return toCategory(doc!);
  }

  async update(id: string, input: UpdateCategoryInput, tx?: TxContext): Promise<Category | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CategoryModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toCategory(doc);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const result = await CategoryModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(result);
  }
}

export const categoryRepository = new MongoCategoryRepository();

