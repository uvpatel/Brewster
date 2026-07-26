import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, quantity, ticketStatusEnum, updatedAt } from "./common";
import { orderItems, orders } from "./orders";
import { products } from "./products";
import { accounts } from "./stores";

export const kitchenTickets = pgTable(
  "kitchen_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    ticketNumber: varchar("ticket_number", { length: 50 }).notNull(),
    sequenceNumber: integer("sequence_number").notNull(),
    status: ticketStatusEnum("status").default("TO_COOK").notNull(),
    sentBy: uuid("sent_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("kitchen_tickets_order_sequence_unique").on(table.orderId, table.sequenceNumber),
    uniqueIndex("kitchen_tickets_number_unique").on(table.ticketNumber),
    index("kitchen_tickets_status_sent_idx").on(table.status, table.sentAt),
  ],
);

export const kitchenTicketItems = pgTable(
  "kitchen_ticket_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kitchenTicketId: uuid("kitchen_ticket_id")
      .notNull()
      .references(() => kitchenTickets.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 150 }).notNull(),
    quantity: quantity("quantity").notNull(),
    status: ticketStatusEnum("status").default("TO_COOK").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("kitchen_ticket_items_ticket_idx").on(table.kitchenTicketId),
    check("kitchen_ticket_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);
