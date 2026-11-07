import crypto from "node:crypto";
import {
  PaymentAdapter,
  OrderForPayment,
  PaymentInitiation,
  PaymentVerification,
  PaymentCallbackRequest,
  PaymentWebhookRequest
} from "../../../../packages/module-kit/src/index.js";

export class SSLCommerzPaymentAdapter implements PaymentAdapter {
  readonly id = "sslcommerz";
  readonly label = "SSLCommerz";

  private readonly storeId: string;
  private readonly storePasswd: string;
  private readonly isSandbox: boolean;
  private readonly baseUrl: string;

  constructor() {
    this.storeId = process.env.SSLC_STORE_ID || "";
    this.storePasswd = process.env.SSLC_STORE_PASSWD || "";
    this.isSandbox = process.env.SSLC_IS_SANDBOX !== "false";
    this.baseUrl = this.isSandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";
  }

  async initiate(order: OrderForPayment): Promise<PaymentInitiation> {
    const transactionId = `SSLC-${order.id}-${crypto.randomBytes(4).toString("hex")}`;
    const amountInMajor = (order.amountMinor / 100).toFixed(2);

    const postData = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      total_amount: amountInMajor,
      currency: order.currency,
      tran_id: transactionId,
      success_url: order.callbackUrls.successUrl,
      fail_url: order.callbackUrls.failUrl,
      cancel_url: order.callbackUrls.cancelUrl,
      ipn_url: `${process.env.BACKEND_URL || "http://localhost:4000"}/api/payments/webhook/sslcommerz`,
      cus_name: order.customer.name,
      cus_email: order.customer.email,
      cus_add1: order.shippingAddress.street,
      cus_city: order.shippingAddress.city,
      cus_postcode: order.shippingAddress.postalCode || "1200",
      cus_country: order.shippingAddress.country,
      cus_phone: order.customer.phone || "01700000000",
      shipping_method: "NO",
      product_name: `Order #${order.orderNumber}`,
      product_category: "General",
      product_profile: "general"
    });

    const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postData.toString()
    });

    const data: any = await response.json();

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        kind: "redirect",
        url: data.GatewayPageURL,
        transactionId
      };
    }

    throw new Error(`SSLCommerz initiation failed: ${data.failedreason || "Unknown error"}`);
  }

  async verify(req: PaymentCallbackRequest): Promise<PaymentVerification> {
    const body = req.body as Record<string, any>;
    const valId = body.val_id;

    if (!valId) {
      return {
        transactionId: body.tran_id || "",
        orderId: body.value_a || "",
        status: "failed",
        amountMinor: Math.round(Number(body.amount || 0) * 100),
        currency: body.currency || "BDT",
        raw: body
      };
    }

    const validationUrl = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePasswd}&v=1&format=json`;

    const response = await fetch(validationUrl);
    const data: any = await response.json();

    const isSuccess = data.status === "VALID" || data.status === "VALIDATED";

    return {
      transactionId: data.tran_id || body.tran_id,
      orderId: data.value_a || "",
      status: isSuccess ? "paid" : "failed",
      amountMinor: Math.round(Number(data.amount || 0) * 100),
      currency: data.currency || "BDT",
      raw: data
    };
  }

  async handleWebhook(req: PaymentWebhookRequest): Promise<PaymentVerification | null> {
    const body = req.body as Record<string, any>;
    if (!body || !body.val_id) {
      return null;
    }

    return this.verify({
      params: {},
      query: {},
      body,
      headers: req.headers
    });
  }
}

export const sslcommerzAdapter = new SSLCommerzPaymentAdapter();

