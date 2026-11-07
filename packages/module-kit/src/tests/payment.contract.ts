import { PaymentAdapter } from "../contracts/payment.js";

export interface PaymentTestFixture {
  adapter: PaymentAdapter;
}

export function describePaymentContract(
  fixture: PaymentTestFixture,
  testRunner: {
    describe: (name: string, fn: () => void) => void;
    it: (name: string, fn: () => void | Promise<void>) => void;
    expect: any;
  }
) {
  const { describe, it, expect } = testRunner;

  describe(`Payment Gateway Contract: ${fixture.adapter.id}`, () => {
    it("has valid id and label identifiers", () => {
      expect(typeof fixture.adapter.id).toBe("string");
      expect(fixture.adapter.id.length).toBeGreaterThan(0);
      expect(typeof fixture.adapter.label).toBe("string");
      expect(fixture.adapter.label.length).toBeGreaterThan(0);
    });

    it("initiates payment session returning status kind and transaction reference", async () => {
      const result = await fixture.adapter.initiate({
        id: "ord_test_12345",
        orderNumber: "SB-1001",
        amountMinor: 50000,
        currency: "BDT",
        customer: {
          name: "Test Customer",
          email: "customer@example.com",
          phone: "+8801700000000"
        },
        shippingAddress: {
          street: "Road 10, House 5",
          city: "Dhaka",
          postalCode: "1212",
          country: "Bangladesh"
        },
        callbackUrls: {
          successUrl: "http://localhost:3000/order/success",
          failUrl: "http://localhost:3000/order/fail",
          cancelUrl: "http://localhost:3000/order/cancel"
        }
      });

      expect(result).toBeDefined();
      expect(["redirect", "pending"]).toContain(result.kind);
      expect(typeof result.transactionId).toBe("string");
      expect(result.transactionId.length).toBeGreaterThan(0);
    });
  });
}
