import { db } from "../connection";
import { desc, eq } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { unknownDbError, type UnknownDbError } from "./utils";

export type NotFoundSeriesError = { type: "not_found_series" };

export const notFoundSeriesError = (): NotFoundSeriesError => ({
    type: "not_found_series",
});

export type Series = Awaited<ReturnType<typeof _getSeries>>[number];
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
    await db.insert(schema.series).values({ title, pattern });
}
export function createSeries(
    title: string,
    pattern: string,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        _createSeries(title, pattern),
        unknownDbError,
    );
}

async function _assignMarkToSeries(markUrl: string, seriesId: number) {
    const updated = await db.transaction(async tx => {
        const current = await tx.query.series.findFirst({
            where: eq(schema.series.id, seriesId),
        });

        if (!current) {
            return null;
        }

        const updated = await tx
            .update(schema.series)
            .set({ markUrl })
            .where(eq(schema.series.id, seriesId))
            .returning({ id: schema.series.id });

        if (updated.length === 0) {
            return null;
        }

        return {
            id: current.id,
            previousMarkUrl: current.markUrl,
        };
    });

    return updated;
}
export function assignMarkToSeries(
    markUrl: string,
    seriesId: number,
): ResultAsync<
    string | null,
    UnknownDbError | NotFoundSeriesError
> {
    return ResultAsync.fromPromise(
        _assignMarkToSeries(markUrl, seriesId),
        unknownDbError,
    ).andThen(updated =>
        updated
            ? okAsync(updated.previousMarkUrl)
            : errAsync(notFoundSeriesError()),
    );
}
