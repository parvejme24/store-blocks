import { ClientSession } from "mongoose";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Cart } from "../../../shared/cart.schemas.js";
import { CartRepository } from "../../cart.repository.js";
import { CartModel, ICartDocument } from "./cart.model.js";

function toCart(doc: ICartDocument): Cart {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    userId: obj.userId,
    guestToken: obj.guestToken,
    items: (obj.items || []).map((i: any) => ({
      productId: i.productId,
      variantId: i.variantId,
      name: i.name,
      sku: i.sku,
      priceMinor: i.priceMinor,
      quantity: i.quantity,
      subtotalMinor: i.subtotalMinor,
      image: i.image
    })),
    subtotalMinor: obj.subtotalMinor || 0,
    currency: obj.currency || "BDT",
    updatedAt: obj.updatedAt
  };
}

export class MongoCartRepository implements CartRepository {
  async findByUserId(userId: string, tx?: TxContext): Promise<Cart | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CartModel.findOne({ userId }).session(session || null);
    if (!doc) return null;
    return toCart(doc);
  }

  async findByGuestToken(guestToken: string, tx?: TxContext): Promise<Cart | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CartModel.findOne({ guestToken }).session(session || null);
    if (!doc) return null;
    return toCart(doc);
  }

  async save(cart: Cart, tx?: TxContext): Promise<Cart> {
    const session = tx as ClientSession | undefined;
    const updateData: Record<string, any> = {
      items: cart.items,
      subtotalMinor: cart.subtotalMinor,
      currency: cart.currency
    };
    if (cart.userId) updateData.userId = cart.userId;
    if (cart.guestToken) updateData.guestToken = cart.guestToken;

    const filter: Record<string, any> = cart.userId
      ? { userId: cart.userId }
      : { guestToken: cart.guestToken };

    const doc = await CartModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { upsert: true, new: true, session: session || null }
    );

    return toCart(doc!);
  }

  async deleteByGuestToken(guestToken: string, tx?: TxContext): Promise<void> {
    const session = tx as ClientSession | undefined;
    await CartModel.deleteOne({ guestToken }).session(session || null);
  }
}

export const cartRepository = new MongoCartRepository();

