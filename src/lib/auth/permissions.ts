export type AppRole = "ADMIN" | "MANAGER" | "CASHIER" | "KITCHEN";

export type Permission =
  | "dashboard:view"
  | "pos:use"
  | "orders:view"
  | "orders:update"
  | "orders:cancel"
  | "kitchen:view"
  | "kitchen:update"
  | "tables:view"
  | "tables:manage"
  | "bookings:view"
  | "bookings:manage"
  | "products:view"
  | "products:manage"
  | "customers:view"
  | "customers:manage"
  | "discounts:view"
  | "discounts:manage"
  | "payments:view"
  | "payments:create"
  | "payments:refund"
  | "sessions:view"
  | "sessions:manage"
  | "reports:view"
  | "employees:view"
  | "employees:manage"
  | "settings:manage";

export const rolePermissions: Record<AppRole, Permission[]> = {
  ADMIN: [
    "dashboard:view",
    "pos:use",
    "orders:view",
    "orders:update",
    "orders:cancel",
    "kitchen:view",
    "kitchen:update",
    "tables:view",
    "tables:manage",
    "bookings:view",
    "bookings:manage",
    "products:view",
    "products:manage",
    "customers:view",
    "customers:manage",
    "discounts:view",
    "discounts:manage",
    "payments:view",
    "payments:create",
    "payments:refund",
    "sessions:view",
    "sessions:manage",
    "reports:view",
    "employees:view",
    "employees:manage",
    "settings:manage",
  ],

  MANAGER: [
    "dashboard:view",
    "pos:use",
    "orders:view",
    "orders:update",
    "orders:cancel",
    "kitchen:view",
    "kitchen:update",
    "tables:view",
    "tables:manage",
    "bookings:view",
    "bookings:manage",
    "products:view",
    "products:manage",
    "customers:view",
    "customers:manage",
    "discounts:view",
    "discounts:manage",
    "payments:view",
    "payments:create",
    "payments:refund",
    "sessions:view",
    "sessions:manage",
    "reports:view",
    "employees:view",
    "employees:manage",
  ],

  CASHIER: [
    "dashboard:view",
    "pos:use",
    "orders:view",
    "orders:update",
    "tables:view",
    "bookings:view",
    "products:view",
    "customers:view",
    "discounts:view",
    "payments:view",
    "payments:create",
    "sessions:view",
    "sessions:manage",
  ],

  KITCHEN: [
    "kitchen:view",
    "kitchen:update",
    "orders:view",
  ],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: AppRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: AppRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
