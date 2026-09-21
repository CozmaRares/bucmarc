import { dbQuery } from "@/db/connection";
import { asc, desc, eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { unknownDbError, type UnknownDbError } from "./utils";
import { notFoundMarkError, type NotFoundMarkError } from "./marks";
import { notFoundSeriesError, type NotFoundSeriesError } from "./series";

function _replaceMarkSeriesCandidates(markUrl: string, seriesIds: number[]) {
    return dbQuery("tx replace mark series candidates", db =>
        db.transaction(tx => {
            const mark = tx.query.marks
                .findFirst({
                    where: eq(schema.marks.url, markUrl),
                })
                .sync();

            if (!mark) {
                return false;
            }

            tx.delete(schema.markSeriesCandidates)
                .where(eq(schema.markSeriesCandidates.markUrl, markUrl))
                .run();

            if (seriesIds.length === 0) {
                return true;
            }

            const inserted = tx
                .insert(schema.markSeriesCandidates)
                .values(
                    seriesIds.map(seriesId => ({
                        markUrl,
                        seriesId,
                    })),
                )
                .returning()
                .all();

            return inserted.length > 0;
        }),
    );
}

export function replaceMarkSeriesCandidates(
    markUrl: string,
    seriesIds: number[],
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _replaceMarkSeriesCandidates(markUrl, seriesIds),
        unknownDbError,
    ).andThen(replaced =>
        replaced ? okAsync() : errAsync(notFoundMarkError()),
    );
}

type PendingCandidate = {
    seriesId: number;
    seriesTitle: string;
    manualEpisode: string | null;
    lastClickedAt: Date | null;
};

export type PendingAmbiguousMark = {
    markUrl: string;
    candidates: PendingCandidate[];
};

async function _getPendingAmbiguousMarks(): Promise<PendingAmbiguousMark[]> {
    const rows = await dbQuery("get pending ambiguous marks", db =>
        db
            .select({
                markUrl: schema.markSeriesCandidates.markUrl,
                seriesId: schema.series.id,
                seriesTitle: schema.series.title,
                manualEpisode: schema.series.manualEpisode,
                lastClickedAt: schema.marks.lastClickedAt,
            })
            .from(schema.markSeriesCandidates)
            .innerJoin(
                schema.series,
                eq(schema.series.id, schema.markSeriesCandidates.seriesId),
            )
            .leftJoin(schema.marks, eq(schema.marks.url, schema.series.markUrl))
            .orderBy(
                asc(schema.markSeriesCandidates.markUrl),
                desc(schema.marks.lastClickedAt),
                asc(schema.series.title),
            ),
    );

    const marks = new Map<string, PendingAmbiguousMark>();

    rows.forEach(row => {
        const mark = marks.get(row.markUrl) ?? {
            markUrl: row.markUrl,
            candidates: [],
        };

        mark.candidates.push({
            seriesId: row.seriesId,
            seriesTitle: row.seriesTitle,
            manualEpisode: row.manualEpisode,
            lastClickedAt: row.lastClickedAt,
        });
        marks.set(row.markUrl, mark);
    });

    return [...marks.values()];
}

export function getPendingAmbiguousMarks(): ResultAsync<
    PendingAmbiguousMark[],
    UnknownDbError
> {
    return ResultAsync.fromPromise(_getPendingAmbiguousMarks(), unknownDbError);
}

export type AmbiguousMarkResolution =
    | {
          type: "series";
          markUrl: string;
          seriesId: number;
          episode: string | null;
      }
    | {
          type: "no_match";
          markUrl: string;
      };

async function _resolveAmbiguousMarks(resolutions: AmbiguousMarkResolution[]) {
    return await dbQuery("tx resolve ambiguous marks", db =>
        db.transaction(tx => {
            for (const resolution of resolutions) {
                if (resolution.type === "no_match") {
                    tx.delete(schema.markSeriesCandidates)
                        .where(
                            eq(
                                schema.markSeriesCandidates.markUrl,
                                resolution.markUrl,
                            ),
                        )
                        .run();
                    continue;
                }

                const candidate = tx.query.markSeriesCandidates
                    .findFirst({
                        where: (candidate, { and, eq }) =>
                            and(
                                eq(candidate.markUrl, resolution.markUrl),
                                eq(candidate.seriesId, resolution.seriesId),
                            ),
                    })
                    .sync();

                if (!candidate) {
                    return { error: "not_found_mark" } as const;
                }

                const current = tx.query.series
                    .findFirst({
                        where: eq(schema.series.id, resolution.seriesId),
                    })
                    .sync();

                if (!current) {
                    return { error: "not_found_series" } as const;
                }

                let carriedCategoryId: number | null = null;

                if (current.markUrl && current.markUrl !== resolution.markUrl) {
                    const oldMarks = tx
                        .delete(schema.marks)
                        .where(eq(schema.marks.url, current.markUrl))
                        .returning({ categoryId: schema.marks.categoryId })
                        .all();

                    carriedCategoryId = oldMarks[0]?.categoryId ?? null;
                }

                const updated = tx
                    .update(schema.series)
                    .set({
                        markUrl: resolution.markUrl,
                        manualEpisode: resolution.episode,
                    })
                    .where(eq(schema.series.id, resolution.seriesId))
                    .returning({ id: schema.series.id })
                    .all();

                if (updated.length === 0) {
                    return { error: "not_found_series" } as const;
                }

                if (carriedCategoryId != null) {
                    const marks = tx
                        .update(schema.marks)
                        .set({ categoryId: carriedCategoryId })
                        .where(eq(schema.marks.url, resolution.markUrl))
                        .returning({ url: schema.marks.url })
                        .all();

                    if (marks.length === 0) {
                        return { error: "not_found_mark" } as const;
                    }
                }

                tx.delete(schema.markSeriesCandidates)
                    .where(
                        eq(
                            schema.markSeriesCandidates.markUrl,
                            resolution.markUrl,
                        ),
                    )
                    .run();
            }

            return { success: true } as const;
        }),
    );
}

export function resolveAmbiguousMarks(
    resolutions: AmbiguousMarkResolution[],
): ResultAsync<void, UnknownDbError | NotFoundMarkError | NotFoundSeriesError> {
    return ResultAsync.fromPromise(
        _resolveAmbiguousMarks(resolutions),
        unknownDbError,
    ).andThen(result => {
        switch (result.error) {
            case "not_found_mark":
                return errAsync(notFoundMarkError());
            case "not_found_series":
                return errAsync(notFoundSeriesError());
            default:
                return okAsync();
        }
    });
}
