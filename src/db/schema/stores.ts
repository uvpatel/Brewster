import { boolean, index, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { accountRoleEnum, createdAt, recordStatusEnum, updatedAt } from "./common";

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    address: text("address"),
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata").notNull(),
    receiptPrefix: varchar("receipt_prefix", { length: 20 }).default("ORD").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("stores_name_idx").on(table.name)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: varchar("auth_user_id", { length: 255 }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    role: accountRoleEnum("role").default("CASHIER").notNull(),
    status: recordStatusEnum("status").default("ACTIVE").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("accounts_email_unique").on(table.email),
    uniqueIndex("accounts_auth_user_id_unique").on(table.authUserId),
    index("accounts_store_idx").on(table.storeId),
  ],
);
