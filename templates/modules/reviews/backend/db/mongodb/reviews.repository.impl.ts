import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Review,
  ReviewQuery
} from "../../../shared/reviews.schemas.js";
import { ReviewRepository, CreateReviewData } from "../../reviews.repository.js";
import { ReviewModel, IReviewDocument } from "./reviews.model.js";

function toReview(doc: IReviewDocument): Review {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    productId: obj.productId,
    userId: obj.userId,
    userName: obj.userName,
    rating: obj.rating,
    comment: obj.comment,
    isApproved: obj.isApproved,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoReviewRepository implements ReviewRepository {
  async findMany(query: ReviewQuery): Promise<Paginated<Review>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IReviewDocument> = {};
    if (query.productId) {
      filter.productId = query.productId;
    }
    if (query.isApproved !== undefined) {
      filter.isApproved = query.isApproved;
    }

    const [docs, total] = await Promise.all([
      ReviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReviewModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toReview(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Review | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ReviewModel.findById(id).session(session || null);
    if (!doc) return null;
    return toReview(doc);
  }

  async create(data: CreateReviewData, tx?: TxContext): Promise<Review> {
    const session = tx as ClientSession | undefined;
    const [doc] = await ReviewModel.create([data], { session: session || undefined });
    return toReview(doc!);
  }

  async updateApproval(id: string, isApproved: boolean, tx?: TxContext): Promise<Review | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ReviewModel.findByIdAndUpdate(
      id,
      { $set: { isApproved } },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toReview(doc);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await ReviewModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(res);
  }
}

export const reviewRepository = new MongoReviewRepository();

