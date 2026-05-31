import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger as honoLogger } from "hono/logger";
import { createLogger } from "@/lib/logger";
import { env } from "@/env";
import apiRouter from "./routers/api";
import pageRouter from "./routers/pages";
import { clerkMiddleware, requireAuth } from "./middleware";

const logger = createLogger("server");

const app = new Hono();

app.use("*", clerkMiddleware(), requireAuth);
app.use(honoLogger((...args) => logger.info(...args)));
app.use(
    "/public/*",
    serveStatic({
        root: "./public",
        rewriteRequestPath: path => path.replace(/^\/public/, ""),
    }),
);

app.use("*", async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        logger.error(e);
        return ctx.text("Internal server error", 500);
    }
});

app.route("/api", apiRouter);
app.route("/", pageRouter);

app.get("*", c => {
    return c.text("Hello Hono!");
});

app.get("*", c => {
    c.status(404);
    return c.text("Not Found");
});

export default {
    fetch: app.fetch,
    port: env.PORT,
};
