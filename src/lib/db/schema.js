import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Users — customers & admins.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Services — laundry service catalogue.
 */
export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerKg: real("price_per_kg").notNull(),
  minWeight: real("min_weight").notNull().default(1),
  estimatedHours: integer("estimated_hours").notNull().default(24),
  isActive: integer("is_active").notNull().default(1),
});

/**
 * Orders.
 */
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // LDR-YYYYMMDD-XXX
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  weight: real("weight").notNull(),
  totalPrice: real("total_price").notNull(),
  specialNotes: text("special_notes"),
  pickupAddress: text("pickup_address"),
  pickupDatetime: integer("pickup_datetime"),
  deliveryAddress: text("delivery_address"),
  deliveryDatetime: integer("delivery_datetime"),
  status: text("status").notNull().default("pending"),
  // "pending"|"received"|"washing"|"drying"|"ironing"|"ready"|"delivered"
  paymentStatus: text("payment_status").notNull().default("unpaid"), // "unpaid" | "paid"
  paymentMethod: text("payment_method"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Order photos (before/after) stored on IMGBB.
 */
export const orderPhotos = sqliteTable("order_photos", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  imgbbUrl: text("imgbb_url").notNull(),
  imgbbDeleteUrl: text("imgbb_delete_url"),
  photoType: text("photo_type").notNull().default("before"), // "before" | "after"
  uploadedAt: integer("uploaded_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Status history timeline.
 */
export const orderStatusHistory = sqliteTable("order_status_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  status: text("status").notNull(),
  notes: text("notes"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Loyalty point ledger.
 */
export const loyaltyTransactions = sqliteTable("loyalty_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  orderId: text("order_id").references(() => orders.id),
  points: integer("points").notNull(),
  description: text("description"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
