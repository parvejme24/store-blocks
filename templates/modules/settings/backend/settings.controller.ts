import { Request, Response, NextFunction } from "express";
import { SettingsService } from "./settings.service.js";

export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.service.getSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.service.updateSettings(req.body);
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  };
}

