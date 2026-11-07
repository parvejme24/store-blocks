import { Request, Response, NextFunction } from "express";
import { ProductService } from "./products.service.js";

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getProducts(req.query as any);
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
      const product = await this.service.getProductById(req.params.id!);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.getProductBySlug(req.params.slug!);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.updateProduct(req.params.id!, req.body);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteProduct(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

