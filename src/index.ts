import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { createLogger } from "@/lib/logger";
import { env } from "@/env";
import apiRouter from "./routers/api";
import { clerkMiddleware, requireAuth } from "./middleware";
import { HTTPStatus } from "./honoHelpers";
import pageRouter from "./routers/pages";
import shareRouter from "./routers/share";

const logger = createLogger("server");

const app = new Hono();

app.use("*", async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;

    try {
        const body = await c.req.raw.clone().formData();
        console.log(body);
    } catch {}

    logger.info(`-> ${method} ${path}`);

    const start = performance.now();
    try {
        await next();
    } catch (e) {
        logger.error(e);
        return c.text("Internal server error", HTTPStatus.ServerError);
    } finally {
        const end = performance.now();
        const duration = end - start;

        logger.info(
            `<- ${method} ${path} ${c.res.status} ${duration.toFixed(0)}ms`,
        );
    }
});
app.use("*", clerkMiddleware());
app.use(
    "/public/*",
    serveStatic({
        root: "./public",
        rewriteRequestPath: path => path.replace(/^\/public/, ""),
    }),
);
app.route("/share", shareRouter);
app.use(requireAuth);

app.route("/api", apiRouter);
app.route("/", pageRouter);

app.get("*", c => {
    return c.text("Not Found", HTTPStatus.NotFound);
});

const server = Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
});

logger.info(`Server started on port ${env.PORT}`);

export default server;
