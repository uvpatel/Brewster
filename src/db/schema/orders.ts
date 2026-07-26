import { sql } from "drizzle-orm";
import { check, index, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, kitchenStatusEnum, money, orderStatusEnum, orderTypeEnum, quantity, updatedAt } from "./common";
import { customers } from "./customers";
import { restaurantTables } from "./floors";
import { posSessions } from "./pos-sessions";
import { products } from "./products";
import { accounts, stores } from "./stores";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => posSessions.id, { onDelete: "restrict" }),
    tableId: uuid("table_id").references(() => restaurantTables.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    orderType: orderTypeEnum("order_type").default("DINE_IN").notNull(),
    status: orderStatusEnum("status").default("DRAFT").notNull(),
    kitchenStatus: kitchenStatusEnum("kitchen_status").default("NOT_SENT").notNull(),
    subtotal: money("subtotal").default("0").notNull(),
    taxAmount: money("tax_amount").default("0").notNull(),
    discountAmount: money("discount_amount").default("0").notNull(),
    totalAmount: money("total_amount").default("0").notNull(),
    paidAmount: money("paid_amount").default("0").notNull(),
    notes: text("notes"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("orders_store_number_unique").on(table.storeId, table.orderNumber),
    index("orders_session_status_idx").on(table.sessionId, table.status),
    index("orders_table_status_idx").on(table.tableId, table.status),
    index("orders_created_at_idx").on(table.createdAt),
    check(
      "orders_amounts_check",
      sql`${table.subtotal} >= 0 AND ${table.taxAmount} >= 0 AND ${table.discountAmount} >= 0 AND ${table.totalAmount} >= 0 AND ${table.paidAmount} >= 0`,
    ),
    check(
      "orders_dine_in_table_check",
      sql`${table.orderType} <> 'DINE_IN' OR ${table.tableId} IS NOT NULL`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 150 }).notNull(),
    quantity: quantity("quantity").notNull(),
    unitPrice: money("unit_price").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
    taxAmount: money("tax_amount").default("0").notNull(),
    discountAmount: money("discount_amount").default("0").notNull(),
    lineSubtotal: money("line_subtotal").notNull(),
    lineTotal: money("line_total").notNull(),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
    check("order_items_amount_check", sql`${table.unitPrice} >= 0 AND ${table.lineTotal} >= 0`),
  ],
);
