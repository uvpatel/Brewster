import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, tableStatusEnum, updatedAt } from "./common";
import { stores } from "./stores";

export const floors = pgTable(
  "floors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("floors_store_name_unique").on(table.storeId, table.name)],
);

export const restaurantTables = pgTable(
  "restaurant_tables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    floorId: uuid("floor_id")
      .notNull()
      .references(() => floors.id, { onDelete: "cascade" }),
    tableNumber: varchar("table_number", { length: 30 }).notNull(),
    seats: integer("seats").default(1).notNull(),
    status: tableStatusEnum("status").default("AVAILABLE").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("restaurant_tables_floor_number_unique").on(table.floorId, table.tableNumber),
    check("restaurant_tables_seats_check", sql`${table.seats} > 0`),
  ],
);
