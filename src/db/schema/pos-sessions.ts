import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, money, sessionStatusEnum, updatedAt } from "./common";
import { accounts, stores } from "./stores";

export const posSessions = pgTable(
  "pos_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    openedBy: uuid("opened_by")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    closedBy: uuid("closed_by").references(() => accounts.id, { onDelete: "restrict" }),
    sessionNumber: varchar("session_number", { length: 50 }).notNull(),
    openingCash: money("opening_cash").default("0").notNull(),
    closingCash: money("closing_cash"),
    expectedCash: money("expected_cash"),
    totalSales: money("total_sales").default("0").notNull(),
    totalOrders: integer("total_orders").default(0).notNull(),
    status: sessionStatusEnum("status").default("OPEN").notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closingNotes: text("closing_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("pos_sessions_store_number_unique").on(table.storeId, table.sessionNumber),
    index("pos_sessions_store_status_idx").on(table.storeId, table.status),
  ],
);
