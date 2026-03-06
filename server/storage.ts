import { 
  indicators, registrations, orders, orderItems,
  type Indicator, type InsertIndicator,
  type Registration, type InsertRegistration,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getIndicators(): Promise<Indicator[]>;
  getIndicatorBySlug(slug: string): Promise<Indicator | undefined>;
  getIndicatorById(id: number): Promise<Indicator | undefined>;
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  async getIndicators(): Promise<Indicator[]> {
    return db.select().from(indicators);
  }

  async getIndicatorBySlug(slug: string): Promise<Indicator | undefined> {
    const [result] = await db.select().from(indicators).where(eq(indicators.slug, slug));
    return result;
  }

  async getIndicatorById(id: number): Promise<Indicator | undefined> {
    const [result] = await db.select().from(indicators).where(eq(indicators.id, id));
    return result;
  }

  async createIndicator(indicator: InsertIndicator): Promise<Indicator> {
    const [result] = await db.insert(indicators).values(indicator).returning();
    return result;
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [result] = await db.insert(registrations).values(registration).returning();
    return result;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [result] = await db.insert(orderItems).values(item).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
