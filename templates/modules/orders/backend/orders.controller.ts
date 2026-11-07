import { Request, Response, NextFunction } from "express";
import { OrderService } from "./orders.service.js";

export class OrderController {
  constructor(private readonly service: OrderService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getOrders(req.query as any);
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
      const order = await this.service.getOrderById(req.params.id!);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.checkout(req.body);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.updateOrderStatus(req.params.id!, req.body.status);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };
}

