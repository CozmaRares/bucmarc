import { getRegexSnippets, getSeries } from "@/db/dal";
import type { RegexSnippet, Series } from "@/db/dal";
import type { PageDataLoader } from "./types";
import { serverError } from "./types";

export type SeriesPageProps = {
    series: Series[];
    snippets: RegexSnippet[];
    createUrl: string | undefined;
};

export type { RegexSnippet, Series };

export const seriesDataLoader: PageDataLoader<SeriesPageProps> = context =>
    getSeries()
        .andThen(series =>
            getRegexSnippets().map(snippets => ({
                pageMessage: context.req.query("message"),
                pageStatus: context.req.query("status"),
                series,
                snippets,
                createUrl: context.req.query("createUrl"),
            })),
        )
        .mapErr(serverError);
