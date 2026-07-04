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

type Path = (typeof pages)[number][0];

type LayoutProps = {
    children: any;
    currentPath: Path;
};

const Layout: FC<LayoutProps> = ({ children, currentPath }) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link
                rel="stylesheet"
                href="/public/reset.css"
            />
            <link
                rel="stylesheet"
                href="/public/app.css"
            />
            <script
                src="/public/banner.js"
                defer
            />
            <title>Bucmarc</title>
        </head>
        <body>
            <header class="header">
                <a
                    class="header-title"
                    href="/"
                >
                    Bucmarc
                </a>
                <nav
                    class="header-nav"
                    aria-label="Primary"
                >
                    {pages.map(([path, { name }]) => (
                        <a
                            class="header-link"
                            href={path}
                            data-current={path === currentPath}
                        >
                            {name}
                        </a>
                    ))}
                </nav>
            </header>
            <p
                data-page-banner
                data-page-status
                role="alert"
                class="banner"
                hidden={true}
            />
            <main>{children}</main>
        </body>
    </html>
);

function registerPage(path: Path, page: Page<any>) {
    const { component: Component, dataLoader } = page;

    pageRouter.get(path, c =>
        dataLoader(c).match(
            data =>
                c.html(
                    <Layout currentPath={path}>
                        <Component {...data} />
                    </Layout>,
                ),
            error => c.text(error.message, error.httpStatusCode),
        ),
    );
}
