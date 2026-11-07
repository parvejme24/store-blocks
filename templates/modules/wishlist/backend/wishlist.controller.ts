import { Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { WishlistService } from "./wishlist.service.js";

export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  get = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorCodes.UNAUTHENTICATED, "Login required to access wishlist", 401);
      }
      const wishlist = await this.service.getWishlist(userId);
      res.status(200).json({
        success: true,
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  };

  toggle = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorCodes.UNAUTHENTICATED, "Login required to update wishlist", 401);
      }
      const { productId } = req.body;
      const wishlist = await this.service.toggleItem(userId, productId);
      res.status(200).json({
        success: true,
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  };

  clear = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(ErrorCodes.UNAUTHENTICATED, "Login required to clear wishlist", 401);
      }
      const wishlist = await this.service.clearWishlist(userId);
      res.status(200).json({
        success: true,
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  };
}

