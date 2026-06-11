import { db } from "./connection";
import { eq, sql, desc, isNull } from "drizzle-orm";
import * as schema from "./schema";
import { createHash, randomBytes } from "node:crypto";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    maybeDuplicateMarkUrlError,
    unknownDbError,
    type DuplicateMarkUrlError,
    type DuplicateCategoryNameError,
    type UnknownDbError,
    maybeDuplicateCategoryNameError,
    type NotFoundCategoryError,
    notFoundCategoryError,
    maybeCategoryFKError,
    type CategoryFKError,
    type NotFoundMarkError,
    notFoundMarkError,
} from "./errors";

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

export type Category = Awaited<ReturnType<typeof _getCategories>>[number];
function _getCategories() {
    const sharingEnabled = sql<boolean>`${schema.categories.shareTokenHash} is not null`;
    return db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            sharingEnabled,
        })
        .from(schema.categories)
        .orderBy(desc(schema.categories.updatedAt));
}
export function getCategories(): ResultAsync<Category[], UnknownDbError> {
    return ResultAsync.fromPromise(_getCategories(), unknownDbError);
}

function _getCategorizedMarks() {
    return db.query.categories.findMany({
        with: {
            marks: {
                columns: {
                    url: true,
                    title: true,
                    categoryId: true,
                },
                orderBy: [desc(schema.marks.updatedAt)],
            },
        },
        columns: {
            id: true,
            name: true,
        },
        extras: {
            sharingEnabled:
                sql<boolean>`${schema.categories.shareTokenHash} is not null`.as(
                    "sharing_enabled",
                ),
        },
        orderBy: [desc(schema.categories.updatedAt)],
    });
}
export function getCategorizedMarks(): ResultAsync<
    Array<Category & { marks: Mark[] }>,
    UnknownDbError
> {
    return ResultAsync.fromPromise(_getCategorizedMarks(), unknownDbError);
}

function _getUncategorizedMarks() {
    return _getMarks().where(isNull(schema.marks.categoryId));
}
export function getUncategorizedMarks(): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(_getUncategorizedMarks(), unknownDbError);
}

async function _getCategoryByShareToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const categories = await _getCategories().where(
        eq(schema.categories.shareTokenHash, hashShareToken(token)),
    );

    if (categories.length === 0) {
        return null;
    }

    return categories[0]!;
}
export function getCategoryByShareToken(
    token: string | undefined,
): ResultAsync<Category, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _getCategoryByShareToken(token),
        unknownDbError,
    ).andThen(category =>
        category ? okAsync(category) : errAsync(notFoundCategoryError()),
    );
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

async function _getCategoryWithMarksByShareToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const category = await db.query.categories.findFirst({
        where: eq(schema.categories.shareTokenHash, hashShareToken(token)),
        columns: {
            id: true,
            name: true,
        },
        with: {
            marks: {
                columns: {
                    url: true,
                    title: true,
                    categoryId: true,
                },
                orderBy: [desc(schema.marks.updatedAt)],
            },
        },
    });

    return category ?? null;
}
export function getCategoryWithMarksByShareToken(
    token: string | undefined,
): ResultAsync<
    Pick<Category, "id" | "name"> & { marks: Mark[] },
    UnknownDbError | NotFoundCategoryError
> {
    return ResultAsync.fromPromise(
        _getCategoryWithMarksByShareToken(token),
        unknownDbError,
    ).andThen(category =>
        category ? okAsync(category) : errAsync(notFoundCategoryError()),
    );
}

async function _saveMark(url: string, title?: string | null) {
    await db.insert(schema.marks).values({ url, title });
}
export function saveMark(
    url: string,
    title?: string | null,
): ResultAsync<void, DuplicateMarkUrlError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _saveMark(url, title),
        maybeDuplicateMarkUrlError,
    );
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
        deleted =>
            deleted ? okAsync(undefined) : errAsync(notFoundMarkError()),
    );
}

async function _createCategory(name: string) {
    await db.insert(schema.categories).values({ name });
}
export function createCategory(
    name: string,
): ResultAsync<void, DuplicateCategoryNameError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _createCategory(name),
        maybeDuplicateCategoryNameError,
    );
}

async function _renameCategory(id: number, name: string) {
    const categories = await db
        .update(schema.categories)
        .set({ name })
        .where(eq(schema.categories.id, id))
        .returning({ id: schema.categories.id });
    return categories.length > 0;
}
export function renameCategory(
    id: number,
    name: string,
): ResultAsync<
    void,
    DuplicateCategoryNameError | UnknownDbError | NotFoundCategoryError
> {
    return ResultAsync.fromPromise(
        _renameCategory(id, name),
        maybeDuplicateCategoryNameError,
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundCategoryError()),
    );
}

async function _deleteCategory(id: number) {
    const categories = await db
        .delete(schema.categories)
        .where(eq(schema.categories.id, id))
        .returning({ id: schema.categories.id });
    return categories.length > 0;
}
export function deleteCategory(
    id: number,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(_deleteCategory(id), unknownDbError).andThen(
        deleted =>
            deleted ? okAsync(undefined) : errAsync(notFoundCategoryError()),
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
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundMarkError()),
    );
}

async function _enableCategorySharing(
    categoryId: number,
): Promise<string | null> {
    const token = generateShareToken();
    const categories = await db
        .update(schema.categories)
        .set({ shareTokenHash: hashShareToken(token) })
        .where(eq(schema.categories.id, categoryId))
        .returning({ id: schema.categories.id });
    if (categories.length === 0) {
        return null;
    }

    return token;
}
export function enableCategorySharing(
    categoryId: number,
): ResultAsync<string, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _enableCategorySharing(categoryId),
        unknownDbError,
    ).andThen(token =>
        token ? okAsync(token) : errAsync(notFoundCategoryError()),
    );
}

async function _disableCategorySharing(categoryId: number) {
    const categories = await db
        .update(schema.categories)
        .set({ shareTokenHash: null })
        .where(eq(schema.categories.id, categoryId))
        .returning({ id: schema.categories.id });

    return categories.length > 0;
}
export function disableCategorySharing(
    categoryId: number,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _disableCategorySharing(categoryId),
        unknownDbError,
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundCategoryError()),
    );
}

function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}
