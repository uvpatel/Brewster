import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
        baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://cafe-two-chi.vercel.app" || "http://localhost:3000",
    plugins: [
        adminClient()  
    ]
})
export const { signIn, signUp, signOut, useSession } = authClient;

// Client-side warning to help detect missing public base URL during deployment
if (typeof window !== "undefined") {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
        // eslint-disable-next-line no-console
        console.warn(
            "[auth-client] NEXT_PUBLIC_APP_URL is not set. The auth client is defaulting to http://localhost:3000"
        );
    }
}
