import { getCurrentUser, type AuthUserContext } from "./get-current-user";
import { AuthorizationError } from "./authorization-error";

export async function requireAuth(): Promise<AuthUserContext> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("Authentication required", 401);
  }

  if (!user.isActive) {
    throw new AuthorizationError("Account is inactive or disabled", 403);
  }

  return user;
}
