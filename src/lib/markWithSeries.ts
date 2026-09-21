import type { Mark, Series } from "@/db/dal";
import { getEpisodeIdentity } from "./patterns";

type SeriesDisplay = Pick<Series, "title"> & { episode: string };
export type MarkWithSeries = Mark & { series: SeriesDisplay | null };

export function createSeriesTitleWithEpisode(
    markWithSeries: Mark & {
        series: Pick<Series, "title" | "pattern" | "manualEpisode"> | null;
    },
): MarkWithSeries {
    const { series, ...mark } = markWithSeries;
    const returned: MarkWithSeries = { ...mark, series: null };

    if (series) {
        const episode =
            series.manualEpisode ??
            getEpisodeIdentity(series.pattern, mark.url) ??
            "";
        returned.series = {
            title: series.title,
            episode,
        };
    }

    return returned;
}
