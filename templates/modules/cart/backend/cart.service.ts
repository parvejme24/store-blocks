import crypto from "node:crypto";
import { AppError, ErrorCodes, TxContext } from "../../../shared-base/src/index.js";
import { ProductRepository } from "../../products/backend/products.repository.js";
import {
  Cart,
  CartItem,
  AddToCartInput
} from "../shared/cart.schemas.js";
import { CartRepository } from "./cart.repository.js";

export interface CartIdentifier {
  userId?: string;
  guestToken?: string;
}

export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async getCart(id: CartIdentifier, tx?: TxContext): Promise<Cart> {
    let cart: Cart | null = null;

    if (id.userId) {
      cart = await this.cartRepo.findByUserId(id.userId, tx);
    } else if (id.guestToken) {
      cart = await this.cartRepo.findByGuestToken(id.guestToken, tx);
    }

    if (!cart) {
      cart = {
        id: crypto.randomUUID(),
        userId: id.userId,
        guestToken: id.userId ? undefined : id.guestToken || crypto.randomUUID(),
        items: [],
        subtotalMinor: 0,
        currency: "BDT",
        updatedAt: new Date()
      };
      await this.cartRepo.save(cart, tx);
    }

    return cart;
  }

  async addItem(id: CartIdentifier, input: AddToCartInput, tx?: TxContext): Promise<Cart> {
    const product = await this.productRepo.findById(input.productId, tx);
    if (!product || !product.isActive) {
      throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, "Product not available", 404);
    }

    let itemPrice = product.priceMinor;
    let itemSku = product.sku;
    let itemName = product.name;

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant) {
        throw new AppError(ErrorCodes.PRODUCT_NOT_FOUND, "Product variant not found", 404);
      }
      if (variant.priceMinor !== undefined) {
        itemPrice = variant.priceMinor;
      }
      itemSku = variant.sku;
      itemName = `${product.name} (${variant.name})`;
    }

    const cart = await this.getCart(id, tx);

    const existingIndex = cart.items.findIndex(
      (item) => item.productId === input.productId && item.variantId === input.variantId
    );

    if (existingIndex > -1) {
      const existing = cart.items[existingIndex]!;
      existing.quantity += input.quantity;
      existing.subtotalMinor = existing.priceMinor * existing.quantity;
    } else {
      const newItem: CartItem = {
        productId: product.id,
        variantId: input.variantId,
        name: itemName,
        sku: itemSku,
        priceMinor: itemPrice,
        quantity: input.quantity,
        subtotalMinor: itemPrice * input.quantity,
        image: product.images[0]?.key
      };
      cart.items.push(newItem);
    }

    cart.currency = product.currency;
    cart.subtotalMinor = cart.items.reduce((sum, item) => sum + item.subtotalMinor, 0);
    cart.updatedAt = new Date();

    return this.cartRepo.save(cart, tx);
  }

  async updateItemQuantity(
    id: CartIdentifier,
    productId: string,
    variantId: string | undefined,
    quantity: number,
    tx?: TxContext
  ): Promise<Cart> {
    const cart = await this.getCart(id, tx);

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      );
    } else {
      const item = cart.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (!item) {
        throw new AppError(ErrorCodes.NOT_FOUND, "Item not in cart", 404);
      }
      item.quantity = quantity;
      item.subtotalMinor = item.priceMinor * quantity;
    }

    cart.subtotalMinor = cart.items.reduce((sum, item) => sum + item.subtotalMinor, 0);
    cart.updatedAt = new Date();

    return this.cartRepo.save(cart, tx);
  }

  async clearCart(id: CartIdentifier, tx?: TxContext): Promise<Cart> {
    const cart = await this.getCart(id, tx);
    cart.items = [];
    cart.subtotalMinor = 0;
    cart.updatedAt = new Date();
    return this.cartRepo.save(cart, tx);
  }

  async mergeGuestCart(userId: string, guestToken: string, tx?: TxContext): Promise<Cart> {
    const guestCart = await this.cartRepo.findByGuestToken(guestToken, tx);
    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart({ userId }, tx);
    }

    const userCart = await this.getCart({ userId }, tx);

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (item) => item.productId === guestItem.productId && item.variantId === guestItem.variantId
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
        existing.subtotalMinor = existing.priceMinor * existing.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    userCart.subtotalMinor = userCart.items.reduce((sum, item) => sum + item.subtotalMinor, 0);
    userCart.updatedAt = new Date();

    await Promise.all([
      this.cartRepo.save(userCart, tx),
      this.cartRepo.deleteByGuestToken(guestToken, tx)
    ]);

    return userCart;
  }
}

