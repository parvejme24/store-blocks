import { eq, and, sql, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  OrderQuery
} from "../../../shared/orders.schemas.js";
import { OrderRepository, CreateOrderData } from "../../orders.repository.js";
import { orders, OrderRow } from "./orders.schema.js";

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status as OrderStatus,
    paymentStatus: row.paymentStatus as PaymentStatus,
    paymentMethod: row.paymentMethod,
    transactionId: row.transactionId || undefined,
    customer: row.customer,
    shippingAddress: row.shippingAddress,
    items: row.items,
    subtotalMinor: row.subtotalMinor,
    shippingMinor: row.shippingMinor,
    discountMinor: row.discountMinor,
    totalMinor: row.totalMinor,
    currency: row.currency,
    notes: row.notes || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: OrderQuery): Promise<Paginated<Order>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(orders.status, query.status));
    }
    if (query.paymentStatus) {
      conditions.push(eq(orders.paymentStatus, query.paymentStatus));
    }
    if (query.q) {
      conditions.push(
        sql`(${orders.orderNumber} ILIKE ${`%${query.q}%`} OR ${orders.customer}->>'email' ILIKE ${`%${query.q}%`} OR ${orders.customer}->>'name' ILIKE ${`%${query.q}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      client.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      client.select({ count: sql<number>`count(*)` }).from(orders).where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToOrder),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Order | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(orders).where(eq(orders.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToOrder(row);
  }

  async findByOrderNumber(orderNumber: string, tx?: TxContext): Promise<Order | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToOrder(row);
  }

  async create(data: CreateOrderData, tx?: TxContext): Promise<Order> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(orders)
      .values({
        orderNumber: data.orderNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        customer: data.customer,
        shippingAddress: data.shippingAddress,
        items: data.items,
        subtotalMinor: data.subtotalMinor,
        shippingMinor: data.shippingMinor,
        discountMinor: data.discountMinor,
        totalMinor: data.totalMinor,
        currency: data.currency,
        notes: data.notes
      })
      .returning();

    return rowToOrder(rows[0]!);
  }

  async updateStatus(id: string, status: OrderStatus, tx?: TxContext): Promise<Order | null> {
    const client = this.resolveClient(tx);
    const rows = await client
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToOrder(row);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    transactionId?: string,
    tx?: TxContext
  ): Promise<Order | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      paymentStatus,
      updatedAt: new Date()
    };
    if (transactionId) {
      updateValues.transactionId = transactionId;
    }

    const rows = await client
      .update(orders)
      .set(updateValues)
      .where(eq(orders.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToOrder(row);
  }
}

