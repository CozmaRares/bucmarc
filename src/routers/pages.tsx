import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { pageRegistry } from "@/pages";
import type { FC } from "hono/jsx";

const pageRouter = new Hono();
export default pageRouter;

const Layout: FC = ({ children }) => (
    <html>
        <body>{children}</body>
    </html>
);

pageRouter.get(
    "/*",
    jsxRenderer(({ children }) => <Layout>{children}</Layout>),
);

pageRegistry
    .filter(page => !page.publicPage)
    .forEach(page => {
        const { path, component: Component, dataLoader } = page;

        pageRouter.get(path, async c => {
            const data = await dataLoader?.(c);
            if (data === null) {
                return c.text("Not found", 404);
            }

            return c.render(<Component {...data} />);
        });
    });

export function registerPublicPages(router: Hono) {
    pageRegistry
        .filter(page => page.publicPage)
        .forEach(page => {
            const { path, component: Component, dataLoader } = page;

            router.get(path, async c => {
                const data = await dataLoader?.(c);
                if (data === null) {
                    return c.text("Not found", 404);
                }

                return c.html(<Component {...data} />);
            });
        });
}
