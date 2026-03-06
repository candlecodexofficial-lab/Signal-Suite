import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get("/api/indicators", async (_req, res) => {
    const indicators = await storage.getIndicators();
    res.json(indicators);
  });

  app.get("/api/indicators/:slug", async (req, res) => {
    const indicator = await storage.getIndicatorBySlug(req.params.slug);
    if (!indicator) {
      return res.status(404).json({ message: "Indicator not found" });
    }
    res.json(indicator);
  });

  app.post("/api/registrations", async (req, res) => {
    const parsed = insertRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }
    const registration = await storage.createRegistration(parsed.data);
    res.status(201).json(registration);
  });

  app.post("/api/orders", async (req, res) => {
    const { registrationId, status, totalAmount, items } = req.body;

    if (!registrationId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const order = await storage.createOrder({
      registrationId,
      status: status || "pending",
      totalAmount: totalAmount || "0",
    });

    for (const item of items) {
      await storage.createOrderItem({
        orderId: order.id,
        indicatorId: item.indicatorId,
        duration: item.duration,
        price: item.price || "0",
        isTrial: item.isTrial || false,
      });
    }

    res.status(201).json(order);
  });

  return httpServer;
}
