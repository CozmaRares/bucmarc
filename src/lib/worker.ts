import { parentPort } from "node:worker_threads";
import {
    getSeries,
    assignMarkToSeries,
    deleteMark,
    type DbError,
} from "@/db/dal";
import { createLogger } from "./logger";
import { okAsync, ResultAsync } from "neverthrow";
import { completeJob, takeFirstPendingJob } from "@/db/dal/jobs";

if (!parentPort) {
    throw new Error("Must be run as a worker");
}

export type WorkerResult =
    | {
          success: true;
          result: ProcessResult;
      }
    | {
          success: false;
          error: unknown;
      };

parentPort.on("message", async (id: number) => {
    const logger = createLogger(`worker-${id}`);
    logger.info("Starting");

    const result: WorkerResult = await updateSeriesMark().match(
        result => ({ success: true, result }),
        error => ({ success: false, error }),
    );

    logger.info("Done with result", { result });
    parentPort!.postMessage(result);
});

type ProcessResult = "no work" | "match" | "no match";

function updateSeriesMark(): ResultAsync<ProcessResult, DbError> {
    return takeFirstPendingJob().andThen(job => {
        if (job === null) {
            return okAsync("no work" as const);
        }
        return getSeries().andThen(seriesArr => {
            for (const series of seriesArr) {
                const pattern = new RegExp(series.pattern);
                if (pattern.test(job.markUrl)) {
                    return assignMarkToSeries(job.markUrl, series.id)
                        .andThen(markUrl => {
                            createLogger("worker-aaa").debug(markUrl);
                            return markUrl ? deleteMark(markUrl) : okAsync();
                        })
                        .andThen(() => completeJob(job.id))
                        .map(() => "match" as const);
                }
            }

            return completeJob(job.id).map(() => "no match" as const);
        });
    });
}
