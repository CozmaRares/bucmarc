import type { FC } from "hono/jsx";

export type Page<P> = {
    name: string;
    component: FC<P>;
};
