import crypto from "node:crypto";
import {
  PaymentAdapter,
  OrderForPayment,
  PaymentInitiation,
  PaymentVerification,
  PaymentCallbackRequest,
  PaymentWebhookRequest
} from "../../../../packages/module-kit/src/index.js";

export class CodPaymentAdapter implements PaymentAdapter {
  readonly id = "cod";
  readonly label = "Cash on Delivery";

  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const transactionId = `COD-${order.id}-${crypto.randomBytes(4).toString("hex")}`;
    return {
      kind: "pending",
      transactionId
    };
  }

  async verify(req: PaymentCallbackRequest): Promise<PaymentVerification> {
    return {
      transactionId: (req.body as any)?.transactionId || `COD-${Date.now()}`,
      orderId: (req.body as any)?.orderId || "",
      status: "pending",
      amountMinor: (req.body as any)?.amountMinor || 0,
      currency: "BDT",
      raw: req.body
    };
  }

  async handleWebhook(_req: PaymentWebhookRequest): Promise<PaymentVerification | null> {
    return null;
  }
}

export const codAdapter = new CodPaymentAdapter();

