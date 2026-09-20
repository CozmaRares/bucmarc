import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
    server: {
        PORT: z.string().regex(/^\d+$/),
        NODE_ENV: z.enum(["development", "production"]),

        DB_FILE_NAME: z
            .string()
            .min(1)
            .refine(
                value => !value.startsWith("file:"),
                "DB_FILE_NAME must be a filesystem path without the file: prefix.",
            ),
        APP_URL: z.url(),

        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_PUBLISHABLE_KEY: z.string().min(1),
        CLERK_PORTAL_SIGN_IN: z.url(),
    },
    runtimeEnv: process.env,
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    createFinalSchema: shape =>
        z.object(shape).transform(env => {
            const clerkUrl = new URL(env.CLERK_PORTAL_SIGN_IN);
            clerkUrl.searchParams.set("redirect_url", env.APP_URL);
            const drizzleKitDbFile = `file:${env.DB_FILE_NAME}`;

            return {
                ...env,
                CLERK_PORTAL_SIGN_IN: clerkUrl.href,
                DRIZZLE_KIT_DB_FILE: drizzleKitDbFile,
            };
        }),
});
