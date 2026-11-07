import { Request, Response, NextFunction } from "express";
import { BrandService } from "./brands.service.js";

export class BrandController {
  constructor(private readonly service: BrandService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getBrands(req.query as any);
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
      const brand = await this.service.getBrandById(req.params.id!);
      res.status(200).json({
        success: true,
        data: brand
      });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.getBrandBySlug(req.params.slug!);
      res.status(200).json({
        success: true,
        data: brand
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.createBrand(req.body);
      res.status(201).json({
        success: true,
        data: brand
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.updateBrand(req.params.id!, req.body);
      res.status(200).json({
        success: true,
        data: brand
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteBrand(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

