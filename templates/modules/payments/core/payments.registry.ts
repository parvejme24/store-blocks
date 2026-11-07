import { PaymentAdapter } from "../../../../packages/module-kit/src/index.js";

const adapters = new Map<string, PaymentAdapter>();

export function registerPaymentAdapter(adapter: PaymentAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getPaymentAdapter(id: string): PaymentAdapter | undefined {
  return adapters.get(id);
}

export function getAllPaymentAdapters(): PaymentAdapter[] {
  return Array.from(adapters.values());
}

