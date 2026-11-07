import { Request, Response, NextFunction } from "express";
import { CouponService } from "./coupons.service.js";

export class CouponController {
  constructor(private readonly service: CouponService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCoupons(req.query as any);
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
      const coupon = await this.service.getCouponById(req.params.id!);
      res.status(200).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.createCoupon(req.body);
      res.status(201).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.updateCoupon(req.params.id!, req.body);
      res.status(200).json({
        success: true,
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCoupon(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.applyCoupon(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

