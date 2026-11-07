import { AppError, ErrorCodes, Paginated, TxContext, UnitOfWork } from "../../../shared-base/src/index.js";
import { ProductRepository } from "../../products/backend/products.repository.js";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  CheckoutInput,
  OrderQuery,
  OrderItem
} from "../shared/orders.schemas.js";
import { OrderRepository } from "./orders.repository.js";

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly uow: UnitOfWork
  ) {}

  async getOrders(query: OrderQuery): Promise<Paginated<Order>> {
    return this.orderRepo.findMany(query);
  }

  async getOrderById(id: string, tx?: TxContext): Promise<Order> {
    const order = await this.orderRepo.findById(id, tx);
    if (!order) {
      throw new AppError(ErrorCodes.ORDER_NOT_FOUND, `Order not found with id: ${id}`, 404);
    }
    return order;
  }

  async getOrderByOrderNumber(orderNumber: string, tx?: TxContext): Promise<Order> {
    const order = await this.orderRepo.findByOrderNumber(orderNumber, tx);
    if (!order) {
      throw new AppError(ErrorCodes.ORDER_NOT_FOUND, `Order not found with orderNumber: ${orderNumber}`, 404);
    }
    return order;
  }

  async checkout(input: CheckoutInput): Promise<Order> {
    if (!input.items || input.items.length === 0) {
      throw new AppError(ErrorCodes.CART_EMPTY, "Cannot checkout with empty items", 400);
    }

    return this.uow.run(async (tx) => {
      const orderItems: OrderItem[] = [];
      let subtotalMinor = 0;
      let currency = "BDT";

      for (const item of input.items) {
        const product = await this.productRepo.findById(item.productId, tx);
        if (!product || !product.isActive) {
          throw new AppError(
            ErrorCodes.PRODUCT_NOT_FOUND,
            `Product not available: ${item.productId}`,
            404
          );
        }

        currency = product.currency;
        let itemPrice = product.priceMinor;
        let itemSku = product.sku;
        let itemName = product.name;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new AppError(
              ErrorCodes.PRODUCT_NOT_FOUND,
              `Variant not found on product ${product.name}`,
              404
            );
          }
          if (variant.priceMinor !== undefined) {
            itemPrice = variant.priceMinor;
          }
          itemSku = variant.sku;
          itemName = `${product.name} (${variant.name})`;
        }

        // Atomically decrement stock
        const stockAvailable = await this.productRepo.decrementStock(product.id, item.quantity, tx);
        if (!stockAvailable) {
          throw new AppError(
            ErrorCodes.OUT_OF_STOCK,
            `Not enough stock for product: ${product.name}`,
            422
          );
        }

        const lineSubtotal = itemPrice * item.quantity;
        subtotalMinor += lineSubtotal;

        orderItems.push({
          productId: product.id,
          variantId: item.variantId,
          name: itemName,
          sku: itemSku,
          priceMinor: itemPrice,
          quantity: item.quantity,
          subtotalMinor: lineSubtotal
        });
      }

      // Shipping rate logic (standard flat rate 60 inside, 120 outside Dhaka, or 0 default)
      const shippingMinor = input.shippingAddress.city.toLowerCase().includes("dhaka") ? 6000 : 12000;
      const discountMinor = 0;
      const totalMinor = subtotalMinor + shippingMinor - discountMinor;

      const orderNumber = `SB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      return this.orderRepo.create(
        {
          orderNumber,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: input.paymentMethod,
          customer: input.customer,
          shippingAddress: input.shippingAddress,
          items: orderItems,
          subtotalMinor,
          shippingMinor,
          discountMinor,
          totalMinor,
          currency,
          notes: input.notes
        },
        tx
      );
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, tx?: TxContext): Promise<Order> {
    const existing = await this.getOrderById(id, tx);
    const updated = await this.orderRepo.updateStatus(id, status, tx);
    if (!updated) {
      throw new AppError(ErrorCodes.ORDER_NOT_FOUND, `Order not found with id: ${id}`, 404);
    }
    return updated;
  }

  async markOrderPaid(
    orderId: string,
    transactionId: string,
    tx?: TxContext
  ): Promise<Order> {
    const existing = await this.getOrderById(orderId, tx);
    if (existing.paymentStatus === "paid") {
      return existing; // idempotent
    }

    const updated = await this.orderRepo.updatePaymentStatus(orderId, "paid", transactionId, tx);
    if (updated && updated.status === "pending") {
      await this.orderRepo.updateStatus(orderId, "confirmed", tx);
    }
    return updated!;
  }
}

