import { Worker } from "node:worker_threads";
import path from "node:path";
import type { WorkerResult } from "./worker";
import { cleanQueue } from "@/db/dal/jobs";
import { createLogger } from "./logger";

class WorkerPool {
    private static readonly CLEAN_INTERVAL = 10;

    private readonly workers: Worker[] = [];
    private readonly idle: Worker[] = [];

    private cleaning = false;
    private processedJobs = 0;

    private nextId = 1;

    constructor(size: number) {
        const workerPath = path.join(__dirname, "worker.ts");

        for (let i = 0; i < size; i++) {
            const worker = new Worker(workerPath);

            worker.on("message", async (result: WorkerResult) => {
                let dispatch = false;

                if (!result.success) {
                    createLogger("workerPool").error(result.error);
                    await this.runQueueMaintenance();
                } else if (result.result !== "no work") {
                    this.processedJobs++;

                    if (this.processedJobs % WorkerPool.CLEAN_INTERVAL === 0) {
                        await this.runQueueMaintenance();
                    }

                    dispatch = true;
                }

                this.idle.push(worker);

                if (dispatch) {
                    this.dispatchWorker();
                }
            });

            worker.on("error", (error: unknown) =>
                createLogger("workerPool").error(error),
            );

            this.workers.push(worker);
            this.idle.push(worker);
        }

        void this.runQueueMaintenance();
    }

    dispatchWorker() {
        const worker = this.idle.pop();

        if (worker) {
            worker.postMessage(this.nextId++);
        }
    }

    private async runQueueMaintenance() {
        if (this.cleaning) {
            return;
        }

        this.cleaning = true;

        try {
            await cleanQueue();
        } finally {
            this.cleaning = false;
        }
    }
}

export const workerPool = new WorkerPool(2);
