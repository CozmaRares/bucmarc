import { readdirSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { type Middleware, getMiddleware } from "@/middleware";
import type { PageModule } from "@/pages/types";

const pageRouter = new Hono();
export default pageRouter;

pageRouter.get(
    "/*",
    jsxRenderer(({ children }) => (
        <html>
            <body>{children}</body>
        </html>
    )),
);

const pagesDir = join(dirname(fileURLToPath(import.meta.url)), "../pages");
const pageFiles = readdirSync(pagesDir).filter(file => file.endsWith(".tsx"));

const routePathFromFile = (file: string) => {
    const name = parse(file).name;

    if (name === "Home") {
        return "/";
    }

    return `/${name.replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
};

for (const file of pageFiles) {
    const path = routePathFromFile(file);

    const module = (await import(
        pathToFileURL(join(pagesDir, file)).href
    )) as PageModule;

    if (!module.default) {
        throw new Error(`Page ${file} does not export a default component`);
    }

    pageRouter.get(path, getMiddleware(module.middleware), async c =>
        c.render(<module.default />),
    );
}
