import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { pageRegistry } from "@/pages";

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

for (const { path, Component } of pageRegistry) {
    pageRouter.get(path, async c => c.render(<Component />));
}
