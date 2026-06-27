import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { createLogger } from "@/lib/logger";
import { env } from "@/env";
import apiRouter from "./routers/api";
import { clerkMiddleware, requireAuth } from "./middleware";
import { HTTPStatus } from "./honoHelpers";
import pageRouter from "./routers/pages";
import shareRouter from "./routers/share";
import chalk from "chalk";
import { jobQueue } from "@/lib/jobQueue";

const logger = createLogger("server");

const app = new Hono();

app.use("*", async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;

    logger.info("->", colorMethod(method), colorPath(path));

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
            "<-",
            colorMethod(method),
            colorPath(path),
            colorStatus(c.res.status),
            `(${colorDuration(duration)}ms)`,
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

function colorMethod(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return chalk.green(method);
        case "POST":
            return chalk.yellow(method);
        case "PUT":
            return chalk.blue(method);
        case "DELETE":
            return chalk.red(method);
        default:
            return method;
    }
}

function colorPath(path: string) {
    return chalk.italic(path);
}

function colorStatus(status: number) {
    if (status >= 500) return chalk.red(status);
    if (status >= 400) return chalk.yellow(status);
    if (status >= 300) return chalk.cyan(status);
    if (status >= 200) return chalk.green(status);
    return chalk.white(status);
}

function colorDuration(duration: number) {
    const durationText = duration.toFixed(0);

    if (duration > 1000) return chalk.red(durationText);
    if (duration > 500) return chalk.yellow(durationText);
    return chalk.green(durationText);
}

jobQueue.start();
