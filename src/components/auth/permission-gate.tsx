"use client";

import * as React from "react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type AppRole,
  type Permission,
} from "@/lib/auth/permissions";

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  mode?: "any" | "all";
  role?: AppRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  mode = "any",
  role,
  fallback = null,
  children,
}: PermissionGateProps) {
  // If no role is available, return fallback
  if (!role) {
    return <>{fallback}</>;
  }

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(role, permission);
  } else if (permissions && permissions.length > 0) {
    if (mode === "all") {
      isAllowed = hasAllPermissions(role, permissions);
    } else {
      isAllowed = hasAnyPermission(role, permissions);
    }
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
