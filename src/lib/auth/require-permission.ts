import { requireAuth } from "./require-auth";
import { hasPermission, hasAnyPermission, type Permission } from "./permissions";
import { AuthorizationError } from "./authorization-error";
import type { AuthUserContext } from "./get-current-user";

export async function requirePermission(
  permission: Permission,
): Promise<AuthUserContext> {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission)) {
    throw new AuthorizationError("You do not have permission to perform this action", 403);
  }

  return user;
}

export async function requireAnyPermission(
  permissions: Permission[],
): Promise<AuthUserContext> {
  const user = await requireAuth();

  if (!hasAnyPermission(user.role, permissions)) {
    throw new AuthorizationError("You do not have permission to perform this action", 403);
  }

  return user;
}
