import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Review,
  ReviewQuery
} from "../shared/reviews.schemas.js";

export interface CreateReviewData {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
}

export interface ReviewRepository {
  findMany(query: ReviewQuery): Promise<Paginated<Review>>;
  findById(id: string, tx?: TxContext): Promise<Review | null>;
  create(data: CreateReviewData, tx?: TxContext): Promise<Review>;
  updateApproval(id: string, isApproved: boolean, tx?: TxContext): Promise<Review | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

