export interface OrderForPayment {
  id: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  callbackUrls: {
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
  };
}

export type PaymentInitiation =
  | { kind: "redirect"; url: string; transactionId: string }
  | { kind: "pending"; transactionId: string }; // e.g. Cash on Delivery

export interface PaymentVerification {
  transactionId: string;
  orderId: string;
  status: "paid" | "failed" | "cancelled" | "pending";
  amountMinor: number;
  currency: string;
  raw: unknown; // stored for audit; never logged in full
}

export interface PaymentCallbackRequest {
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export interface PaymentWebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  rawBody: Buffer | string;
  body: unknown;
}

export interface PaymentAdapter {
  readonly id: "cod" | "sslcommerz" | "stripe" | string;
  readonly label: string;

  initiate(order: OrderForPayment): Promise<PaymentInitiation>;
  verify(req: PaymentCallbackRequest): Promise<PaymentVerification>;
  handleWebhook(req: PaymentWebhookRequest): Promise<PaymentVerification | null>;
}

