import { ClientSession } from "mongoose";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Wishlist } from "../../../shared/wishlist.schemas.js";
import { WishlistRepository } from "../../wishlist.repository.js";
import { WishlistModel, IWishlistDocument } from "./wishlist.model.js";

function toWishlist(doc: IWishlistDocument): Wishlist {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    userId: obj.userId,
    productIds: (obj.productIds || []).map((id: any) => id.toString()),
    updatedAt: obj.updatedAt
  };
}

export class MongoWishlistRepository implements WishlistRepository {
  async findByUserId(userId: string, tx?: TxContext): Promise<Wishlist | null> {
    const session = tx as ClientSession | undefined;
    const doc = await WishlistModel.findOne({ userId }).session(session || null);
    if (!doc) return null;
    return toWishlist(doc);
  }

  async save(wishlist: Wishlist, tx?: TxContext): Promise<Wishlist> {
    const session = tx as ClientSession | undefined;
    const doc = await WishlistModel.findOneAndUpdate(
      { userId: wishlist.userId },
      { $set: { productIds: wishlist.productIds } },
      { upsert: true, new: true, session: session || null }
    );
    return toWishlist(doc!);
  }
}

export const wishlistRepository = new MongoWishlistRepository();

