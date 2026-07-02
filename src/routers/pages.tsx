import { Hono } from "hono";
import type { FC } from "hono/jsx";
import type { Page } from "@/pages/types";
import { HomePage } from "@/pages/Home";
import { SeriesPage } from "@/pages/Series";

const pageRouter = new Hono();
export default pageRouter;

const pages = [
    ["/", HomePage],
    ["/series", SeriesPage],
] as const;
pages.forEach(([path, page]) => registerPage(path, page));

const Layout: FC = ({ children }) => (
    <html>
        <body>{children}</body>
    </html>
);

function registerPage(path: string, page: Page<any>) {
    const { component: Component, dataLoader } = page;

    pageRouter.get(path, c =>
        dataLoader(c).match(
            data =>
                c.html(
                    <Layout>
                        <Component {...data} />
                    </Layout>,
                ),
            error => c.text(error.message, error.httpStatusCode),
        ),
    );
}
