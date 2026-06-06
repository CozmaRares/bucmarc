import { getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
import { env } from "./env";
import { HTTPStatusCode } from "./honoHelpers";

export { clerkMiddleware } from "@clerk/hono";
export const requireAuth = createMiddleware(async (c, next) => {
    const { userId } = getAuth(c);

    if (!userId) {
        return c.redirect(env.CLERK_PORTAL_SIGN_IN, HTTPStatusCode.Found);
    }

    await next();
});
