import Stripe from "stripe";
import {
  PaymentAdapter,
  OrderForPayment,
  PaymentInitiation,
  PaymentVerification,
  PaymentCallbackRequest,
  PaymentWebhookRequest
} from "../../../../packages/module-kit/src/index.js";

export class StripePaymentAdapter implements PaymentAdapter {
  readonly id = "stripe";
  readonly label = "Stripe";

  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia" as any
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: `Order #${order.orderNumber}`
            },
            unit_amount: order.amountMinor
          },
          quantity: 1
        }
      ],
      mode: "payment",
      customer_email: order.customer.email,
      client_reference_id: order.id,
      success_url: order.callbackUrls.successUrl,
      cancel_url: order.callbackUrls.cancelUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber
      }
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe checkout session URL");
    }

    return {
      kind: "redirect",
      url: session.url,
      transactionId: session.id
    };
  }

  async verify(req: PaymentCallbackRequest): Promise<PaymentVerification> {
    const sessionId = (req.query?.session_id as string) || (req.body as any)?.sessionId;
    if (!sessionId) {
      throw new Error("Stripe session_id is required for verification");
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === "paid";

    return {
      transactionId: session.id,
      orderId: session.metadata?.orderId || session.client_reference_id || "",
      status: isPaid ? "paid" : "pending",
      amountMinor: session.amount_total || 0,
      currency: (session.currency || "usd").toUpperCase(),
      raw: session
    };
  }

  async handleWebhook(req: PaymentWebhookRequest): Promise<PaymentVerification | null> {
    const sig = req.headers["stripe-signature"];
    if (!sig || !this.webhookSecret) {
      return null;
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig as string,
        this.webhookSecret
      );
    } catch {
      return null;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        transactionId: session.id,
        orderId: session.metadata?.orderId || session.client_reference_id || "",
        status: session.payment_status === "paid" ? "paid" : "pending",
        amountMinor: session.amount_total || 0,
        currency: (session.currency || "usd").toUpperCase(),
        raw: session
      };
    }

    return null;
  }
}

export const stripeAdapter = new StripePaymentAdapter();

