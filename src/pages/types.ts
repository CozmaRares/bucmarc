import type { Context } from "hono";
import type { FC } from "hono/jsx";

export type Page<P> = {
    component: FC<P>;
    dataLoader?: (c: Context) => Promise<P | null>;
};
