import { 
  indicators, users, orders, orderItems,
  type Indicator, type InsertIndicator,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getIndicators(): Promise<Indicator[]>;
  getIndicatorBySlug(slug: string): Promise<Indicator | undefined>;
  getIndicatorById(id: number): Promise<Indicator | undefined>;
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [result] = await db.update(users).set(data).where(eq(users.id, id)).returning();
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

  async getUserOrders(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
}

export const storage = new DatabaseStorage();
