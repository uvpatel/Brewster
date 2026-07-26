// src/lib/auth/get-auth-user-id.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getAuthUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
}