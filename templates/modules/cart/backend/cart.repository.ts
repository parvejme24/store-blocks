import { TxContext } from "../../../shared-base/src/index.js";
import { Cart } from "../shared/cart.schemas.js";

export interface CartRepository {
  findByUserId(userId: string, tx?: TxContext): Promise<Cart | null>;
  findByGuestToken(guestToken: string, tx?: TxContext): Promise<Cart | null>;
  save(cart: Cart, tx?: TxContext): Promise<Cart>;
  deleteByGuestToken(guestToken: string, tx?: TxContext): Promise<void>;
}

