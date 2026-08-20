import { dbQuery } from "../connection";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import { ResultAsync } from "neverthrow";
import { unknownDbError, type UnknownDbError } from "./utils";

async function _replaceMarkSeriesCandidates(
    markUrl: string,
    seriesIds: number[],
) {
    await dbQuery("replace mark series candidates", db =>
        db.transaction(async tx => {
            await tx
                .delete(schema.markSeriesCandidates)
                .where(eq(schema.markSeriesCandidates.markUrl, markUrl));

            if (seriesIds.length === 0) {
                return;
            }

            await tx.insert(schema.markSeriesCandidates).values(
                seriesIds.map(seriesId => ({
                    markUrl,
                    seriesId,
                })),
            );
        }),
    );
}

export function replaceMarkSeriesCandidates(
    markUrl: string,
    seriesIds: number[],
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        _replaceMarkSeriesCandidates(markUrl, seriesIds),
        unknownDbError,
    );
}
