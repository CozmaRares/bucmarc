import { getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
import { env } from "./env";

type Env = {
    Variables: {
        userId: string;
    };
};

export { clerkMiddleware } from "@clerk/hono";
export const requireAuth = createMiddleware<Env>(async (c, next) => {
    const { userId } = getAuth(c);

    if (!userId) {
        return c.redirect(env.CLERK_PORTAL_SIGN_IN, 302);
    }

    c.set("userId", userId);

    await next();
});
