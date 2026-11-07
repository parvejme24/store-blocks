import { sslcommerzAdapter } from "./sslcommerz.adapter.js";
import { registerPaymentAdapter } from "../core/payments.registry.js";

// Register this gateway in the payment registry
registerPaymentAdapter(sslcommerzAdapter);

export * from "./sslcommerz.adapter.js";

