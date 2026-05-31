import type { FC } from "hono/jsx";
import type { Middleware } from "@/middleware";

type _PageMiddleware = "no-auth" | "none";

// This exists only to enforce subset compatibility at compile time.
type AssertSubset<Sub extends Super, Super> = Sub;
export type PageMiddleware = AssertSubset<_PageMiddleware, Middleware>;

export type PageModule = {
    default: FC;
    middleware?: PageMiddleware;
};
