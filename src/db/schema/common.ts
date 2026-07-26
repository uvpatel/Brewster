import { numeric, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const money = (name: string) => numeric(name, { precision: 12, scale: 2 });
export const quantity = (name: string) => numeric(name, { precision: 10, scale: 3 });
export const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date());

export const accountRoleEnum = pgEnum("account_role", ["ADMIN", "CASHIER"]);
export const recordStatusEnum = pgEnum("record_status", ["ACTIVE", "ARCHIVED"]);
export const unitEnum = pgEnum("unit_of_measure", ["PIECE", "KG", "GRAM", "LITRE", "ML"]);
export const tableStatusEnum = pgEnum("restaurant_table_status", [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "INACTIVE",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);
export const sessionStatusEnum = pgEnum("pos_session_status", ["OPEN", "CLOSED"]);
export const orderTypeEnum = pgEnum("order_type", ["DINE_IN", "TAKEAWAY"]);
export const orderStatusEnum = pgEnum("order_status", [
  "DRAFT",
  "SENT_TO_KITCHEN",
  "PARTIALLY_PAID",
  "PAID",
  "CANCELLED",
]);
export const kitchenStatusEnum = pgEnum("kitchen_status", [
  "NOT_SENT",
  "TO_COOK",
  "PREPARING",
  "COMPLETED",
]);
export const discountTypeEnum = pgEnum("discount_type", ["PERCENTAGE", "FIXED"]);
export const promotionScopeEnum = pgEnum("promotion_scope", ["PRODUCT", "ORDER"]);
export const discountSourceEnum = pgEnum("discount_source", ["COUPON", "PROMOTION", "MANUAL"]);
export const paymentMethodTypeEnum = pgEnum("payment_method_type", ["CASH", "CARD", "UPI"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
]);
export const ticketStatusEnum = pgEnum("kitchen_ticket_status", [
  "TO_COOK",
  "PREPARING",
  "COMPLETED",
]);
export const receiptDeliveryTypeEnum = pgEnum("receipt_delivery_type", ["PRINT", "EMAIL"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["PENDING", "SENT", "FAILED"]);
