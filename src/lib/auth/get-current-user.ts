import { headers } from "next/headers";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/index";
import { accounts, stores } from "@/db/schema";
import type { AppRole } from "./permissions";

export interface AuthUserContext {
  userId: string;
  employeeId: string;
  storeId: string;
  role: AppRole;
  isActive: boolean;
}

export async function getCurrentUser(): Promise<AuthUserContext | null> {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session || !session.user || !session.user.id) {
      return null;
    }

    const authUserId = session.user.id;
    const userEmail = session.user.email;

    // 1. Load user authorization record from database by authUserId
    let [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.authUserId, authUserId));

    // 2. Email fallback if authUserId was not set yet
    if (!account && userEmail) {
      const [accountByEmail] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.email, userEmail));

      if (accountByEmail) {
        account = accountByEmail;
        if (!account.authUserId) {
          await db
            .update(accounts)
            .set({ authUserId })
            .where(eq(accounts.id, account.id));
        }
      }
    }

    // 3. Auto-provision account if authenticated session exists but no account record found
    if (!account && userEmail) {
      let [defaultStore] = await db
        .select()
        .from(stores)
        .limit(1);

      if (!defaultStore) {
        const [newStore] = await db
          .insert(stores)
          .values({
            name: "Default Cafe Store",
          })
          .returning();
        defaultStore = newStore;
      }

      if (defaultStore) {
        const [{ totalAccounts }] = await db
          .select({ totalAccounts: count() })
          .from(accounts);

        // First user in store gets ADMIN, subsequent default to CASHIER
        const defaultRole: AppRole = Number(totalAccounts) === 0 ? "ADMIN" : "CASHIER";

        const [createdAccount] = await db
          .insert(accounts)
          .values({
            authUserId,
            storeId: defaultStore.id,
            name: session.user.name || "Cafe Employee",
            email: userEmail,
            role: defaultRole,
            status: "ACTIVE",
            isActive: true,
          })
          .returning();

        account = createdAccount;
      }
    }

    if (!account) {
      return null;
    }

    const isActive = account.status === "ACTIVE" && (account.isActive ?? true);

    return {
      userId: authUserId,
      employeeId: account.id,
      storeId: account.storeId,
      role: account.role as AppRole,
      isActive,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}
