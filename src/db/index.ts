import { db } from "./connection";
import { eq, isNotNull, and, sql, desc, isNull } from "drizzle-orm";
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
    type SharingAlreadyEnabledError,
    sharingAlreadyEnabledError,
    type CategoryFKError,
} from "./errors";

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
export type Mark = Awaited<ReturnType<typeof _getMarks>>[number];

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
export type Category = Awaited<ReturnType<typeof _getCategories>>[number];

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

async function _getCategoryById(id: number) {
    const categories = await _getCategories().where(
        eq(schema.categories.id, id),
    );

    if (categories.length === 0) {
        return null;
    }

    return categories[0]!;
}
export function getCategoryById(
    id: number,
): ResultAsync<Category, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _getCategoryById(id),
        unknownDbError,
    ).andThen(category =>
        category ? okAsync(category) : errAsync(notFoundCategoryError()),
    );
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
    await db.delete(schema.marks).where(eq(schema.marks.url, url));
}
export function deleteMark(url: string): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(_deleteMark(url), unknownDbError);
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
    await db
        .update(schema.categories)
        .set({ name })
        .where(eq(schema.categories.id, id));
}
export function renameCategory(
    id: number,
    name: string,
): ResultAsync<void, DuplicateCategoryNameError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _renameCategory(id, name),
        maybeDuplicateCategoryNameError,
    );
}

async function _deleteCategory(id: number) {
    await db.transaction(async tx => {
        await tx
            .update(schema.marks)
            .set({ categoryId: null })
            .where(eq(schema.marks.categoryId, id));

        await tx.delete(schema.categories).where(eq(schema.categories.id, id));
    });
}
export function deleteCategory(id: number): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(_deleteCategory(id), unknownDbError);
}

async function _updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): Promise<void> {
    await db
        .update(schema.marks)
        .set({
            title,
            categoryId,
        })
        .where(eq(schema.marks.url, url));
}
export function updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): ResultAsync<void, UnknownDbError | CategoryFKError> {
    return ResultAsync.fromPromise(
        _updateMark(url, title, categoryId),
        maybeCategoryFKError,
    );
}

async function _enableCategorySharing(
    categoryId: number,
): Promise<string | null>;
async function _enableCategorySharing(
    categoryId: number,
    rotate: true,
): Promise<string>;
async function _enableCategorySharing(categoryId: number, rotate = false) {
    if (!rotate) {
        const existing = await _getCategories().where(
            and(
                eq(schema.categories.id, categoryId),
                isNotNull(schema.categories.shareTokenHash),
            ),
        );

        if (existing.length > 0) {
            return null;
        }
    }

    const token = generateShareToken();

    await db
        .update(schema.categories)
        .set({ shareTokenHash: hashShareToken(token) })
        .where(eq(schema.categories.id, categoryId));

    return token;
}
export function enableCategorySharing(
    categoryId: number,
): ResultAsync<string, UnknownDbError | SharingAlreadyEnabledError> {
    return ResultAsync.fromPromise(
        _enableCategorySharing(categoryId),
        unknownDbError,
    ).andThen(token =>
        token ? okAsync(token) : errAsync(sharingAlreadyEnabledError()),
    );
}

async function _disableCategorySharing(categoryId: number) {
    await db
        .update(schema.categories)
        .set({ shareTokenHash: null })
        .where(eq(schema.categories.id, categoryId));
}
export function disableCategorySharing(
    categoryId: number,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        _disableCategorySharing(categoryId),
        unknownDbError,
    );
}

function _rotateCategorySharing(categoryId: number) {
    return _enableCategorySharing(categoryId, true);
}
export function rotateCategorySharing(
    categoryId: number,
): ResultAsync<string, UnknownDbError> {
    return ResultAsync.fromPromise(
        _rotateCategorySharing(categoryId),
        unknownDbError,
    );
}

function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}
