import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, money, paymentMethodTypeEnum, paymentStatusEnum, updatedAt } from "./common";
import { orders } from "./orders";
import { posSessions } from "./pos-sessions";
import { accounts, stores } from "./stores";

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    type: paymentMethodTypeEnum("type").notNull(),
    upiId: varchar("upi_id", { length: 255 }),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("payment_methods_store_name_unique").on(table.storeId, table.name),
    check("payment_methods_upi_check", sql`${table.type} <> 'UPI' OR ${table.upiId} IS NOT NULL`),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => posSessions.id, { onDelete: "restrict" }),
    paymentMethodId: uuid("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id, { onDelete: "restrict" }),
    processedBy: uuid("processed_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    amount: money("amount").notNull(),
    amountReceived: money("amount_received"),
    changeAmount: money("change_amount").default("0").notNull(),
    transactionReference: varchar("transaction_reference", { length: 255 }),
    status: paymentStatusEnum("status").default("PENDING").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("payments_order_status_idx").on(table.orderId, table.status),
    index("payments_session_idx").on(table.sessionId),
    check("payments_amount_check", sql`${table.amount} > 0 AND ${table.changeAmount} >= 0`),
  ],
);
