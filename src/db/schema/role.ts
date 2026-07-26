import { pgEnum } from "drizzle-orm/pg-core";

export const accountRoleEnum = pgEnum("account_role", [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "KITCHEN",
]);