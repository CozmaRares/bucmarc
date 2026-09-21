import { dbQuery } from "@/db/connection";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    maybeCategoryFKError,
    type CategoryFKError,
    isUniqueConstraintError,
    logErrorAndCreate,
} from "./utils";

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

export const notFoundMarkError = (): NotFoundMarkError => ({
    type: "not_found_mark",
});
export function isNotFoundMarkError(error: {
    type: string;
}): error is NotFoundMarkError {
    return error.type === "not_found_mark";
}

async function _saveMark(url: string) {
    await dbQuery("tx insert mark and job", db =>
        db.transaction(tx => {
            tx.insert(schema.marks).values({ url }).run();
            tx.insert(schema.jobs)
                .values({ markUrl: url, status: "pending" })
                .run();
        }),
    );
}

export function saveMark(
    url: string,
): ResultAsync<void, DuplicateMarkUrlError | UnknownDbError> {
    return ResultAsync.fromPromise(_saveMark(url), maybeDuplicateMarkUrlError);
}

async function _deleteMark(url: string) {
    const marks = await dbQuery("delete mark", db =>
        db.delete(schema.marks).where(eq(schema.marks.url, url)).returning({
            url: schema.marks.url,
            categoryId: schema.marks.categoryId,
        }),
    );
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
    const marks = await dbQuery("update mark", db =>
        db
            .update(schema.marks)
            .set({
                title,
                categoryId,
            })
            .where(eq(schema.marks.url, url))
            .returning({ url: schema.marks.url }),
    );
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

async function _recordMarkClick(url: string): Promise<boolean> {
    const marks = await dbQuery("record mark click", db =>
        db
            .update(schema.marks)
            .set({ lastClickedAt: new Date() })
            .where(eq(schema.marks.url, url))
            .returning({ url: schema.marks.url }),
    );
    return marks.length > 0;
}

export function recordMarkClick(
    url: string,
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _recordMarkClick(url),
        unknownDbError,
    ).andThen(updated => (updated ? okAsync() : errAsync(notFoundMarkError())));
}
