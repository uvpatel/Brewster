import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, deliveryStatusEnum, receiptDeliveryTypeEnum, updatedAt } from "./common";
import { orders } from "./orders";
import { accounts } from "./stores";

export const receiptDeliveries = pgTable(
  "receipt_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    deliveryType: receiptDeliveryTypeEnum("delivery_type").notNull(),
    recipientEmail: varchar("recipient_email", { length: 255 }),
    status: deliveryStatusEnum("status").default("PENDING").notNull(),
    sentBy: uuid("sent_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("receipt_deliveries_order_idx").on(table.orderId),
    check(
      "receipt_deliveries_email_check",
      sql`${table.deliveryType} <> 'EMAIL' OR ${table.recipientEmail} IS NOT NULL`,
    ),
  ],
);
