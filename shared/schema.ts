import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tier: text("tier").notNull().default("premium"),
  price: text("price").notNull(),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  features: text("features").array().notNull(),
  winRate: text("win_rate"),
  avgReturn: text("avg_return"),
  totalTrades: text("total_trades"),
  trialDays: integer("trial_days").default(7),
  markets: text("markets").array(),
  bestTimeframes: text("best_timeframes").array(),
  signalLogic: text("signal_logic"),
  entryConditions: text("entry_conditions"),
  exitConditions: text("exit_conditions"),
  stopLossStrategy: text("stop_loss_strategy"),
  targetStrategy: text("target_strategy"),
  recommendedSettings: text("recommended_settings"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  mobileNumber: text("mobile_number").notNull(),
  tradingViewUsername: text("tradingview_username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: text("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  indicatorId: integer("indicator_id").notNull(),
  duration: integer("duration").notNull(),
  price: text("price").notNull(),
  isTrial: boolean("is_trial").default(false),
});

export const insertIndicatorSchema = createInsertSchema(indicators).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Please enter a valid mobile number").regex(/^[+]?[\d\s()-]+$/, "Invalid mobile number format"),
  tradingViewUsername: z.string().min(2, "TradingView username is required"),
});
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
