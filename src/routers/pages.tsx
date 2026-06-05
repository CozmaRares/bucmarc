import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { pageRegistry } from "@/pages";
import type { FC } from "hono/jsx";
import type { Page } from "@/pages/types";

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

for (const {
    path,
    component: Component,
    dataLoader,
    publicPage,
} of pageRegistry) {
    if (publicPage) {
        throw new Error("public pages not supported in the pages router");
    }

    pageRouter.get(path, async c => {
        const data = await dataLoader?.(c);
        if (data === null) {
            return c.text("Not found", 404);
        }

        return c.render(<Component {...data} />);
    });
}

export function setPublicPageRoute(router: Hono, page: Page<any>) {
    const { path, component: Component, dataLoader, publicPage } = page;
    if (!publicPage) {
        throw new Error("non-public pages not supported in setPublicPageRoute");
    }

    router.get(path, async c => {
        const data = await dataLoader?.(c);
        if (data === null) {
            return c.text("Not found", 404);
        }

        return c.html(<Component {...data} />);
    });
}
