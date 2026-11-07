import nodemailer from "nodemailer";
import { Order } from "../../orders/shared/orders.schemas.js";

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor() {
    this.from = process.env.SMTP_FROM || "noreply@storeblocks.dev";

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendOrderConfirmation(order: Order): Promise<boolean> {
    if (!this.transporter) return false;

    const html = `
      <h2>Order Confirmation #${order.orderNumber}</h2>
      <p>Thank you for your order, ${order.customer.name}!</p>
      <p>Total: <strong>${(order.totalMinor / 100).toFixed(2)} ${order.currency}</strong></p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map((i) => `<li>${i.name} x ${i.quantity} — ${(i.subtotalMinor / 100).toFixed(2)}</li>`).join("")}
      </ul>
      <p>We will notify you once your order is processed.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: order.customer.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html
      });
      return true;
    } catch {
      return false;
    }
  }

  async sendStatusUpdate(order: Order): Promise<boolean> {
    if (!this.transporter) return false;

    const html = `
      <h2>Order Status Update #${order.orderNumber}</h2>
      <p>Dear ${order.customer.name},</p>
      <p>Your order status has been updated to: <strong>${order.status.toUpperCase()}</strong>.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: order.customer.email,
        subject: `Update on Order #${order.orderNumber}`,
        html
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();

