import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./categories.service.js";

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getCategories(req.query as any);
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.getCategoryById(req.params.id!);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.getCategoryBySlug(req.params.slug!);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.updateCategory(req.params.id!, req.body);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCategory(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

