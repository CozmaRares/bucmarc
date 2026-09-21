import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";
import type { Page } from "@/pages/types";
import { HomePage } from "@/pages/Home";
import { SeriesPage } from "@/pages/Series";
import { ToolsPage } from "@/pages/Tools";
import { PageError } from "@/pages/Error";
import { assetPath } from "@/lib/assets";
import {
    homeDataLoader,
    type HomePageProps,
} from "@/lib/services/loaders/Home";
import {
    seriesDataLoader,
    type SeriesPageProps,
} from "@/lib/services/loaders/Series";
import {
    toolsDataLoader,
    type ToolsPageProps,
} from "@/lib/services/loaders/Tools";
import type { PageDataLoader } from "@/lib/services/loaders/types";
import { HOME_PAGE_URL, SERIES_PAGE_URL, TOOLS_PAGE_URL } from "./pagePaths";

const pageRouter = new Hono();
export default pageRouter;

type Path =
    | typeof HOME_PAGE_URL
    | typeof SERIES_PAGE_URL
    | typeof TOOLS_PAGE_URL;

type PageHandler<Props> = readonly [
    path: Path,
    page: Page<Props>,
    dataLoader: PageDataLoader<Props>,
];

const pages = [
    [
        HOME_PAGE_URL,
        HomePage,
        homeDataLoader,
    ] satisfies PageHandler<HomePageProps>,
    [
        SERIES_PAGE_URL,
        SeriesPage,
        seriesDataLoader,
    ] satisfies PageHandler<SeriesPageProps>,
    [
        TOOLS_PAGE_URL,
        ToolsPage,
        toolsDataLoader,
    ] satisfies PageHandler<ToolsPageProps>,
] as const;

type LayoutProps = {
    children: any;
};

const Layout: FC<LayoutProps> = ({ children }) => {
    const c = useRequestContext();
    const currentPath = c.req.path;

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
            </body>
        </html>
    );
};

pageRouter.use(
    "*",
    jsxRenderer(({ children }) => <Layout>{children}</Layout>),
);
pages.forEach(registerPage);

function registerPage([
    path,
    { component: Component },
    dataLoader,
]: PageHandler<any>) {
    pageRouter.get(path, c =>
        dataLoader(c).match(
            data => c.render(<Component {...data} />),
            error => {
                c.status(error.httpStatusCode);
                return c.render(<PageError {...error} />);
            },
        ),
    );
}
