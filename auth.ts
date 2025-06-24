/** @jsxImportSource react */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from '@/server/db';
import { env } from "env";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, multiSession } from "better-auth/plugins"
import { sendAdminSlackNotification } from "@/lib/services/notification";
import { resend } from "@/lib/services/resend";
import WelcomeEmail from "@/lib/services/email-templates/WelcomeEmail";
import { SYSTEM_ADMIN_EMAIL } from "@/utils/constant";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "pg" or "mysql"
    }),
    user: {
        additionalFields: {
            metadata: {
                type: "string",
                required: false,
                input: false,
                fieldName: "metadata",
                unique: false,
            },
            onboard: {
                type: "number",
                required: false,
                input: false,
                fieldName: "onboard",
                unique: false,
            },
        }
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET, 
        },
    },
    plugins: [
        nextCookies(),
        multiSession({
            maximumSessions: 2,
        }),
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user, context) => {
                    if (env.NODE_ENV === 'production') {
                        await sendAdminSlackNotification(`Dreamreel | New user signed up: ${user.email} at ${user.createdAt}`);

                        await resend.emails.send({
                            from: SYSTEM_ADMIN_EMAIL,
                            to: user.email,
                            subject: 'Welcome to Dreamreel!',
                            react: WelcomeEmail({ name: user.name! || 'there' }),
                        });
                    }
                },
            }
        }
    }
});


export const getSession = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session as Session;
});

export const validateSession = cache(async () => {
    const session = await getSession();
    if (!session) redirect('/');
    return session as Session;
});


export type Session = typeof auth.$Infer.Session;
