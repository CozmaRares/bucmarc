import { db } from "../connection";
import { and, desc, eq, isNull } from "drizzle-orm";
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

export type DuplicateMarkUrlError = { type: "duplicate_mark_url" };
export type NotFoundMarkError = { type: "not_found_mark" };

export const maybeDuplicateMarkUrlError = logErrorAndCreate(
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

export type Mark = Awaited<ReturnType<typeof _getMarks>>[number];
function _getMarks() {
    return db
        .select({
            url: schema.marks.url,
            title: schema.marks.title,
            categoryId: schema.marks.categoryId,
        })
        .from(schema.marks)
        .orderBy(desc(schema.marks.updatedAt));
}
export function getMarks(): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(_getMarks(), unknownDbError);
}

function _getMarksByCategoryId(categoryId: number) {
    return _getMarks().where(eq(schema.marks.categoryId, categoryId));
}
export function getMarksByCategoryId(
    categoryId: number,
): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(
        _getMarksByCategoryId(categoryId),
        unknownDbError,
    );
}

async function _saveMark(url: string, categoryId?: number) {
    await db.insert(schema.marks).values({ url, categoryId });
}
export function saveMark(
    url: string,
): ResultAsync<void, DuplicateMarkUrlError | UnknownDbError> {
    return ResultAsync.fromPromise(_saveMark(url), maybeDuplicateMarkUrlError);
}

export function saveMarkInCategory(
    categoryId: number,
    url: string,
): ResultAsync<void, DuplicateMarkUrlError | CategoryFKError | UnknownDbError> {
    return ResultAsync.fromPromise(_saveMark(url, categoryId), error => {
        const duplicate = maybeDuplicateMarkUrlError(error);

        if (isDuplicateMarkUrlError(duplicate)) {
            return duplicate;
        }

        return maybeCategoryFKError(error);
    });
}

async function _deleteMark(url: string) {
    const marks = await db
        .delete(schema.marks)
        .where(eq(schema.marks.url, url))
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function deleteMark(
    url: string,
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(_deleteMark(url), unknownDbError).andThen(
        deleted => (deleted ? okAsync() : errAsync(notFoundMarkError())),
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

async function _updateMarkTitleInCategory(
    categoryId: number,
    url: string,
    title: string | null | undefined,
): Promise<boolean> {
    const marks = await db
        .update(schema.marks)
        .set({ title })
        .where(
            and(
                eq(schema.marks.url, url),
                eq(schema.marks.categoryId, categoryId),
            ),
        )
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function updateMarkTitleInCategory(
    categoryId: number,
    url: string,
    title: string | null | undefined,
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _updateMarkTitleInCategory(categoryId, url, title),
        unknownDbError,
    ).andThen(updated => (updated ? okAsync() : errAsync(notFoundMarkError())));
}

async function _deleteMarkInCategory(categoryId: number, url: string) {
    const marks = await db
        .delete(schema.marks)
        .where(
            and(
                eq(schema.marks.url, url),
                eq(schema.marks.categoryId, categoryId),
            ),
        )
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function deleteMarkInCategory(
    categoryId: number,
    url: string,
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _deleteMarkInCategory(categoryId, url),
        unknownDbError,
    ).andThen(deleted => (deleted ? okAsync() : errAsync(notFoundMarkError())));
}
