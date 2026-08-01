import { Hono } from "hono";
import type { FC } from "hono/jsx";
import type { Page } from "@/pages/types";
import { HomePage } from "@/pages/Home";
import { SeriesPage } from "@/pages/Series";
import { env } from "@/env";
import { assetPath } from "@/lib/assets";
import { MARK_SAVE_URL_PREFIX } from "./api/mark";
import { HOME_PAGE_URL, SERIES_PAGE_URL } from "./pagePaths";

const pageRouter = new Hono();
export default pageRouter;

const pages = [
    [HOME_PAGE_URL, HomePage],
    [SERIES_PAGE_URL, SeriesPage],
] as const;
pages.forEach(([path, page]) => registerPage(path, page));

type Path = (typeof pages)[number][0];

type LayoutProps = {
    children: any;
    currentPath: Path;
};

const Layout: FC<LayoutProps> = ({ children, currentPath }) => {
    const bookmarkletSave = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href);})();`;
    const bookmarkletSaveOpen = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href)+'?no-redirect';})();`;

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link
                    rel="stylesheet"
                    href={assetPath("/reset.css")}
                />
                <link
                    rel="stylesheet"
                    href={assetPath("/app.css")}
                />
                <script
                    src={assetPath("/app.js")}
                    defer
                />
                <title>Bucmarc</title>
            </head>
            <body>
                <header class="header">
                    <a
                        class="header-title"
                        href={HOME_PAGE_URL}
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
                <footer class="footer">
                    <div class="footer-bookmarklets">
                        <span class="footer-label">Bookmarklets (Mobile):</span>
                        <div class="footer-bookmarklet-item">
                            <button
                                class="footer-copy-button"
                                data-copy={bookmarkletSave}
                                title="Copy bookmarklet code"
                            >
                                Copy
                            </button>
                            <span class="footer-bookmarklet-name">Save</span>
                        </div>
                        <div class="footer-bookmarklet-item">
                            <button
                                class="footer-copy-button"
                                data-copy={bookmarkletSaveOpen}
                                title="Copy bookmarklet code"
                            >
                                Copy
                            </button>
                            <span class="footer-bookmarklet-name">
                                Save & Open
                            </span>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
};

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
