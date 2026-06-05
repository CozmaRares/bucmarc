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

for (const { path, component: Component, dataLoader } of pageRegistry) {
    pageRouter.get(path, async c => {
        const data = await dataLoader?.(c);
        if (data === null) {
            return c.text("Not found", 404);
        }

        // @ts-expect-error type mismatch
        return c.render(<Component {...data} />);
    });
}
