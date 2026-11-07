import { Request, Response, NextFunction } from "express";
import { ShippingService } from "./shipping.service.js";

export class ShippingController {
  constructor(private readonly service: ShippingService) {}

  listZones = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zones = await this.service.getZones();
      res.status(200).json({
        success: true,
        data: zones
      });
    } catch (error) {
      next(error);
    }
  };

  calculate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.calculateRate(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  createZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zone = await this.service.createZone(req.body);
      res.status(201).json({
        success: true,
        data: zone
      });
    } catch (error) {
      next(error);
    }
  };

  updateZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zone = await this.service.updateZone(req.params.id!, req.body);
      res.status(200).json({
        success: true,
        data: zone
      });
    } catch (error) {
      next(error);
    }
  };

  deleteZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteZone(req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

