import { dbQuery } from "../connection";
import { desc, eq } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { unknownDbError, type UnknownDbError } from "./utils";
import { validateSeriesPattern } from "@/lib/seriesPattern";
import type { Series } from "../schema";
import type { SeriesMatchType } from "@/lib/constants";
import { notFoundMarkError, type NotFoundMarkError } from "./marks";

type PatternError = Exclude<
    ReturnType<typeof validateSeriesPattern>,
    undefined
>;

export type NotFoundSeriesError = { type: "not_found_series" };
export type InvalidSeriesPatternError = {
    type: "invalid_series_pattern";
    error: PatternError;
};

const invalidSeriesPatternError = (
    error: PatternError,
): InvalidSeriesPatternError => ({
    type: "invalid_series_pattern",
    error,
});
export function isInvalidSeriesPatternError(error: {
    type: string;
}): error is InvalidSeriesPatternError {
    return error.type === "invalid_series_pattern";
}

export const notFoundSeriesError = (): NotFoundSeriesError => ({
    type: "not_found_series",
});
export function isNotFoundSeriesError(error: {
    type: string;
}): error is NotFoundSeriesError {
    return error.type === "not_found_series";
}

function _getSeries() {
    return dbQuery("get series", db =>
        db
            .select({
                id: schema.series.id,
                title: schema.series.title,
                pattern: schema.series.pattern,
                matchType: schema.series.matchType,
                manualEpisode: schema.series.manualEpisode,
                markUrl: schema.series.markUrl,
            })
            .from(schema.series)
            .orderBy(desc(schema.series.updatedAt)),
    );
}
export function getSeries(): ResultAsync<Series[], UnknownDbError> {
    return ResultAsync.fromPromise(_getSeries(), unknownDbError);
}

async function _createSeries(
    title: string,
    pattern: string,
    matchType: SeriesMatchType,
) {
    const error = validateSeriesPattern(pattern, matchType);

    if (error) {
        return { type: "invalid_pattern", error } as const;
    }

    await dbQuery("create series", db =>
        db.insert(schema.series).values({ title, pattern, matchType }),
    );

    return { type: "created" } as const;
}
export function createSeries(
    title: string,
    pattern: string,
    matchType: SeriesMatchType,
): ResultAsync<void, UnknownDbError | InvalidSeriesPatternError> {
    return ResultAsync.fromPromise(
        _createSeries(title, pattern, matchType),
        unknownDbError,
    ).andThen(outcome => {
        switch (outcome.type) {
            case "created":
                return okAsync();
            case "invalid_pattern":
                return errAsync(invalidSeriesPatternError(outcome.error));
        }
    });
}

async function _updateSeries(
    id: number,
    title: string,
    pattern: string,
    matchType: SeriesMatchType,
) {
    const error = validateSeriesPattern(pattern, matchType);

    if (error) {
        return { type: "invalid_pattern", error } as const;
    }

    const updated = await dbQuery("update series", db =>
        db
            .update(schema.series)
            .set({ title, pattern, matchType })
            .where(eq(schema.series.id, id))
            .returning({ id: schema.series.id }),
    );

    return {
        type: updated.length > 0 ? "updated" : "not_found",
    } as const;
}
export function updateSeries(
    id: number,
    title: string,
    pattern: string,
    matchType: SeriesMatchType,
): ResultAsync<
    void,
    UnknownDbError | NotFoundSeriesError | InvalidSeriesPatternError
> {
    return ResultAsync.fromPromise(
        _updateSeries(id, title, pattern, matchType),
        unknownDbError,
    ).andThen(outcome => {
        switch (outcome.type) {
            case "updated":
                return okAsync();
            case "not_found":
                return errAsync(notFoundSeriesError());
            case "invalid_pattern":
                return errAsync(invalidSeriesPatternError(outcome.error));
        }
    });
}

function _assignMarkToSeries(markUrl: string, seriesId: number) {
    return dbQuery("tx assign mark to series", db =>
        db.transaction(tx => {
            const current = tx.query.series
                .findFirst({
                    where: eq(schema.series.id, seriesId),
                })
                .sync();

            if (!current) {
                return { error: "not_found_series" } as const;
            }

            const nextMark = tx.query.marks
                .findFirst({
                    where: eq(schema.marks.url, markUrl),
                })
                .sync();

            if (!nextMark) {
                return { error: "not_found_mark" } as const;
            }

            if (current.markUrl) {
                if (current.markUrl === markUrl) {
                    return { success: true } as const;
                }

                const previousMark = tx.query.marks
                    .findFirst({
                        where: eq(schema.marks.url, current.markUrl),
                    })
                    .sync();

                if (previousMark?.categoryId != null) {
                    tx.update(schema.marks)
                        .set({ categoryId: previousMark.categoryId })
                        .where(eq(schema.marks.url, markUrl))
                        .run();
                }
            }

            const updated = tx
                .update(schema.series)
                .set({ markUrl })
                .where(eq(schema.series.id, seriesId))
                .returning({ id: schema.series.id })
                .all();

            if (updated.length === 0) {
                return { error: "not_found_series" } as const;
            }

            if (current.markUrl) {
                tx.delete(schema.marks)
                    .where(eq(schema.marks.url, current.markUrl))
                    .run();
            }

            return { success: true } as const;
        }),
    );
}
export function assignMarkToSeries(
    markUrl: string,
    seriesId: number,
): ResultAsync<void, UnknownDbError | NotFoundSeriesError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _assignMarkToSeries(markUrl, seriesId),
        unknownDbError,
    ).andThen(result => {
        switch (result.error) {
            case "not_found_series":
                return errAsync(notFoundSeriesError());
            case "not_found_mark":
                return errAsync(notFoundMarkError());
            default:
                return okAsync();
        }
    });
}

async function _deleteSeries(id: number) {
    const deleted = await dbQuery("delete series", db =>
        db
            .delete(schema.series)
            .where(eq(schema.series.id, id))
            .returning({ id: schema.series.id }),
    );

    return {
        type: deleted.length > 0 ? "deleted" : "not_found",
    } as const;
}

export function deleteSeries(
    id: number,
): ResultAsync<void, UnknownDbError | NotFoundSeriesError> {
    return ResultAsync.fromPromise(_deleteSeries(id), unknownDbError).andThen(
        outcome => {
            switch (outcome.type) {
                case "deleted":
                    return okAsync();
                case "not_found":
                    return errAsync(notFoundSeriesError());
            }
        },
    );
}
