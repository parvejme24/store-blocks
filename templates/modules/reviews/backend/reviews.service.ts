import { AppError, ErrorCodes, Paginated, TxContext } from "../../../shared-base/src/index.js";
import { ProductRepository } from "../../products/backend/products.repository.js";
import {
  Review,
  ReviewQuery,
  CreateReviewInput
} from "../shared/reviews.schemas.js";
import { ReviewRepository } from "./reviews.repository.js";

export class ReviewService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async getReviews(query: ReviewQuery): Promise<Paginated<Review>> {
    return this.reviewRepo.findMany(query);
  }

  async getReviewById(id: string, tx?: TxContext): Promise<Review> {
    const review = await this.reviewRepo.findById(id, tx);
    if (!review) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Review not found with id: ${id}`, 404);
    }
    return review;
  }

  async createReview(
    userId: string,
    userName: string,
    input: CreateReviewInput,
    tx?: TxContext
  ): Promise<Review> {
    const product = await this.productRepo.findById(input.productId, tx);
    if (!product || !product.isActive) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, "Product not available for review", 404);
    }

    return this.reviewRepo.create(
      {
        productId: input.productId,
        userId,
        userName,
        rating: input.rating,
        comment: input.comment,
        isApproved: false // Requires admin approval per conventions
      },
      tx
    );
  }

  async setApproval(id: string, isApproved: boolean, tx?: TxContext): Promise<Review> {
    await this.getReviewById(id, tx);
    const updated = await this.reviewRepo.updateApproval(id, isApproved, tx);
    return updated!;
  }

  async deleteReview(id: string, tx?: TxContext): Promise<void> {
    await this.getReviewById(id, tx);
    await this.reviewRepo.delete(id, tx);
  }
}

