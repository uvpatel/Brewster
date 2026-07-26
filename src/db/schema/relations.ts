import { relations } from "drizzle-orm/_relations";
import { categories } from "./categories";
import { customers } from "./customers";
import { orderDiscounts, promotionProducts } from "./discounts";
import { restaurantTables } from "./floors";
import { kitchenTicketItems, kitchenTickets } from "./kitchen";
import { orderItems, orders } from "./orders";
import { paymentMethods, payments } from "./payments";
import { posSessions } from "./pos-sessions";
import { products } from "./products";
import { accounts, stores } from "./stores";
import { taxes } from "./taxes";

export const storesRelations = relations(stores, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  products: many(products),
  customers: many(customers),
  sessions: many(posSessions),
  orders: many(orders),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  store: one(stores, { fields: [accounts.storeId], references: [stores.id] }),
  openedSessions: many(posSessions, { relationName: "openedSessions" }),
  createdOrders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  tax: one(taxes, { fields: [products.taxId], references: [taxes.id] }),
  orderItems: many(orderItems),
  promotionProducts: many(promotionProducts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  session: one(posSessions, { fields: [orders.sessionId], references: [posSessions.id] }),
  table: one(restaurantTables, { fields: [orders.tableId], references: [restaurantTables.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  employee: one(accounts, { fields: [orders.employeeId], references: [accounts.id] }),
  items: many(orderItems),
  payments: many(payments),
  discounts: many(orderDiscounts),
  kitchenTickets: many(kitchenTickets),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  discounts: many(orderDiscounts),
  kitchenTicketItems: many(kitchenTicketItems),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  session: one(posSessions, { fields: [payments.sessionId], references: [posSessions.id] }),
  method: one(paymentMethods, {
    fields: [payments.paymentMethodId],
    references: [paymentMethods.id],
  }),
  processor: one(accounts, { fields: [payments.processedBy], references: [accounts.id] }),
}));
