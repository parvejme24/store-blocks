import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { getAllPaymentAdapters, getPaymentAdapter } from "./payments.registry.js";
import { orderRepository } from "../../orders/backend/db/mongodb/orders.repository.impl.js";
import { OrderService } from "../../orders/backend/orders.service.js";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import { unitOfWork } from "../../../backend-base/src/db/mongodb/unit-of-work.js";

const initiateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required")
});

export function createPaymentsRouter(): Router {
  const router = Router();
  const orderService = new OrderService(orderRepository, productRepository, unitOfWork);

  router.get("/methods", (_req: Request, res: Response): void => {
    const methods = getAllPaymentAdapters().map((adapter) => ({
      id: adapter.id,
      label: adapter.label
    }));
    res.status(200).json({
      success: true,
      data: methods
    });
  });

  router.post(
    "/initiate",
    validate({ body: initiateSchema }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { orderId, paymentMethod } = req.body;
        const adapter = getPaymentAdapter(paymentMethod);
        if (!adapter) {
          throw new AppError(
            ErrorCodes.PAYMENT_METHOD_NOT_SUPPORTED,
            `Unsupported payment method: ${paymentMethod}`,
            400
          );
        }

        const order = await orderService.getOrderById(orderId);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

        const result = await adapter.initiate({
          id: order.id,
          orderNumber: order.orderNumber,
          amountMinor: order.totalMinor,
          currency: order.currency,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone
          },
          shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country
          },
          callbackUrls: {
            successUrl: `${frontendUrl}/order/success?orderId=${order.id}`,
            failUrl: `${frontendUrl}/order/failed?orderId=${order.id}`,
            cancelUrl: `${frontendUrl}/order/cancelled?orderId=${order.id}`
          }
        });

        res.status(200).json({
          success: true,
          data: result
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/verify/:gateway",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const gateway = req.params.gateway;
        const adapter = getPaymentAdapter(gateway);
        if (!adapter) {
          throw new AppError(
            ErrorCodes.PAYMENT_METHOD_NOT_SUPPORTED,
            `Unknown payment gateway: ${gateway}`,
            400
          );
        }

        const verification = await adapter.verify({
          params: req.params as Record<string, string>,
          query: req.query as Record<string, any>,
          body: req.body,
          headers: req.headers as Record<string, any>
        });

        if (verification.status === "paid") {
          await orderService.markOrderPaid(verification.orderId, verification.transactionId);
        }

        res.status(200).json({
          success: true,
          data: verification
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export const paymentsRouter = createPaymentsRouter();

