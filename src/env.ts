import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
    server: {
        PORT: z.string().min(1).default("3000"),
        NODE_ENV: z.enum(["development", "production"]).default("development"),

        DB_FILE_NAME: z.string().min(1),
        APP_URL: z.url(),

        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_PUBLISHABLE_KEY: z.string().min(1),
        CLERK_PORTAL_SIGN_IN: z.url(),
    },
    runtimeEnv: process.env,

    createFinalSchema: shape =>
        z.object(shape).transform(env => {
            const clerkUrl = new URL(env.CLERK_PORTAL_SIGN_IN);
            clerkUrl.searchParams.set("redirect_url", env.APP_URL);

            return {
                ...env,
                CLERK_PORTAL_SIGN_IN: clerkUrl.href,
            };
        }),
});
