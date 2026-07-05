import { db } from "../connection";
import { desc, eq } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { unknownDbError, type UnknownDbError } from "./utils";
import { validateSeriesPattern } from "@/lib/seriesPattern";
import type { Series } from "../schema";
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

const notFoundSeriesError = (): NotFoundSeriesError => ({
    type: "not_found_series",
});
export function isNotFoundSeriesError(error: {
    type: string;
}): error is NotFoundSeriesError {
    return error.type === "not_found_series";
}

function _getSeries() {
    return db
        .select({
            id: schema.series.id,
            title: schema.series.title,
            pattern: schema.series.pattern,
            markUrl: schema.series.markUrl,
        })
        .from(schema.series)
        .orderBy(desc(schema.series.updatedAt));
}
export function getSeries(): ResultAsync<Series[], UnknownDbError> {
    return ResultAsync.fromPromise(_getSeries(), unknownDbError);
}

async function _createSeries(title: string, pattern: string) {
    const error = validateSeriesPattern(pattern);

    if (error) {
        return { type: "invalid_pattern", error } as const;
    }

    await db.insert(schema.series).values({ title, pattern });

    return { type: "created" } as const;
}
export function createSeries(
    title: string,
    pattern: string,
): ResultAsync<void, UnknownDbError | InvalidSeriesPatternError> {
    return ResultAsync.fromPromise(
        _createSeries(title, pattern),
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

async function _updateSeries(id: number, title: string, pattern: string) {
    const error = validateSeriesPattern(pattern);

    if (error) {
        return { type: "invalid_pattern", error } as const;
    }

    const updated = await db
        .update(schema.series)
        .set({ title, pattern })
        .where(eq(schema.series.id, id))
        .returning({ id: schema.series.id });

    return {
        type: updated.length > 0 ? "updated" : "not_found",
    } as const;
}
export function updateSeries(
    id: number,
    title: string,
    pattern: string,
): ResultAsync<
    void,
    UnknownDbError | NotFoundSeriesError | InvalidSeriesPatternError
> {
    return ResultAsync.fromPromise(
        _updateSeries(id, title, pattern),
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

// return the previous mark url for later deletion
function _assignMarkToSeries(markUrl: string, seriesId: number) {
    return db.transaction(async tx => {
        const current = await tx.query.series.findFirst({
            where: eq(schema.series.id, seriesId),
        });

        if (!current) {
            return { error: "not_found_series" } as const;
        }

        const updated = await tx
            .update(schema.series)
            .set({ markUrl })
            .where(eq(schema.series.id, seriesId))
            .returning({ id: schema.series.id });

        if (updated.length === 0) {
            return { error: "not_found_mark" } as const;
        }

        return { success: current.markUrl };
    });
}
export function assignMarkToSeries(
    markUrl: string,
    seriesId: number,
): ResultAsync<
    string | null,
    UnknownDbError | NotFoundSeriesError | NotFoundMarkError
> {
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
                return okAsync(result.success);
        }
    });
}

async function _deleteSeries(id: number) {
    const deleted = await db
        .delete(schema.series)
        .where(eq(schema.series.id, id))
        .returning({ id: schema.series.id });

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
