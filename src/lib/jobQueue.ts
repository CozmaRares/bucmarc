import {
    getSeries,
    assignMarkToSeries,
    deleteMark,
    updateMark,
    type DbError,
    cleanQueue,
    completeJob,
    takeAllPendingJobs,
    replaceMarkSeriesCandidates,
} from "@/db/dal";
import type { Series } from "@/db/dal";
import { createLogger } from "./logger";
import { okAsync, ResultAsync, errAsync } from "neverthrow";

const logger = createLogger("job queue");

class JobQueue {
    private runningPromise: Promise<void> | null = null;

    start(): Promise<void> {
        if (!this.runningPromise) {
            this.runningPromise = this.run().finally(() => {
                this.runningPromise = null;
            });
        }

        return this.runningPromise;
    }

    private async run() {
        while (true) {
            const shouldContinue = await ResultAsync.combine([
                getSeries(),
                takeAllPendingJobs(),
            ])
                .andThen(([seriesArr, jobs]) => {
                    logger.info(`Found ${jobs.length} pending jobs`);

                    if (jobs.length === 0) {
                        return okAsync(false);
                    }

                    return jobs
                        .reduce((acc: ResultAsync<void, DbError>, job) => {
                            return acc.andThen(() =>
                                this.processJob(seriesArr, job),
                            );
                        }, okAsync())
                        .map(() => true);
                })
                .andThen(() =>
                    ResultAsync.fromPromise(cleanQueue(), error => ({
                        type: "unknown_db_error",
                        error,
                    })),
                )
                .orElse(error => {
                    logger.error(error);
                    return errAsync(error);
                })
                .match(
                    shouldContinue => shouldContinue,
                    () => false,
                );

            if (!shouldContinue) {
                break;
            }
        }
    }

    private processJob(
        seriesArr: Series[],
        job: { id: number; markUrl: string },
    ): ResultAsync<void, DbError> {
        const ambiguousSeriesIds: number[] = [];

        for (const series of seriesArr) {
            if (!new RegExp(series.pattern, "i").test(job.markUrl)) {
                continue;
            }

            if (series.matchType === "deterministic") {
                return assignMarkToSeries(job.markUrl, series.id)
                    .andThen(markUrl =>
                        markUrl ? deleteMark(markUrl) : okAsync(null),
                    )
                    .andThen(deleted =>
                        deleted?.categoryId != null
                            ? updateMark(
                                  job.markUrl,
                                  undefined,
                                  deleted.categoryId,
                              )
                            : okAsync(),
                    )
                    .andThen(() => completeJob(job.id));
            }

            ambiguousSeriesIds.push(series.id);
        }

        if (ambiguousSeriesIds.length === 0) {
            return completeJob(job.id);
        }

        return replaceMarkSeriesCandidates(
            job.markUrl,
            ambiguousSeriesIds,
        ).andThen(() => completeJob(job.id));
    }
}

export const jobQueue = new JobQueue();
