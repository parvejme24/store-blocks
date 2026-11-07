import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./reviews.service.js";

export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  list = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = { ...req.query };
      // Non-admins only see approved reviews
      if (req.user?.role !== "admin") {
        query.isApproved = true;
      }

      const result = await this.service.getReviews(query);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await this.service.getReviewById(req.params.id!);
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || "guest";
      const userName = req.user?.email ? req.user.email.split("@")[0] : "Verified Customer";
      const review = await this.service.createReview(userId, userName, req.body);
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isApproved } = req.body;
      const review = await this.service.setApproval(req.params.id!, isApproved);
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteReview(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

