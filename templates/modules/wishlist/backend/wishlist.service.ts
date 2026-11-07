import crypto from "node:crypto";
import { AppError, ErrorCodes, TxContext } from "../../../shared-base/src/index.js";
import { ProductRepository } from "../../products/backend/products.repository.js";
import { Wishlist } from "../shared/wishlist.schemas.js";
import { WishlistRepository } from "./wishlist.repository.js";

export class WishlistService {
  constructor(
    private readonly wishlistRepo: WishlistRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async getWishlist(userId: string, tx?: TxContext): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findByUserId(userId, tx);
    if (!wishlist) {
      wishlist = {
        id: crypto.randomUUID(),
        userId,
        productIds: [],
        updatedAt: new Date()
      };
      await this.wishlistRepo.save(wishlist, tx);
    }
    return wishlist;
  }

  async toggleItem(userId: string, productId: string, tx?: TxContext): Promise<Wishlist> {
    const product = await this.productRepo.findById(productId, tx);
    if (!product) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, "Product not found", 404);
    }

    const wishlist = await this.getWishlist(userId, tx);
    const index = wishlist.productIds.indexOf(productId);

    if (index > -1) {
      wishlist.productIds.splice(index, 1);
    } else {
      wishlist.productIds.push(productId);
    }

    wishlist.updatedAt = new Date();
    return this.wishlistRepo.save(wishlist, tx);
  }

  async clearWishlist(userId: string, tx?: TxContext): Promise<Wishlist> {
    const wishlist = await this.getWishlist(userId, tx);
    wishlist.productIds = [];
    wishlist.updatedAt = new Date();
    return this.wishlistRepo.save(wishlist, tx);
  }
}

