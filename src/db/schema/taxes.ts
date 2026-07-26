import { sql } from "drizzle-orm";
import { boolean, check, numeric, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./common";
import { stores } from "./stores";

export const taxes = pgTable(
  "taxes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
    isInclusive: boolean("is_inclusive").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("taxes_store_name_unique").on(table.storeId, table.name),
    check("taxes_percentage_check", sql`${table.percentage} >= 0 AND ${table.percentage} <= 100`),
  ],
);
