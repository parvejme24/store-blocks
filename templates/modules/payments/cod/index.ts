import { codAdapter } from "./cod.adapter.js";
import { registerPaymentAdapter } from "../core/payments.registry.js";

// Register this gateway in the payment registry
registerPaymentAdapter(codAdapter);

export * from "./cod.adapter.js";

