import {
    getSeries,
    assignMarkToSeries,
    type DbError,
    cleanQueue,
    completeJob,
    takeNextPendingJob,
    replaceMarkSeriesCandidates,
    isNotFoundMarkError,
    withDatabaseConnection,
} from "@/db/dal";
import type { Series } from "@/db/dal";
import { createLogger } from "@/lib/logger";
import { okAsync, ResultAsync, errAsync } from "neverthrow";

const logger = createLogger("job queue");
const COMPLETED_JOB_RETENTION_MS = 24 * 60 * 60 * 1000;

class JobQueue {
    private runningPromise: Promise<void> | null = null;
    private runRequested = false;

    start(): Promise<void> {
        this.runRequested = true;

        if (!this.runningPromise) {
            this.runningPromise = withDatabaseConnection(
                () => this.runRequestedWork(),
                { isolated: true },
            ).finally(() => {
                this.runningPromise = null;
            });
        }

        return this.runningPromise;
    }

    private async runRequestedWork() {
        do {
            this.runRequested = false;

            try {
                await this.run();
            } finally {
                await cleanQueue(
                    new Date(Date.now() - COMPLETED_JOB_RETENTION_MS),
                );
            }
        } while (this.runRequested);
    }

    private async run() {
        let shouldContinue = true;

        while (shouldContinue) {
            shouldContinue = await ResultAsync.combine([
                getSeries(),
                takeNextPendingJob(),
            ])
                .andThen(([seriesArr, job]) => {
                    logger.info(
                        job ? `Processing job ${job.id}` : "Queue empty",
                    );

                    if (!job) {
                        return okAsync(false);
                    }

                    return this.processJob(seriesArr, job).map(() => true);
                })
                .orElse(error => {
                    logger.error(error);
                    return errAsync(error);
                })
                .match(
                    shouldContinue => shouldContinue,
                    () => false,
                );
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
                    .orElse(error =>
                        isNotFoundMarkError(error)
                            ? okAsync()
                            : errAsync(error),
                    )
                    .andThen(() => completeJob(job.id));
            }

            ambiguousSeriesIds.push(series.id);
        }

        if (ambiguousSeriesIds.length === 0) {
            return completeJob(job.id);
        }

        return replaceMarkSeriesCandidates(job.markUrl, ambiguousSeriesIds)
            .orElse(error =>
                isNotFoundMarkError(error) ? okAsync() : errAsync(error),
            )
            .andThen(() => completeJob(job.id));
    }
}

export const jobQueue = new JobQueue();
