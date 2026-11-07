import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  OrderQuery
} from "../../../shared/orders.schemas.js";
import { OrderRepository, CreateOrderData } from "../../orders.repository.js";
import { OrderModel, IOrderDocument } from "./orders.model.js";

function toOrder(doc: IOrderDocument): Order {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    orderNumber: obj.orderNumber,
    status: obj.status,
    paymentStatus: obj.paymentStatus,
    paymentMethod: obj.paymentMethod,
    transactionId: obj.transactionId,
    customer: {
      userId: obj.customer.userId,
      name: obj.customer.name,
      email: obj.customer.email,
      phone: obj.customer.phone
    },
    shippingAddress: {
      street: obj.shippingAddress.street,
      city: obj.shippingAddress.city,
      postalCode: obj.shippingAddress.postalCode,
      country: obj.shippingAddress.country
    },
    items: (obj.items || []).map((i: any) => ({
      productId: i.productId,
      variantId: i.variantId,
      name: i.name,
      sku: i.sku,
      priceMinor: i.priceMinor,
      quantity: i.quantity,
      subtotalMinor: i.subtotalMinor
    })),
    subtotalMinor: obj.subtotalMinor,
    shippingMinor: obj.shippingMinor,
    discountMinor: obj.discountMinor,
    totalMinor: obj.totalMinor,
    currency: obj.currency,
    notes: obj.notes,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoOrderRepository implements OrderRepository {
  async findMany(query: OrderQuery): Promise<Paginated<Order>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IOrderDocument> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    if (query.q) {
      filter.$or = [
        { orderNumber: { $regex: query.q, $options: "i" } },
        { "customer.email": { $regex: query.q, $options: "i" } },
        { "customer.name": { $regex: query.q, $options: "i" } }
      ];
    }

    const [docs, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toOrder(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Order | null> {
    const session = tx as ClientSession | undefined;
    const doc = await OrderModel.findById(id).session(session || null);
    if (!doc) return null;
    return toOrder(doc);
  }

  async findByOrderNumber(orderNumber: string, tx?: TxContext): Promise<Order | null> {
    const session = tx as ClientSession | undefined;
    const doc = await OrderModel.findOne({ orderNumber }).session(session || null);
    if (!doc) return null;
    return toOrder(doc);
  }

  async create(data: CreateOrderData, tx?: TxContext): Promise<Order> {
    const session = tx as ClientSession | undefined;
    const [doc] = await OrderModel.create([data], { session: session || undefined });
    return toOrder(doc!);
  }

  async updateStatus(id: string, status: OrderStatus, tx?: TxContext): Promise<Order | null> {
    const session = tx as ClientSession | undefined;
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toOrder(doc);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    transactionId?: string,
    tx?: TxContext
  ): Promise<Order | null> {
    const session = tx as ClientSession | undefined;
    const updateObj: Record<string, any> = { paymentStatus };
    if (transactionId) {
      updateObj.transactionId = transactionId;
    }
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toOrder(doc);
  }
}

export const orderRepository = new MongoOrderRepository();

