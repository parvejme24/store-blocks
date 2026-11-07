import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { CartService, CartIdentifier } from "./cart.service.js";

function getCartIdentifier(req: any, res: Response): CartIdentifier {
  if (req.user?.id) {
    return { userId: req.user.id };
  }

  let guestToken = req.cookies?.guestToken || req.headers["x-guest-token"];
  if (!guestToken) {
    guestToken = crypto.randomUUID();
    res.cookie("guestToken", guestToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  return { guestToken };
}

export class CartController {
  constructor(private readonly service: CartService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getCartIdentifier(req, res);
      const cart = await this.service.getCart(id);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getCartIdentifier(req, res);
      const cart = await this.service.addItem(id, req.body);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getCartIdentifier(req, res);
      const { productId, variantId, quantity } = req.body;
      const cart = await this.service.updateItemQuantity(id, productId, variantId, quantity);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };

  clear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getCartIdentifier(req, res);
      const cart = await this.service.clearCart(id);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };

  merge = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { guestToken } = req.body;
      const cart = await this.service.mergeGuestCart(userId, guestToken);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };
}

