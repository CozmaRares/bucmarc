import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger as honoLogger } from "hono/logger";
import { createLogger } from "@/lib/logger";
import { env } from "@/env";
import apiRouter from "./routers/api";
import { clerkMiddleware, requireAuth } from "./middleware";
import { HTTPStatusCode } from "./honoHelpers";
import pageRouter, { registerPublicPages } from "./routers/pages";

const logger = createLogger("server");

const app = new Hono();

app.use("*", clerkMiddleware());
app.use(honoLogger((...args) => logger.info(...args)));
registerPublicPages(app);
app.use(requireAuth);

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
        return ctx.text("Internal server error", HTTPStatusCode.ServerError);
    }
});

app.route("/api", apiRouter);
app.route("/", pageRouter);

app.get("*", c => {
    return c.text("Not Found", HTTPStatusCode.NotFound);
});

const server = Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
});

logger.info(`Server started on port ${env.PORT}`);

export default server;
