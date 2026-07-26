import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { createdAt, money, unitEnum, updatedAt } from "./common";
import { stores } from "./stores";
import { taxes } from "./taxes";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    taxId: uuid("tax_id").references(() => taxes.id, { onDelete: "set null" }),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    sku: varchar("sku", { length: 80 }),
    price: money("price").notNull(),
    unitOfMeasure: unitEnum("unit_of_measure").default("PIECE").notNull(),
    isKitchenItem: boolean("is_kitchen_item").default(true).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("products_store_sku_unique").on(table.storeId, table.sku),
    index("products_store_category_idx").on(table.storeId, table.categoryId),
    check("products_price_check", sql`${table.price} >= 0`),
  ],
);
