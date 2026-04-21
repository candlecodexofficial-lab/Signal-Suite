import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, signupSchema, loginSchema } from "@shared/schema";
import { seedDatabase } from "./seed";
import { hashPassword, verifyPassword } from "./auth";
import type { User } from "@shared/schema";

function sanitizeUser(user: User) {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

async function isAdminUser(userId: number | undefined): Promise<boolean> {
  if (!userId) return false;
  const user = await storage.getUserById(userId);
  if (!user) return false;
  return getAdminEmails().includes(user.email.toLowerCase());
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const ok = await isAdminUser(req.session.userId);
  if (!ok) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

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

  app.get("/api/access/:indicatorId", async (req, res) => {
    const indicatorId = parseInt(req.params.indicatorId);
    if (!req.session.userId || isNaN(indicatorId)) {
      return res.json({ hasAccess: false });
    }
    const userOrders = await storage.getUserOrders(req.session.userId);
    for (const order of userOrders) {
      if (order.status !== "approved") continue;
      const items = await storage.getOrderItems(order.id);
      const match = items.find((i) => i.indicatorId === indicatorId);
      if (!match) continue;
      if (!order.approvedAt) {
        return res.json({ hasAccess: true });
      }
      const expiry = new Date(order.approvedAt);
      expiry.setMonth(expiry.getMonth() + match.duration);
      if (expiry.getTime() > Date.now()) {
        return res.json({ hasAccess: true });
      }
    }
    res.json({ hasAccess: false });
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
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.includes(user.email.toLowerCase());
    res.json({ ...sanitizeUser(user), isAdmin });
  });

  app.get("/api/auth/check-email", async (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await storage.getUserByEmail(email);
    if (user) {
      res.json({
        exists: true,
        hasPassword: !!user.passwordHash,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          mobileNumber: user.mobileNumber,
          tradingViewUsername: user.tradingViewUsername,
        },
      });
    } else {
      res.json({ exists: false, hasPassword: false });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }

    const existing = await storage.getUserByEmail(parsed.data.email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists. Please log in instead." });
    }

    const { password, ...profile } = parsed.data;
    const passwordHash = hashPassword(password);
    const user = await storage.createUser({ ...profile, passwordHash });
    req.session.userId = user.id;
    res.status(201).json({ user: sanitizeUser(user), isNewUser: true });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }

    const user = await storage.getUserByEmail(parsed.data.email);
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.userId = user.id;
    res.json({ user: sanitizeUser(user), isNewUser: false });
  });

  app.post("/api/auth/signup-or-login", async (_req, res) => {
    res.status(410).json({ message: "This endpoint is no longer supported. Use /api/auth/signup or /api/auth/login." });
  });

  app.post("/api/auth/update", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const parsed = insertUserSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    }
    const { email: _ignoredEmail, ...safeData } = parsed.data;
    const user = await storage.updateUser(req.session.userId, safeData);
    res.json(sanitizeUser(user));
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
      const version: "indicator" | "strategy" = item.version === "strategy" ? "strategy" : "indicator";

      const indicatorBase = parseFloat(indicator.price);
      const baseUnit =
        version === "strategy"
          ? indicatorBase === 0
            ? 499
            : Math.round(indicatorBase * 1.35)
          : indicatorBase;

      let price: string;
      if (isTrial) {
        price = version === "strategy" ? Math.round(5250 * 1.35).toFixed(2) : "5250";
      } else {
        price = (baseUnit * duration).toFixed(2);
      }

      serverTotal += parseFloat(price);

      validatedItems.push({
        indicatorId: indicator.id,
        duration,
        price,
        isTrial,
        version,
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

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const statusFilter = (req.query.status as string) || "all";
    const q = ((req.query.q as string) || "").trim().toLowerCase();

    const allOrders = await storage.getAllOrders();
    const allIndicators = await storage.getIndicators();
    const indicatorMap = new Map(allIndicators.map((i) => [i.id, i]));

    const enriched = await Promise.all(
      allOrders.map(async (order) => {
        const buyer = await storage.getUserById(order.userId);
        const items = await storage.getOrderItems(order.id);
        const enrichedItems = items.map((item) => {
          const indicator = indicatorMap.get(item.indicatorId);
          return {
            ...item,
            indicatorName: indicator?.name || "Unknown",
            indicatorSlug: indicator?.slug || "",
            indicatorCategory: indicator?.category || "",
          };
        });
        return {
          ...order,
          buyer: buyer
            ? {
                id: buyer.id,
                firstName: buyer.firstName,
                lastName: buyer.lastName,
                email: buyer.email,
                mobileNumber: buyer.mobileNumber,
                tradingViewUsername: buyer.tradingViewUsername,
              }
            : null,
          items: enrichedItems,
          itemCount: enrichedItems.length,
        };
      })
    );

    let filtered = enriched;
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    if (q) {
      filtered = filtered.filter((o) => {
        const buyerEmail = o.buyer?.email?.toLowerCase() || "";
        const tvUser = o.buyer?.tradingViewUsername?.toLowerCase() || "";
        const name = `${o.buyer?.firstName || ""} ${o.buyer?.lastName || ""}`.toLowerCase();
        return buyerEmail.includes(q) || tvUser.includes(q) || name.includes(q);
      });
    }

    res.json(filtered);
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order id" });
    const order = await storage.getOrderById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const buyer = await storage.getUserById(order.userId);
    const items = await storage.getOrderItems(order.id);
    const allIndicators = await storage.getIndicators();
    const indicatorMap = new Map(allIndicators.map((i) => [i.id, i]));
    const enrichedItems = items.map((item) => {
      const indicator = indicatorMap.get(item.indicatorId);
      return {
        ...item,
        indicatorName: indicator?.name || "Unknown",
        indicatorSlug: indicator?.slug || "",
        indicatorCategory: indicator?.category || "",
      };
    });
    res.json({
      ...order,
      buyer: buyer
        ? {
            id: buyer.id,
            firstName: buyer.firstName,
            lastName: buyer.lastName,
            email: buyer.email,
            mobileNumber: buyer.mobileNumber,
            tradingViewUsername: buyer.tradingViewUsername,
          }
        : null,
      items: enrichedItems,
    });
  });

  app.post("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order id" });
    const { status } = req.body || {};
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const existing = await storage.getOrderById(id);
    if (!existing) return res.status(404).json({ message: "Order not found" });
    const approvedAt = status === "approved" ? new Date() : null;
    const updated = await storage.updateOrderStatus(id, status, approvedAt);
    res.json(updated);
  });

  return httpServer;
}
