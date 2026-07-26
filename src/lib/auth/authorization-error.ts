export class AuthorizationError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}
