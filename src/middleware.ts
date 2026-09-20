import { getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
import { env } from "./env";
import { HTTPStatus } from "./honoHelpers";
import { withDatabaseConnection } from "./db/connection";

export { clerkMiddleware } from "@clerk/hono";
export const requireAuth = createMiddleware(async (c, next) => {
    const { userId } = getAuth(c);

    if (!userId) {
        return c.redirect(env.CLERK_PORTAL_SIGN_IN, HTTPStatus.Found);
    }

    await next();
});

export const openDatabaseConnection = createMiddleware(async (_c, next) =>
    withDatabaseConnection(next),
);
