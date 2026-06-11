import type { Hono } from "hono";
import type { FC } from "hono/jsx";
import type { Page } from "@/pages/types";

const Layout: FC = ({ children }) => (
    <html>
        <body>{children}</body>
    </html>
);

export function registerPage(router: Hono, path: string, page: Page<any>) {
    const { component: Component, dataLoader } = page;

    router.get(path, async c => {
        const data = await dataLoader?.(c);
        if (data === null) {
            return c.text("Not found", 404);
        }

        return c.html(
            <Layout>
                <Component {...data} />
            </Layout>,
        );
    });
}
