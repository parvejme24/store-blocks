import { stripeAdapter } from "./stripe.adapter.js";
import { registerPaymentAdapter } from "../core/payments.registry.js";

// Register this gateway in the payment registry
registerPaymentAdapter(stripeAdapter);

export * from "./stripe.adapter.js";

