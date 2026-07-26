import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { bookingStatusEnum, createdAt, updatedAt } from "./common";
import { restaurantTables } from "./floors";
import { accounts, stores } from "./stores";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("customers_store_phone_idx").on(table.storeId, table.phone),
    index("customers_store_email_idx").on(table.storeId, table.email),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    tableId: uuid("table_id").references(() => restaurantTables.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 150 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    guestCount: integer("guest_count").notNull(),
    bookingAt: timestamp("booking_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").default(60).notNull(),
    status: bookingStatusEnum("status").default("PENDING").notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("bookings_store_date_idx").on(table.storeId, table.bookingAt),
    index("bookings_table_date_idx").on(table.tableId, table.bookingAt),
    check("bookings_guest_count_check", sql`${table.guestCount} > 0`),
    check("bookings_duration_check", sql`${table.durationMinutes} > 0`),
  ],
);
