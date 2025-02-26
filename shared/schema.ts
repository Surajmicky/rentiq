import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  rentAmount: integer("rent_amount").notNull(),
  active: boolean("active").notNull().default(true),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  month: text("month").notNull(), // Format: YYYY-MM
  rentPaid: boolean("rent_paid").notNull().default(false),
  electricityReading: integer("electricity_reading"),
  electricityAmount: integer("electricity_amount"),
  electricityPaid: boolean("electricity_paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTenantSchema = createInsertSchema(tenants)
  .pick({
    name: true,
    mobile: true,
    rentAmount: true,
  })
  .extend({
    mobile: z.string().regex(/^91\d{10}$/, "Mobile number must start with 91 followed by 10 digits"),
  });

export const insertBillSchema = createInsertSchema(bills)
  .pick({
    tenantId: true,
    month: true,
    electricityReading: true,
  })
  .extend({
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
