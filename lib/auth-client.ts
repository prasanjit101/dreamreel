import { env } from "@/env"
import { createAuthClient } from "better-auth/react"
import { multiSessionClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    /** the base url of the server (optional if you're using the same domain) */
    baseURL: env.NEXT_PUBLIC_APP_URL,
    plugins: [
        multiSessionClient(),
    ],
    fetchOptions: {
        onError: async (context) => {
            const { response } = context;
            if (response.status === 429) {
                const retryAfter = response.headers.get("X-Retry-After");
                console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
            }
        },
    }
})

export const { signIn, signUp, signOut, useSession } = authClient;


export const signInGoogle = async ({ callbackURL }: { callbackURL: string }) => {
    const data = await signIn.social({
        provider: "google",
        callbackURL
    });
    return data;
};