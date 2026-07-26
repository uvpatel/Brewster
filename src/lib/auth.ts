import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index";
import * as schema from "@/db/schema";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "default_secret_key_change_in_production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [admin()],

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
              await db.insert(schema.accounts).values({
                authUserId: user.id,
                storeId: defaultStore.id,
                name: user.name || "Cafe Employee",
                email: user.email,
                role: "CASHIER", // Safe default role
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