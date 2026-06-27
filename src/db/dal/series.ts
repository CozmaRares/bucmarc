import { db } from "../connection";
import { desc } from "drizzle-orm";
import * as schema from "../schema";
import { ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    maybeCategoryFKError,
    type CategoryFKError,
} from "./utils";

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
): ResultAsync<void, CategoryFKError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _createSeries(title, pattern),
        maybeCategoryFKError,
    );
}
