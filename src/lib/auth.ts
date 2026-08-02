import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index";
import * as schema from "@/db/schema";
import { eq, count } from "drizzle-orm";

const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

const getTrustedOrigins = () => {
  const origins = new Set<string>([
    "https://cafe-two-chi.vercel.app",
    "http://localhost:3000",
  ]);
  if (process.env.BETTER_AUTH_URL) origins.add(process.env.BETTER_AUTH_URL);
  if (process.env.NEXT_PUBLIC_APP_URL) origins.add(process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  return Array.from(origins);
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "default_secret_key_change_in_production",
  baseURL: getBaseUrl(),
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (!user || !user.email) return;

            // Check if account already exists for this authUserId or email
            const [existingAccount] = await db
              .select()
              .from(schema.accounts)
              .where(eq(schema.accounts.email, user.email));

            if (existingAccount) {
              if (!existingAccount.authUserId) {
                await db
                  .update(schema.accounts)
                  .set({ authUserId: user.id })
                  .where(eq(schema.accounts.id, existingAccount.id));
              }
              return;
            }

            // Find or create default store
            let [defaultStore] = await db
              .select()
              .from(schema.stores)
              .limit(1);

            if (!defaultStore) {
              const [newStore] = await db
                .insert(schema.stores)
                .values({
                  name: "Default Cafe Store",
                })
                .returning();
              defaultStore = newStore;
            }

            if (defaultStore) {
              const [{ totalAccounts }] = await db
                .select({ totalAccounts: count() })
                .from(schema.accounts);

              const role = Number(totalAccounts) === 0 ? "ADMIN" : "CASHIER";

              await db.insert(schema.accounts).values({
                authUserId: user.id,
                storeId: defaultStore.id,
                name: user.name || "Cafe Employee",
                email: user.email,
                role,
                status: "ACTIVE",
                isActive: true,
              });
            }
          } catch (err) {
            console.error("Error auto-creating account for user:", err);
          }
        },
      },
    },
  },
});

// Runtime checks to aid debugging in deployment
if (process.env.NODE_ENV === "production") {
  if (!process.env.BETTER_AUTH_SECRET) {
    // eslint-disable-next-line no-console
    console.error(
      "[auth] BETTER_AUTH_SECRET is not set. Authentication may fail in production."
    );
  }

  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    // eslint-disable-next-line no-console
    console.error(
      "[auth] BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is not set. Set your app public URL for proper auth redirects."
    );
  }
}