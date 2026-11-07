import { Router, Request, Response } from "express";
import { notificationService } from "./notifications.service.js";

export function createNotificationsRouter(): Router {
  const router = Router();

  router.post("/test", async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const dummyOrder: any = {
      orderNumber: "TEST-1001",
      customer: { name: "Store Admin", email: email || "admin@example.com" },
      totalMinor: 50000,
      currency: "BDT",
      status: "confirmed",
      items: [{ name: "Test Sample Product", quantity: 1, subtotalMinor: 50000 }]
    };

    const sent = await notificationService.sendOrderConfirmation(dummyOrder);
    res.status(200).json({
      success: true,
      data: { sent, message: sent ? "Test email sent!" : "SMTP not configured" }
    });
  });

  return router;
}

export const notificationsRouter = createNotificationsRouter();

