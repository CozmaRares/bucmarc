import {
    getSeries,
    assignMarkToSeries,
    deleteMark,
    updateMark,
    type DbError,
} from "@/db/dal";
import { cleanQueue, completeJob, takeAllPendingJobs } from "@/db/dal/jobs";
import { createLogger } from "./logger";
import { okAsync, ResultAsync } from "neverthrow";

const logger = createLogger("job queue");

class JobQueue {
    private running = false;

    start() {
        if (this.running) {
            return;
        }

        void this.run();
    }

    private async run() {
        this.running = true;

        await ResultAsync.combine([getSeries(), takeAllPendingJobs()])
            .andThen(([seriesArr, jobs]) => {
                logger.info(`Found ${jobs.length} pending jobs`);

                return jobs.reduce(function reduce(
                    acc: ResultAsync<void, DbError>,
                    job,
                ): ResultAsync<void, DbError> {
                    return acc.andThen(() => {
                        const matched = seriesArr.find(series =>
                            new RegExp(series.pattern).test(job.markUrl),
                        );

                        if (!matched) {
                            return completeJob(job.id);
                        }

                        return assignMarkToSeries(job.markUrl, matched.id)
                            .andThen(markUrl =>
                                markUrl ? deleteMark(markUrl) : okAsync(null),
                            )
                            .andThen(deleted =>
                                deleted?.categoryId != null
                                    ? updateMark(job.markUrl, undefined, deleted.categoryId)
                                    : okAsync(),
                            )
                            .andThen(() => completeJob(job.id));
                    });
                }, okAsync());
            })
            .match(cleanQueue, logger.error);

        this.running = false;
    }
}

export const jobQueue = new JobQueue();
