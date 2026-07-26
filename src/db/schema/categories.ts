import { boolean, integer, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./common";
import { stores } from "./stores";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 20 }),
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("categories_store_name_unique").on(table.storeId, table.name)],
);
