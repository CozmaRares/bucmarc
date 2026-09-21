import {
    getCategorizedMarks,
    getPendingAmbiguousMarks,
    getUncategorizedMarks,
} from "@/db/dal";
import type { Category, PendingAmbiguousMark } from "@/db/dal";
import type { MarkWithSeries } from "@/lib/markWithSeries";
import { ResultAsync } from "neverthrow";
import { serverError, type PageDataLoader } from "./types";

type IndicatorStatus = "fresh" | "aging" | "stale" | "very-stale" | "ancient";

export type MarkWithIndicators = MarkWithSeries & {
    ageIndicatorStatus: IndicatorStatus;
    lastClickedIndicatorStatus: IndicatorStatus;
};

export type HomePageProps = {
    categorizedMarks: Array<Category & { marks: MarkWithIndicators[] }>;
    pendingAmbiguousMarks: PendingAmbiguousMark[];
    uncategorizedMarks: MarkWithIndicators[];
};

export type { Category, PendingAmbiguousMark };

export const homeDataLoader: PageDataLoader<HomePageProps> = () => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const THRESHOLDS = [
        [7, "fresh"],
        [30, "aging"],
        [60, "stale"],
        [90, "very-stale"],
        [Infinity, "ancient"],
    ] as const;

    const now = Date.now();

    const getIndicatorStatus = (date: Date): IndicatorStatus => {
        const days = (now - date.getTime()) / MS_PER_DAY;
        const [, indicatorStatus] = THRESHOLDS.find(
            ([threshold]) => days < threshold,
        )!;
        return indicatorStatus;
    };

    const createMarkWithIndicators = (mark: MarkWithSeries) => ({
        ...mark,
        ageIndicatorStatus: getIndicatorStatus(mark.createdAt),
        lastClickedIndicatorStatus: getIndicatorStatus(mark.lastClickedAt),
    });

    return ResultAsync.combineWithAllErrors([
        getCategorizedMarks(),
        getPendingAmbiguousMarks(),
        getUncategorizedMarks(),
    ])
        .map(
            ([
                categorizedMarks,
                pendingAmbiguousMarks,
                uncategorizedMarks,
            ]) => ({
                categorizedMarks: categorizedMarks.map(category => ({
                    ...category,
                    marks: category.marks.map(createMarkWithIndicators),
                })),
                pendingAmbiguousMarks,
                uncategorizedMarks: uncategorizedMarks.map(
                    createMarkWithIndicators,
                ),
            }),
        )
        .mapErr(serverError);
};
