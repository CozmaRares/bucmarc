import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { dbQuery } from "../connection";
import * as schema from "../schema";
import { unknownDbError } from "./utils";
import { and, eq, lt, asc, inArray } from "drizzle-orm";

export type NotFoundJobError = { type: "not_found_job" };

const notFoundJobError = (): NotFoundJobError => ({
    type: "not_found_job",
});

async function _createJob(markUrl: string) {
    await dbQuery("create job", db =>
        db.insert(schema.jobs).values({ markUrl, status: "pending" }),
    );
}
export function createJob(markUrl: string) {
    return ResultAsync.fromPromise(_createJob(markUrl), unknownDbError);
}

function _takeAllPendingJobs() {
    return dbQuery("take all pending jobs", db =>
        db
            .update(schema.jobs)
            .set({ status: "running" })
            .where(
                inArray(
                    schema.jobs.id,
                    db
                        .select({ id: schema.jobs.id })
                        .from(schema.jobs)
                        .where(eq(schema.jobs.status, "pending"))
                        .orderBy(asc(schema.jobs.id)),
                ),
            )
            .returning(),
    );
}
export function takeAllPendingJobs() {
    return ResultAsync.fromPromise(_takeAllPendingJobs(), unknownDbError);
}

async function _completeJob(id: number) {
    const jobs = await dbQuery("complete job", db =>
        db
            .update(schema.jobs)
            .set({ status: "done" })
            .where(eq(schema.jobs.id, id))
            .returning({ id: schema.jobs.id }),
    );
    return jobs.length > 0;
}
export function completeJob(id: number) {
    return ResultAsync.fromPromise(_completeJob(id), unknownDbError).andThen(
        deleted => (deleted ? okAsync() : errAsync(notFoundJobError())),
    );
}

export async function cleanQueue() {
    const deleteCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    await Promise.all([
        dbQuery("reset failed jobs to pending", db =>
            db
                .update(schema.jobs)
                .set({ status: "pending" })
                .where(eq(schema.jobs.status, "running")),
        ),

        dbQuery("delete old jobs", db =>
            db
                .delete(schema.jobs)
                .where(
                    and(
                        eq(schema.jobs.status, "done"),
                        lt(schema.jobs.updatedAt, deleteCutoff),
                    ),
                ),
        ),
    ]);
}
