import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  discountSourceEnum,
  discountTypeEnum,
  money,
  promotionScopeEnum,
  quantity,
  updatedAt,
} from "./common";
import { customers } from "./customers";
import { orderItems, orders } from "./orders";
import { products } from "./products";
import { accounts, stores } from "./stores";

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 50 }).notNull(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: money("discount_value").notNull(),
    minimumOrderAmount: money("minimum_order_amount").default("0").notNull(),
    maximumDiscountAmount: money("maximum_discount_amount"),
    usageLimit: integer("usage_limit"),
    usageLimitPerCustomer: integer("usage_limit_per_customer"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("coupons_store_code_unique").on(table.storeId, table.code),
    check("coupons_dates_check", sql`${table.endsAt} > ${table.startsAt}`),
    check("coupons_value_check", sql`${table.discountValue} > 0`),
  ],
);

export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    scope: promotionScopeEnum("scope").notNull(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: money("discount_value").notNull(),
    minimumQuantity: quantity("minimum_quantity"),
    minimumOrderAmount: money("minimum_order_amount"),
    maximumDiscountAmount: money("maximum_discount_amount"),
    priority: integer("priority").default(0).notNull(),
    isStackable: boolean("is_stackable").default(false).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("promotions_store_active_idx").on(table.storeId, table.isActive),
    check("promotions_dates_check", sql`${table.endsAt} > ${table.startsAt}`),
    check("promotions_value_check", sql`${table.discountValue} > 0`),
  ],
);

export const promotionProducts = pgTable(
  "promotion_products",
  {
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.promotionId, table.productId] })],
);

export const orderDiscounts = pgTable(
  "order_discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "cascade" }),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    promotionId: uuid("promotion_id").references(() => promotions.id, { onDelete: "set null" }),
    source: discountSourceEnum("source").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: money("discount_value").notNull(),
    discountAmount: money("discount_amount").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("order_discounts_order_idx").on(table.orderId),
    check("order_discounts_amount_check", sql`${table.discountAmount} >= 0`),
  ],
);

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "restrict" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    redeemedBy: uuid("redeemed_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    discountAmount: money("discount_amount").notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("coupon_redemptions_order_unique").on(table.orderId),
    index("coupon_redemptions_coupon_customer_idx").on(table.couponId, table.customerId),
  ],
);
