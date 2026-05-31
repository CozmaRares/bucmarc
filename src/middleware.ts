import { getAuth } from "@clerk/hono";
import { createMiddleware } from "hono/factory";
export { clerkMiddleware } from "@clerk/hono";
import { env } from "./env";
import type { MiddlewareHandler } from "hono";

type Env = {
    Variables: {
        userId: string;
    };
};

export const requireAuth = createMiddleware<Env>(async (c, next) => {
    const { userId } = getAuth(c);

    if (!userId) {
        return c.redirect(env.SIGN_IN_URL, 302);
    }

    c.set("userId", userId);

    await next();
});

export const requireNoAuth = createMiddleware(async (c, next) => {
    const { userId } = getAuth(c);

    if (userId) {
        return c.redirect(env.APP_URL, 302);
    }

    await next();
});

export type Middleware = "auth" | "no-auth" | "none";

export function getMiddleware(middlewareType?: Middleware): MiddlewareHandler {
    if (!middlewareType) {
        middlewareType = "auth";
    }

    switch (middlewareType) {
        case "auth":
            return requireAuth;
        case "no-auth":
            return requireNoAuth;
        case "none":
            return async (_c, next) => await next();
        default:
            throw new Error(`Unknown middleware type: middlewareType`);
    }
}
