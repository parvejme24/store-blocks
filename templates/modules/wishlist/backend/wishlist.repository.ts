import { TxContext } from "../../../shared-base/src/index.js";
import { Wishlist } from "../shared/wishlist.schemas.js";

export interface WishlistRepository {
  findByUserId(userId: string, tx?: TxContext): Promise<Wishlist | null>;
  save(wishlist: Wishlist, tx?: TxContext): Promise<Wishlist>;
}

