import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
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

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/auth/check-email", async (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await storage.getUserByEmail(email);
    if (user) {
      res.json({ exists: true, user: { firstName: user.firstName, lastName: user.lastName, username: user.username, mobileNumber: user.mobileNumber, tradingViewUsername: user.tradingViewUsername } });
    } else {
      res.json({ exists: false });
    }
  });

  app.post("/api/auth/signup-or-login", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }

    const existing = await storage.getUserByEmail(parsed.data.email);
    if (existing) {
      req.session.userId = existing.id;
      return res.json({ user: existing, isNewUser: false });
    }

    const user = await storage.createUser(parsed.data);
    req.session.userId = user.id;
    res.status(201).json({ user, isNewUser: true });
  });

  app.post("/api/auth/update", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const parsed = insertUserSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }
    const user = await storage.updateUser(req.session.userId, parsed.data);
    res.json(user);
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy(() => {});
    res.json({ message: "Logged out" });
  });

  app.get("/api/dashboard", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userOrders = await storage.getUserOrders(req.session.userId);
    const allIndicators = await storage.getIndicators();
    const indicatorMap = new Map(allIndicators.map(i => [i.id, i]));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        const enrichedItems = items.map((item) => {
          const indicator = indicatorMap.get(item.indicatorId);
          let daysRemaining: number | null = null;
          let accessStatus: "pending" | "active" | "expired" | "rejected" = "pending";

          if (order.status === "rejected") {
            accessStatus = "rejected";
          } else if (order.status === "approved" && order.approvedAt) {
            const approvedDate = new Date(order.approvedAt);
            const expiryDate = new Date(approvedDate);
            expiryDate.setMonth(expiryDate.getMonth() + item.duration);
            const now = new Date();
            const msRemaining = expiryDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
            accessStatus = daysRemaining > 0 ? "active" : "expired";
          } else if (order.status === "approved") {
            accessStatus = "active";
            daysRemaining = null;
          }

          return {
            ...item,
            indicatorName: indicator?.name || "Unknown",
            indicatorSlug: indicator?.slug || "",
            indicatorCategory: indicator?.category || "",
            daysRemaining,
            accessStatus,
          };
        });
        return { ...order, items: enrichedItems };
      })
    );

    res.json(ordersWithItems);
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    let serverTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const indicator = await storage.getIndicatorById(item.indicatorId);
      if (!indicator) {
        return res.status(400).json({ message: `Indicator ${item.indicatorId} not found` });
      }

      const duration = Math.max(1, Math.min(12, parseInt(item.duration) || 1));
      const isTrial = item.isTrial === true && indicator.tier === "premium";
      const price = isTrial ? "5250" : (parseFloat(indicator.price) * duration).toFixed(2);

      serverTotal += parseFloat(price);

      validatedItems.push({
        indicatorId: indicator.id,
        duration,
        price,
        isTrial,
      });
    }

    const order = await storage.createOrder({
      userId: req.session.userId,
      status: "pending",
      totalAmount: serverTotal.toFixed(2),
    });

    for (const vi of validatedItems) {
      await storage.createOrderItem({
        orderId: order.id,
        ...vi,
      });
    }

    res.status(201).json(order);
  });

  return httpServer;
}
