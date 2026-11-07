import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  OrderQuery
} from "../shared/orders.schemas.js";

export interface CreateOrderData {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  customer: Order["customer"];
  shippingAddress: Order["shippingAddress"];
  items: Order["items"];
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  notes?: string;
}

export interface OrderRepository {
  findMany(query: OrderQuery): Promise<Paginated<Order>>;
  findById(id: string, tx?: TxContext): Promise<Order | null>;
  findByOrderNumber(orderNumber: string, tx?: TxContext): Promise<Order | null>;
  create(data: CreateOrderData, tx?: TxContext): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, tx?: TxContext): Promise<Order | null>;
  updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    transactionId?: string,
    tx?: TxContext
  ): Promise<Order | null>;
}

