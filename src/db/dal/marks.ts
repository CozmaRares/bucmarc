import { db } from "../connection";
import { eq } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    maybeCategoryFKError,
    type CategoryFKError,
    isUniqueConstraintError,
    logErrorAndCreate,
} from "./utils";
import { createJob } from "./jobs";

export type DuplicateMarkUrlError = { type: "duplicate_mark_url" };
export type NotFoundMarkError = { type: "not_found_mark" };

const maybeDuplicateMarkUrlError = logErrorAndCreate(
    (error: unknown): DuplicateMarkUrlError | UnknownDbError =>
        isUniqueConstraintError(error)
            ? { type: "duplicate_mark_url" }
            : { type: "unknown_db_error", error },
);
export function isDuplicateMarkUrlError(error: {
    type: string;
}): error is DuplicateMarkUrlError {
    return error.type === "duplicate_mark_url";
}

const notFoundMarkError = (): NotFoundMarkError => ({
    type: "not_found_mark",
});
export function isNotFoundMarkError(error: {
    type: string;
}): error is NotFoundMarkError {
    return error.type === "not_found_mark";
}

async function _saveMark(url: string) {
    await db.insert(schema.marks).values({ url });
}

export function saveMark(
    url: string,
): ResultAsync<void, DuplicateMarkUrlError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _saveMark(url),
        maybeDuplicateMarkUrlError,
    ).andThen(() => createJob(url));
}

async function _deleteMark(url: string) {
    const marks = await db
        .delete(schema.marks)
        .where(eq(schema.marks.url, url))
        .returning({
            url: schema.marks.url,
            categoryId: schema.marks.categoryId,
        });
    return marks[0] ?? null;
}
export function deleteMark(
    url: string,
): ResultAsync<
    { categoryId: number | null },
    UnknownDbError | NotFoundMarkError
> {
    return ResultAsync.fromPromise(_deleteMark(url), unknownDbError).andThen(
        deleted =>
            deleted
                ? okAsync({ categoryId: deleted.categoryId })
                : errAsync(notFoundMarkError()),
    );
}

async function _updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): Promise<boolean> {
    const marks = await db
        .update(schema.marks)
        .set({
            title,
            categoryId,
        })
        .where(eq(schema.marks.url, url))
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): ResultAsync<void, UnknownDbError | CategoryFKError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _updateMark(url, title, categoryId),
        maybeCategoryFKError,
    ).andThen(updated => (updated ? okAsync() : errAsync(notFoundMarkError())));
}
